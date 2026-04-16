const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Cloudinary env is missing" });
    }

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, { folder: "products", resource_type: "image" });

    return res.json({ imageUrl: result.secure_url, publicId: result.public_id });
  } catch (e) {
    console.error("Upload Image Error:", e);
    return res.status(500).json({
      message: "Upload failed",
      error: e.message,
      cloudinaryCode: e.http_code || e.code || null,
      errorName: e.name || null,
    });
  }
};
