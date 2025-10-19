import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_RENDER_BASE_URL || "http://localhost:3000";

export default function LiveBreaks() {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("statuses", (msg) => {
      console.log("Received:", msg);
      setStatuses(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mt-4">
        <h2 className="font-bold">On Break Statuses:</h2>
        <ul className="list-disc pl-4">
          {statuses.map((item, i) => (
            <li key={i}>{item.employeeName || JSON.stringify(item)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
