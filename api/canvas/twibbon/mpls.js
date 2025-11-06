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
  name: "MPLS Twibbon Maker",
  description: "Create MPLS 2025 twibbon with circular frame",
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
      const framePath = path.join(process.cwd(), "src", "services", "canvas", "tribunMPLS.jpg");
      
      // Cek apakah frame file exists
      if (!fs.existsSync(framePath)) {
        return res.status(500).json({
          success: false,
          error: "Frame image not found. Please ensure tribunMPLS.jpg exists in src/services/canvas/ directory"
        });
      }

      // Load images dari buffer lokal
      const frameBuffer = fs.readFileSync(framePath);
      
      const [twibbonFrame, userImg] = await Promise.all([
        loadImage(frameBuffer),
        loadImage(req.file.buffer)
      ]);

      const canvas = createCanvas(twibbonFrame.width, twibbonFrame.height);
      const ctx = canvas.getContext("2d");

      // Position untuk circle mask (sesuai kode original)
      const circleX = 600;
      const circleY = 533;
      const radius = 420;

      // Calculate crop untuk foto user (maintain aspect ratio)
      const aspect = userImg.width / userImg.height;
      let srcX, srcY, srcW, srcH;

      if (aspect > 1) {
        // Landscape orientation
        srcH = userImg.height;
        srcW = userImg.height;
        srcX = (userImg.width - srcW) / 2;
        srcY = 0;
      } else {
        // Portrait orientation
        srcW = userImg.width;
        srcH = userImg.width;
        srcX = 0;
        srcY = (userImg.height - srcH) / 2;
      }

      // Draw circular mask untuk foto user
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw user image dengan crop yang sesuai
      ctx.drawImage(
        userImg, 
        srcX, srcY, srcW, srcH,                    // Source crop
        circleX - radius, circleY - radius,        // Destination position
        radius * 2, radius * 2                     // Destination size
      );
      ctx.restore();

      // Draw twibbon frame di atasnya
      ctx.drawImage(twibbonFrame, 0, 0, canvas.width, canvas.height);

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png");

      // Save processed image
      const randomName = crypto.randomBytes(16).toString("hex") + ".png";
      const filePath = path.join(uploadDir, randomName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/files/${randomName}`;

      // Auto delete after 5 minutes
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
        },
        message: "📸 Twibbon MPLS 2025 is ready to use!"
      });

    } catch (err) {
      console.error("MPLS Twibbon processing error:", err);
      res.status(500).json({
        error: err.message || "Twibbon processing failed",
      });
    }
  },
};