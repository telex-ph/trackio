import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function LiveBreaks() {
  const [message, setMessage] = useState("");

  const socket = io("http://localhost:3000");

  const handleOnSubmit = (e) => {
    e.preventDefault();
    socket.emit("statuses", message);
  };

  useEffect(() => {
    const handleStatuses = (msg) => {
      console.log(msg);
    };

    socket.on("statuses", handleStatuses);

    return () => {
      socket.off("statuses", handleStatuses);
    };
  }, []);

  return (
    <div className="p-4">
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          className="container-light border-light"
        />
        <button type="submit" className="bg-red-300">
          Submit
        </button>
      </form>
    </div>
  );
}
