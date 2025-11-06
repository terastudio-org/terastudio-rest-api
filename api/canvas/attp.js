import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

export default {
  name: "ATT&P Video Generator",
  description: "Create animated text video with color changing effect using FFmpeg",
  category: "Canvas",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    let tempDir = '';
    let frameFiles = [];

    try {
      const text = req.method === "GET" ? req.query.text : req.body.text;
      if (!text) return res.status(400).json({ error: 'Parameter "text" is required' });

      console.log(`Generating ATT&P video with text: "${text}"`);

      const width = 400, height = 400;
      const frames = 30, duration = 3;
      const fps = frames / duration;

      const fontPath = path.join(process.cwd(), "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");
      if (!fs.existsSync(fontPath)) return res.status(500).json({ error: "Font not found" });
      GlobalFonts.registerFromPath(fontPath, "LEMONMILK");

      const fontSize = 48;
      const colors = ["#FF0000","#00FF00","#0000FF","#FFFF00","#00FFFF","#FF00FF",
                      "#FFA500","#800080","#008080","#FFC0CB","#FFD700","#00BFFF",
                      "#8A2BE2","#FF69B4","#B22222"];

      tempDir = path.join(process.cwd(), "files", crypto.randomBytes(8).toString("hex"));
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      for (let i = 0; i < frames; i++) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = colors[i % colors.length];
        ctx.font = `bold ${fontSize}px LEMONMILK`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const words = text.split(" ");
        let line = "", lines = [];
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > width - 40 && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        const x = width / 2;
        let y = height / 2 - ((lines.length - 1) * fontSize) / 2;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;

        lines.forEach(l => {
          ctx.strokeText(l, x, y);
          ctx.fillText(l, x, y);
          y += fontSize;
        });

        const framePath = path.join(tempDir, `frame_${i.toString().padStart(4, "0")}.png`);
        await writeFileAsync(framePath, canvas.toBuffer("image/png"));
        frameFiles.push(framePath);
      }

      const uploadDir = path.join(process.cwd(), "files");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const outputFileName = crypto.randomBytes(16).toString("hex") + ".mp4";
      const outputPath = path.join(uploadDir, outputFileName);

      return new Promise((resolve, reject) => {
        const ffmpegArgs = [
          "-y", "-framerate", fps.toString(),
          "-i", path.join(tempDir, "frame_%04d.png"),
          "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "fast",
          outputPath
        ];

        const ffmpeg = spawn("ffmpeg", ffmpegArgs);
        let stderr = "";

        ffmpeg.stderr.on("data", data => stderr += data.toString());
        ffmpeg.on("close", async code => {
          frameFiles.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
          if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });

          if (code === 0) {
            const fileUrl = `${req.protocol}://${req.get("host")}/files/${outputFileName}`;
            res.json({ results: { url: fileUrl, filename: outputFileName, mimetype: "video/mp4" }, text });
            resolve();
          } else reject(new Error(stderr));
        });
      });

    } catch (err) {
      console.error("ATT&P video error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};