import Attendance from "../model/Attendance.js";
import User from "../model/User.js";
import { STATUS } from "../../constants/status.js";
import webhook from "../utils/webhook.js";
import {
  biometricIn,
  biometricOut,
  biometricBreakIn,
  biometricBreakOut,
} from "../utils/biometric.js";
import { DateTime } from "luxon";
import { IP } from "../../constants/biometricsIp.js";

const lastEventMap = new Map();
const THROTTLE_MS = 5000;
const CLEANUP_MS = 60 * 60 * 1000;

// Periodically clear old entries from the event map
setInterval(() => {
  const now = Date.now();
  for (const [employeeId, timestamp] of lastEventMap.entries()) {
    if (now - timestamp > CLEANUP_MS) {
      lastEventMap.delete(employeeId);
    }
  }
}, CLEANUP_MS);

export const getEvents = async (req, res) => {
  try {
    let data = req.body;

    const jsonStart = data.indexOf("{");
    const jsonEnd = data.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = data.substring(jsonStart, jsonEnd + 1);
      const event = JSON.parse(jsonStr);

      if (event.AccessControllerEvent) {
        const ac = event.AccessControllerEvent;

        // Ignore invalid verification attempts
        if (!ac.employeeNoString && !ac.name && ac.verifyMode === "invalid") {
          return res.status(200).send("OK");
        }

        // Proceed only if a valid employee or known name is found
        if (ac.employeeNoString && ac.name && ac.name !== "Unknown") {
          const ipAddress = event.ipAddress;
          const now = Date.now();
          // const lastTime = lastEventMap.get(ac.employeeNoString) || 0;

          // // Throttle duplicate events within a short time window
          // if (now - lastTime < THROTTLE_MS) {
          //     console.log(`Event for ${ac.name} ignored due to throttle`);
          //     return res.status(200).send("OK");
          // }
          // lastEventMap.set(ac.employeeNoString, now);

          // Ignore events from specific devices
          if (ipAddress === IP.ADMINDOOR) {
            return res.status(200).send("OK");
          }

          switch (ipAddress) {
            case IP.BIO_IN:
              console.log(
                `Bio In (${ipAddress})! Name: ${ac.name} ID: ${ac.employeeNoString}`
              );
              break;
            case IP.BIO_OUT:
              console.log(
                `Bio Out (${ipAddress})! Name: ${ac.name} ID: ${ac.employeeNoString}`
              );
              break;
            default:
              break;
          }

          const user = await User.getById(ac.employeeNoString);
          if (user) {
            const userId = user._id.toString();
            const [attendance] = await Attendance.getById(userId, "asc");

            // TODO: remove soon;
            await User.update(userId, "isValidEmployeeId", true);

            if (attendance) {
              const attendanceId = attendance._id.toString();
              const breaks = attendance.breaks || [];
              const totalBreak = attendance.totalBreak || 0;
              const status = attendance.status;

              const shiftEnd = DateTime.fromJSDate(attendance.shiftEnd).toUTC();
              const nowTime = DateTime.utc();

              if (shiftEnd < nowTime) {
                if (status === STATUS.ON_BREAK) {
                  await biometricBreakOut(attendanceId, breaks);
                }
                // Shift already ended
                await biometricOut(attendanceId);
                console.log(
                  `Employee ${ac.name} is about to go out of the office`
                );
              } else {
                // Prevent the scenario where an employee logs in but doesn't actually enter the area
                if (status === STATUS.WORKING && ipAddress === IP.BIO_IN) {
                  console.log(
                    `Ignoring event at ${IP.BIO_IN}: Employee ${ac.name} attempted BIO_IN while already in WORKING status.`
                  );
                  return res.status(200).send("OK");
                }

                // Prevent the scenario where an employee logs out without actually leaving the production area
                if (status === STATUS.ON_BREAK && ipAddress === IP.BIO_OUT) {
                  console.log(
                    `Ignoring event at ${IP.BIO_OUT}: Employee ${ac.name} attempted BIO_OUT while already in ON_BREAK status.`
                  );
                  return res.status(200).send("OK");
                }

                if (status === STATUS.WORKING) {
                  console.log(
                    `Employee ${ac.name} is WORKING, processing break-in`
                  );
                  try {
                    await biometricBreakIn(attendanceId, breaks, totalBreak);
                    console.log(`Break-in successful for user ${ac.name}`);
                  } catch (error) {
                    console.error(`Break-in failed:`, error);
                    const stack = (error.stack || error.message || "").slice(
                      0,
                      1500
                    );
                    const message =
                      `**Bio Break In Error:** Break-in processing failed.\n` +
                      `Employee: ${user.firstName} ${user.lastName}, ID: ${ac.employeeNoString}\n\n` +
                      `**Technical details:**\n\n` +
                      `\`\`\`\n${stack}\n\`\`\``;
                    await webhook(message);
                  }
                } else if (status === STATUS.ON_BREAK) {
                  console.log(
                    `Employee ${ac.name} is ON_BREAK, processing break-out`
                  );
                  try {
                    await biometricBreakOut(attendanceId, breaks);
                    console.log(`Break-out successful for user ${ac.name}`);
                  } catch (error) {
                    console.error(`Break-out failed:`, error);
                    const stack = (error.stack || error.message || "").slice(
                      0,
                      1500
                    );
                    const message =
                      `**Bio Break Out Error:** Break-out processing failed.\n` +
                      `Employee: ${user.firstName} ${user.lastName}, ID: ${ac.employeeNoString}\n\n` +
                      `**Technical details:**\n\n` +
                      `\`\`\`\n${stack}\n\`\`\``;
                    await webhook(message);
                  }
                } else {
                  await webhook("Errorr!");
                }
              }
            } else {
              // No existing attendance record
              try {
                await biometricIn(userId, ac.employeeNoString);
              } catch (error) {
                const stack = (error.stack || error.message || "").slice(
                  0,
                  1500
                );
                const message =
                  `**Bio Break In Error:** No matching schedule found for this time-in.\n` +
                  `Employee: ${ac.name}, ID: ${ac.employeeNoString}\n\n` +
                  `**Technical details:**\n\n` +
                  `\`\`\`\n${stack}\n\`\`\``;

                console.log(error);
                // await webhook(message);
              }
            }
          } else {
            console.log(
              `No registered user for ${ac.name} (Employee ID: ${ac.employeeNoString})`
            );
          }
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error parsing event:", error);
    res.status(200).send("OK");
  }
};
