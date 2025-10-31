import Attendance from "../model/Attendance.js"
import User from "../model/User.js"
import { STATUS } from "../../constants/status.js"
import webhook from "../utils/webhook.js"
import { biometricIn, biometricBreakIn, biometricBreakOut } from "../utils/biometric.js"

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
                    res.status(200).send('OK');
                    return;
                }

                if (ac.employeeNoString || (ac.name && ac.name !== 'Unknown')) {
                    const ipAddress = event.ipAddress;

                    // switch (ipAddress) {
                    //   case IP.INDOOR:
                    //     console.log(`Bio In! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
                    //     break;
                    //   case IP.OUTDOOR:
                    //     console.log(`Bio Out! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
                    //     break;
                    //   case IP.ADMINDOOR:
                    //     console.log(`Admin Bio! ${ipAddress} event at ${event.dateTime} - Employee: ${ac.employeeNoString}, Name: ${ac.name}`);
                    //     break;
                    //   default:
                    //     break;
                    // }
                    const user = await User.getById(ac.employeeNoString);
                    if (user) {
                        const userId = user._id.toString();
                        // Get the attendance first, tapos determine if 
                        // there is already record
                        const [attendance] = await Attendance.getById(userId);
                        if (attendance) {
                            const attendanceId = attendance._id.toString();
                            const breaks = attendance.breaks || [];
                            const totalBreak = attendance.totalBreak || 0;
                            const status = attendance.status;

                            if (status === STATUS.WORKING) {
                                await biometricBreakIn(attendanceId, breaks, totalBreak);
                            }
                            if (status === STATUS.ON_BREAK) {
                                await biometricBreakOut(attendanceId, breaks);
                            }
                        } else {
                            console.log("No record! So, add attendance!");
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
                                console.error(error);
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
                        } catch (error) {
                            console.error(error);
                        }
                        const message = `New user added: ${ac.name} (Employee ID: ${ac.employeeNoString}) has been added to the system.`;
                        await webhook(message);
                        console.error(error);
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