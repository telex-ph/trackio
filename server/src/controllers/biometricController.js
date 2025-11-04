import Attendance from "../model/Attendance.js"
import User from "../model/User.js"
import { STATUS } from "../../constants/status.js"
import webhook from "../utils/webhook.js"
import { biometricIn, biometricOut, biometricBreakIn, biometricBreakOut } from "../utils/biometric.js"
import { DateTime } from "luxon";
import { BIO_IP } from "../../constants/biometricsIp.js"

export const getEvents = async (req, res) => {
    try {
        let data = req.body;

        const jsonStart = data.indexOf('{');
        const jsonEnd = data.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = data.substring(jsonStart, jsonEnd + 1);
            const event = JSON.parse(jsonStr);

            if (event.AccessControllerEvent) {
                const ac = event.AccessControllerEvent;
                if (!ac.employeeNoString && !ac.name && ac.verifyMode === 'invalid') {
                    return res.status(200).send('OK');
                }

                if (ac.employeeNoString || (ac.name && ac.name !== 'Unknown')) {
                    const ipAddress = event.ipAddress;

                    if (ipAddress === BIO_IP.ADMINDOOR) return res.status(200).send('OK');

                    const user = await User.getById(ac.employeeNoString);
                    if (user) {
                        const userId = user._id.toString();
                        // Get the attendance first, then determine if 
                        // there is already record
                        const [attendance] = await Attendance.getById(userId);
                        if (attendance) {
                            const attendanceId = attendance._id.toString();
                            const breaks = attendance.breaks || [];
                            const totalBreak = attendance.totalBreak || 0;
                            const status = attendance.status;
                            const shiftEnd = DateTime.fromJSDate(attendance.shiftEnd);

                            if (shiftEnd < DateTime.utc()) {
                                await biometricOut(attendanceId);
                                if (status === STATUS.ON_BREAK) {
                                    await biometricBreakOut(attendanceId, breaks);
                                }
                            } else {
                                if (status === STATUS.WORKING) {
                                    await biometricBreakIn(attendanceId, breaks, totalBreak);
                                }
                                if (status === STATUS.ON_BREAK) {
                                    await biometricBreakOut(attendanceId, breaks);
                                }
                            }
                        } else {
                            try {
                                await biometricIn(userId);
                            } catch (error) {
                                const stack = (error.stack || error.message || "").slice(0, 1500);
                                const message =
                                    `**Bio Break In Error:** No matching schedule found for this time-in.\n` +
                                    `Employee: ${ac.name}, ID: ${ac.employeeNoString}\n\n` +
                                    `**Technical details:**\n\n` +
                                    `\`\`\`\n${stack}\n\`\`\``;

                                await webhook(message);
                            }
                        }
                    } else {
                        const arrName = ac.name.split(" ");
                        const lastName = arrName[arrName.length - 1];
                        let firstName = "";
                        for (let i = 0; i < arrName.length - 1; i++) {
                            firstName += `${arrName[i]}`
                        }
                        const employeeId = ac.employeeNoString;
                        const newUser = {
                            employeeId: employeeId,
                            firstName: firstName,
                            lastName: lastName,
                            teamId: null,
                            email: null,
                            phoneNumber: null,
                            role: "agent",
                            password: "$2a$10$1jHppZ6SOnm4wnTMDg0kPOY9FHu/0L31MdP50WaeGmnVkLpeLPpau",
                            createdAt: new Date(),
                        };

                        try {
                            const user = await User.addUser(newUser)
                            console.log(user);
                            const message = `New user added: ${ac.name} (Employee ID: ${ac.employeeNoString}) has been added to the system.`;
                            await webhook(message);
                        } catch (error) {
                            const stack = (error.stack || error.message || "").slice(0, 1500);
                            const message =
                                `**Add User Error:** Unable to add the user to the system.\n`
                                    `Employee: ${ac.name}, ID: ${ac.employeeNoString}\n\n` +
                                `**Technical details:**\n\n` +
                                `\`\`\`\n${stack}\n\`\`\``;
                            await webhook(message);
                        }

                    }
                }
            }
        }
        res.status(200).send('OK');

    } catch (error) {
        console.error('Error parsing event:', error);
        res.status(200).send('OK');
    }
}