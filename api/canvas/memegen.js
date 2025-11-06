import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";

// Register font
const fontPath = path.join(process.cwd(), "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");

if (fs.existsSync(fontPath)) {
  GlobalFonts.registerFromPath(fontPath, "LEMONMILK");
}

function wrapText(context, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function drawTextWithOutline(ctx, text, x, y, fillStyle = "white", strokeStyle = "black", lineWidth = 4) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.strokeText(text, x, y);
  
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
}

export default {
  name: "Meme Generator",
  description: "Generate meme with top and bottom text",
  category: "Canvas",
  methods: ["GET"],
  params: ["imageUrl", "topText", "bottomText"],
  paramsSchema: {
    imageUrl: { type: "string", required: true, minLength: 1 },
    topText: { type: "string", required: false, default: "" },
    bottomText: { type: "string",  required: false, default: "" }
  },

  async run(req, res) {
    try {
      // Get parameters from both GET and POST
      const imageUrl = req.method === "GET" ? req.query.imageUrl : req.body.imageUrl;
      const topText = req.method === "GET" ? req.query.topText : req.body.topText;
      const bottomText = req.method === "GET" ? req.query.bottomText : req.body.bottomText;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Parameter "imageUrl" is required'
        });
      }

      try {
        new URL(imageUrl);
      } catch (urlError) {
        return res.status(400).json({
          success: false,
          error: 'Parameter "imageUrl" must be a valid URL'
        });
      }

      console.log(`Generating meme with image: ${imageUrl}`);
      console.log(`Top text: "${topText || ""}", Bottom text: "${bottomText || ""}"`);

      const imageResponse = await axios.get(imageUrl, { 
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const image = await loadImage(imageBuffer);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      // Draw background image
      ctx.drawImage(image, 0, 0, image.width, image.height);

      // Set font styling
      const baseFontSize = Math.max(image.width * 0.08, 32);
      const fontFamily = GlobalFonts.families.some(f => f.family === "LEMONMILK") 
        ? "LEMONMILK" 
        : "Arial, sans-serif";
      
      ctx.font = `bold ${baseFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const margin = image.width * 0.05;
      const maxWidth = image.width - (margin * 2);

      // Draw top text
      if (topText && topText.trim()) {
        const topLines = wrapText(ctx, topText.toUpperCase(), maxWidth);
        const lineHeight = baseFontSize * 1.2;
        let startY = margin;

        topLines.forEach((line, index) => {
          const y = startY + (index * lineHeight);
          drawTextWithOutline(
            ctx, 
            line, 
            image.width / 2, 
            y,
            "white",
            "black",
            baseFontSize * 0.08
          );
        });
      }

      // Draw bottom text
      if (bottomText && bottomText.trim()) {
        const bottomLines = wrapText(ctx, bottomText.toUpperCase(), maxWidth);
        const lineHeight = baseFontSize * 1.2;
        const totalTextHeight = (bottomLines.length - 1) * lineHeight + baseFontSize;
        let startY = image.height - margin - totalTextHeight;

        bottomLines.forEach((line, index) => {
          const y = startY + (index * lineHeight);
          drawTextWithOutline(
            ctx, 
            line, 
            image.width / 2, 
            y,
            "white",
            "black",
            baseFontSize * 0.08
          );
        });
      }

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png");

      // Generate filename and save
      const uploadDir = path.join(process.cwd(), "files");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

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
        texts: {
          top: topText || "",
          bottom: bottomText || ""
        },
        message: "Meme generated successfully!"
      });

    } catch (err) {
      console.error("Meme generation error:", err);
      
      let errorMessage = "Meme generation failed";
      if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
        errorMessage = "Cannot access image URL. Please check if the URL is valid and accessible";
      } else if (err.code === "TIMEOUT") {
        errorMessage = "Image download timeout. Please try again with a smaller image";
      } else if (err.message.includes("unsupported image format")) {
        errorMessage = "Unsupported image format. Please use JPEG, PNG, or WebP";
      }

      res.status(500).json({
        error: errorMessage,
        details: err.message
      });
    }
  },
};