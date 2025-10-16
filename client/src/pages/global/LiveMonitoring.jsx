import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../../utils/axios";
import { AnimatePresence, motion } from "framer-motion";

const URL = import.meta.env.VITE_API_RENDER_BASE_URL;
const socket = io(URL, { transports: ["websocket", "polling"] });

export default function LiveBreaks() {
  const [attendances, setAttendances] = useState([]);

  const sortAttendance = (attendance) => {
    const sortedAttendance = [...attendance].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    setAttendances(sortedAttendance);
  };

  useEffect(() => {
    socket.on("attendances-updated", sortAttendance);
    return () => socket.off("attendances-updated", sortAttendance);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await api.get("/attendance/get-all-onbreak");
        sortAttendance(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 rounded-md">
        <AnimatePresence>
          {attendances.map((attendance) => (
            <motion.div
              key={attendance._id + attendance.updatedAt}
              layout
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="h-20 bg-(--primary-color) flex items-center justify-center rounded-md text-white">
                {attendance.firstName} {attendance.lastName}
              </p>
              {/* <div className="flex flex-col mt-2">
                {attendance.breaks?.map((brk, index) => (
                  <span key={index} className="text-sm text-gray-700">
                    Break {index + 1}: {brk.startTime} - {brk.endTime}
                  </span>
                ))}
              </div> */}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
