import multer from "multer";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });
const uploadDir = path.join(process.cwd(), "files");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default {
  name: "Tribun JMK48",
  description: "Create JMK 2025 twibbon with circular frame",
  category: "Canvas",
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

      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        });
      }

      // Load frame dari direktori lokal
      const framePath = path.join(process.cwd(), "src", "services", "canvas", "tribunJMK.jpg");
      
      // Cek apakah frame file exists
      if (!fs.existsSync(framePath)) {
        return res.status(500).json({
          success: false,
          error: "Frame image not found. Please ensure tribunJMK.jpg exists in src/services/canvas/ directory"
        });
      }

      // Load frame dari file lokal
      const frameBuffer = fs.readFileSync(framePath);
      
      const [frameImg, userImg] = await Promise.all([
        loadImage(frameBuffer),  // Load dari buffer lokal
        loadImage(req.file.buffer)
      ]);

      const canvas = createCanvas(frameImg.width, frameImg.height);
      const ctx = canvas.getContext("2d");

      const centerX = canvas.width / 2;
      const centerY = Math.round(canvas.height * 0.500);
      const radius = Math.round(canvas.width * 0.400);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        userImg,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      );
      ctx.restore();

      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer("image/png");

      const randomName = crypto.randomBytes(16).toString("hex") + ".png";
      const filePath = path.join(uploadDir, randomName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/files/${randomName}`;

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error("Error deleting file:", err);
          }
        }
      }, 5 * 60 * 1000);

      res.json({
        results: {
          url: fileUrl,
          filename: randomName,
          mimetype: "image/png",
          size: buffer.length,
        },
        dimensions: {
          width: canvas.width,
          height: canvas.height
        }
      });

    } catch (err) {
      console.error("Image processing error:", err);
      res.status(500).json({
        error: err.message || "Image processing failed",
      });
    }
  },
};