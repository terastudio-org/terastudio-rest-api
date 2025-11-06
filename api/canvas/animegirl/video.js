import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";
import { exec as childExec } from "child_process";

const exec = promisify(childExec);

export default {
  name: "Animated Text Video",
  description: "Generate anime maid holding paper with typewriter text animation",
  category: "Canvas",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    let tempFiles = [];

    try {
      const text = req.method === "GET" ? req.query.text : req.body.text;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" is required' });
      }

      const baseDir = process.cwd();
      const filesDir = path.join(baseDir, "files");
      if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

      const sessionId = crypto.randomBytes(8).toString("hex");
      const frameDir = path.join(filesDir, `frames_${sessionId}`);
      const outputMp4 = path.join(filesDir, `video_${sessionId}.mp4`);
      if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });

      tempFiles.push(frameDir, outputMp4);

      const imagePath = path.join(baseDir, "src", "services", "canvas", "brat_nime.jpg");
      const fontPath = path.join(baseDir, "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");

      if (!fs.existsSync(imagePath)) return res.status(500).json({ error: "Base image not found" });
      if (!fs.existsSync(fontPath)) return res.status(500).json({ error: "Font not found (LEMONMILK-Bold.otf)" });

      GlobalFonts.registerFromPath(fontPath, "LEMONMILK");
      const baseImage = await loadImage(fs.readFileSync(imagePath));

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      const boardX = canvas.width * 0.22;
      const boardY = canvas.height * 0.42;
      const boardWidth = canvas.width * 0.56;
      const boardHeight = canvas.height * 0.20;

      function wrapText(ctx, text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let line = "";
        for (let w of words) {
          const testLine = line ? line + " " + w : w;
          if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(line);
            line = w;
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        return lines;
      }

      function drawTextWithOutline(ctx, text, x, y, fillColor, strokeColor, strokeWidth) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
      }

      let fontSize = Math.floor(canvas.height * 0.05);
      ctx.font = `bold ${fontSize}px LEMONMILK`;

      const words = text.split(" ");
      const frames = [];
      for (let i = 1; i <= words.length; i++) {
        const frameCanvas = createCanvas(baseImage.width, baseImage.height);
        const frameCtx = frameCanvas.getContext("2d");
        frameCtx.drawImage(baseImage, 0, 0, frameCanvas.width, frameCanvas.height);

        frameCtx.textAlign = "center";
        frameCtx.textBaseline = "middle";
        frameCtx.font = `bold ${fontSize}px LEMONMILK`;

        let currentText = words.slice(0, i).join(" ");
        let lines = wrapText(frameCtx, currentText, boardWidth * 0.9);
        let lineHeight = fontSize * 1.2;

        while (lines.length * lineHeight > boardHeight * 0.9 && fontSize > 14) {
          fontSize -= 2;
          frameCtx.font = `bold ${fontSize}px LEMONMILK`;
          lines = wrapText(frameCtx, currentText, boardWidth * 0.9);
          lineHeight = fontSize * 1.2;
        }

        const totalTextHeight = lines.length * lineHeight;
        const startY = boardY + (boardHeight - totalTextHeight) / 2 + fontSize / 2 + 60;

        lines.forEach((line, idx) => {
          const y = startY + idx * lineHeight;
          const x = boardX + boardWidth / 2;
          drawTextWithOutline(frameCtx, line, x, y, "#FFFFFF", "#000000", fontSize * 0.08);
        });

        const framePath = path.join(frameDir, `frame_${i.toString().padStart(3, "0")}.png`);
        fs.writeFileSync(framePath, frameCanvas.toBuffer("image/png"));
        frames.push(framePath);
      }

      await exec(`ffmpeg -y -framerate 2 -i ${frameDir}/frame_%03d.png -c:v libx264 -pix_fmt yuv420p ${outputMp4}`);

      const finalFileName = `video_${crypto.randomBytes(6).toString("hex")}.mp4`;
      const finalFilePath = path.join(filesDir, finalFileName);
      fs.renameSync(outputMp4, finalFilePath);

      const fileUrl = `${req.protocol}://${req.get("host")}/files/${finalFileName}`;

      // Cleanup
      setTimeout(() => {
        try { if (fs.existsSync(frameDir)) fs.rmSync(frameDir, { recursive: true, force: true }); } catch {}
        setTimeout(() => { try { if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch {} }, 5 * 60 * 1000);
      }, 10000);

      res.json({
        results: {
          url: fileUrl,
          filename: finalFileName,
          mimetype: "video/mp4",
          frames: frames.length,
        },
        text,
        message: "Animated video created successfully!",
      });

    } catch (err) {
      console.error("Animated video error:", err);
      res.status(500).json({ error: "Failed to create animated video", details: err.message });
    }
  },
};