import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export default {
  name: "Text on Image",
  description: "Generate anime maid holding paper with text overlay",
  category: "Canvas",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    try {
      const text = req.method === "GET" ? req.query.text : req.body.text;
      if (!text) {
        return res.status(400).json({ error: 'Parameter "text" is required' });
      }

      const imagePath = path.join(process.cwd(), "src", "services", "canvas", "brat_nime.jpg");
      const fontPath = path.join(process.cwd(), "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");

      if (!fs.existsSync(imagePath)) {
        return res.status(500).json({ error: "Base image not found" });
      }
      if (!fs.existsSync(fontPath)) {
        return res.status(500).json({ error: "Font not found (LEMONMILK-Bold.otf)" });
      }

      GlobalFonts.registerFromPath(fontPath, "LEMONMILK");

      const baseImage = await loadImage(fs.readFileSync(imagePath));
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      const boardX = canvas.width * 0.22;
      const boardY = canvas.height * 0.42;
      const boardWidth = canvas.width * 0.56;
      const boardHeight = canvas.height * 0.20;

      function wrapText(ctx, text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let line = "";

        for (let n = 0; n < words.length; n++) {
          const testLine = line ? line + " " + words[n] : words[n];
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n];
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

      let lines = wrapText(ctx, text, boardWidth * 0.9);
      let lineHeight = fontSize * 1.2;

      while (lines.length * lineHeight > boardHeight * 0.9 && fontSize > 14) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px LEMONMILK`;
        lines = wrapText(ctx, text, boardWidth * 0.9);
        lineHeight = fontSize * 1.2;
      }

      const totalTextHeight = lines.length * lineHeight;
      const startY = boardY + (boardHeight - totalTextHeight) / 2 + fontSize / 2 + 60;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        const x = boardX + boardWidth / 2;
        drawTextWithOutline(ctx, line, x, y, "#FFFFFF", "#000000", fontSize * 0.08);
      });

      const buffer = canvas.toBuffer("image/png");
      const finalFileName = `image_${crypto.randomBytes(6).toString("hex")}.png`;
      const finalFilePath = path.join(process.cwd(), "files", finalFileName);
      fs.writeFileSync(finalFilePath, buffer);

      const fileUrl = `${req.protocol}://${req.get("host")}/files/${finalFileName}`;

      setTimeout(() => {
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
      }, 5 * 60 * 1000);

      res.json({
        results: {
          url: fileUrl,
          filename: finalFileName,
          mimetype: "image/png",
          size: buffer.length,
        },
        dimensions: { width: canvas.width, height: canvas.height },
        text,
        fontSize,
        lines: lines.length,
        message: "Image created successfully!",
      });

    } catch (err) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: "Failed to create image", details: err.message });
    }
  },
};