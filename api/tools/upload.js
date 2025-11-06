import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });
const uploadDir = path.join(process.cwd(), "files");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

export default {
  name: "File Upload",
  description: "Endpoint for uploading files (auto delete after 5 minutes)",
  category: "Tools",
  methods: ["POST"],
  params: ["file"],
  paramsSchema: {
    file: { type: "file", required: true },
  },

  async run(req, res) {
    try {
      await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      const randomName =
        crypto.randomBytes(16).toString("hex") +
        path.extname(req.file.originalname);

      const filePath = path.join(uploadDir, randomName);

      fs.writeFileSync(filePath, req.file.buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/files/${randomName}`;
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5 * 60 * 1000);

      res.json({
        url: fileUrl,
        filename: randomName,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message || "Upload failed",
      });
    }
  },
};