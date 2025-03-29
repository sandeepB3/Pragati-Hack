import express from "express";
import multer from "multer";
import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

// Initialize the Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// API Endpoint to translate audio
app.post("/translate-audio", upload.single("audio"), async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      // Rename file to ensure it has an extension
      const filePath = req.file.path;
      const newFilePath = `${filePath}.mp3`;
      fs.renameSync(filePath, newFilePath);
  
      const translation = await groq.audio.translations.create({
        file: fs.createReadStream(newFilePath),
        model: "whisper-large-v3",
        prompt: "Specify context or spelling",
        language: "en",
        response_format: "json",
        temperature: 0.0,
      });
  
      console.log("\nTranslation:", translation);
  
      // Clean up the uploaded file
      fs.unlinkSync(newFilePath);
  
      res.json({ translatedText: translation.text });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
});
