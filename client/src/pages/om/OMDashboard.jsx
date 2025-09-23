import React, { useEffect } from "react";
import api from "../../utils/axios";
import { useState } from "react";

const OMDashboard = () => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const uploadMedia = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      formData.append("folder", "test");
      const response = await api.post("/media/upload-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="bg-red-300 border"
      />
      Testing Cloudinary
      <button onClick={uploadMedia} className="bg-red-300">
        Upload
      </button>
    </div>
  );
};

export default OMDashboard;
