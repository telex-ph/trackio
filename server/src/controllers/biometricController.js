import Attendance from "../model/Attendance.js";
import User from "../model/User.js";
import { STATUS } from "../../constants/status.js";
import {
  biometricIn,
  biometricOut,
  biometricBreakIn,
  biometricBreakOut,
  biomtricCorrection,
} from "../utils/biometric.js";
import { DateTime } from "luxon";
import { IP } from "../../constants/biometricsIp.js";

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
          const now = event.dateTime;
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
            const attendances = await Attendance.getById(userId, "desc");
            const attendance =
              attendances.find((a) => {
                const shiftStart = DateTime.fromJSDate(a.shiftStart, {
                  zone: "utc",
                });
                const shiftEnd = DateTime.fromJSDate(a.shiftEnd, {
                  zone: "utc",
                });
                const nowTime = DateTime.now().toUTC();
                return shiftEnd > nowTime || shiftStart <= nowTime;
              }) || attendances[0];

            if (attendance) {
              const attendanceId = attendance._id.toString();
              const breaks = attendance.breaks || [];
              const totalBreak = attendance.totalBreak || 0;
              const status = attendance.status;

              const shiftStart = DateTime.fromJSDate(attendance.shiftStart, {
                zone: "utc",
              });
              const shiftEnd = DateTime.fromJSDate(attendance.shiftEnd, {
                zone: "utc",
              });
              const nowTime = DateTime.now().toUTC();

              console.log(
                `Name: ${ac.name} ID: ${userId} shiftEnd: ${shiftEnd} nowTime: ${nowTime}`
              );
              if (shiftEnd < nowTime) {
                if (status === STATUS.ON_BREAK) {
                  await biometricBreakOut(attendanceId, breaks);
                }
                // Shift already ended
                await biometricOut(attendanceId, now);
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
                  await biomtricCorrection(attendanceId);
                  return res.status(200).send("OK");
                }

                if (status === STATUS.WORKING) {
                  // Ignore breaks if the employee is not yet on shift
                  if (nowTime < shiftStart) {
                    console.log(
                      `Ignoring event at ${IP.BIO_OUT}: Employee ${ac.name} attempted BIO_OUT while not yet on shift.`
                    );
                    return res.status(200).send("OK");
                  }
                  console.log(
                    `Employee ${ac.name} is WORKING, processing break-in`
                  );
                  try {
                    await biometricBreakIn(
                      attendanceId,
                      breaks,
                      totalBreak,
                      now
                    );
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
                  }
                } else if (status === STATUS.ON_BREAK) {
                  console.log(
                    `Employee ${ac.name} is ON_BREAK, processing break-out`
                  );
                  try {
                    await biometricBreakOut(attendanceId, breaks, now);
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
                  }
                }
              }
            } else {
              // No existing attendance record
              try {
                await biometricIn(userId, ac.employeeNoString, now);
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
