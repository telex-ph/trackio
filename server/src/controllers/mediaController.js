import cloudUpload from "../config/cloudinary.js";

export const uploadMedia = async (req, res) => {
  const folder = req.body.folder;

  console.log("Files received:", req.files);
  req.files.forEach((f, i) => console.log(i, f.originalname, f.buffer.length));

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        cloudUpload(file.buffer, {
          folder: `trackio/${folder}`,
          resource_type: "auto",
        })
      )
    );

    const response = uploads.map((u) => ({
      url: u.secure_url,
      public_id: u.public_id,
      format: u.format,
      resource_type: u.resource_type,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error upload media files to Cloudinary:", err);
    res.status(500).json({
      message: "Failed to upload",
    });
  }
};
