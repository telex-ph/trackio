import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../../utils/axios";

// Use environment variable for socket URL
const URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(URL, {
  transports: ["websocket", "polling"],
});

export default function LiveBreaks() {
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    socket.on("attendances-updated", (data) => {
      setAttendances(data);
    });

    return () => socket.off("attendances-updated");
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await api.get("/attendance/get-all-onbreak");
        console.log(data);

        setAttendances(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="p-4">
      {attendances.length === 0 ? (
        <p>No break updates yet...</p>
      ) : (
        attendances.map((a, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <h4>
              {a.firstName ?? "Unknown"} {a.lastName ?? ""} (
              {a.employeeId || "No ID"})
            </h4>
            <ul>
              {a.breaks?.length > 0 ? (
                a.breaks
                  .sort((x, y) => new Date(x.start) - new Date(y.start))
                  .map((b, i) => (
                    <li key={i}>
                      {new Date(b.start).toLocaleTimeString()} →{" "}
                      {b.end ? new Date(b.end).toLocaleTimeString() : "ongoing"}
                    </li>
                  ))
              ) : (
                <li>No breaks yet</li>
              )}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
