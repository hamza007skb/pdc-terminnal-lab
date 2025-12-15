const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

console.log("🔥 Server file loaded");

// ---- ROUTE ----
app.post("/trpc/uploadImage", upload.array("images", 10), (req, res) => {
  console.log("✅ Route HIT");

  if (!req.files || req.files.length === 0) {
    console.log("❌ No files received");
    return res.status(400).json({ error: "No images uploaded" });
  }

  const start = Date.now();

  const results = req.files.map((file, i) => ({
    image: file.originalname || `image_${i + 1}`,
    label: Math.random() > 0.5 ? "cat" : "dog",
    confidence: +(Math.random() * 0.5 + 0.5).toFixed(2),
  }));

  const duration = Date.now() - start;

  // 🔥 THIS MUST PRINT
  console.log("📦 SERVER LOG:", {
    protocol: "tRPC",
    imagesUploaded: req.files.length,
    serverProcessingTimeMs: duration,
  });

  res.json({
    result: {
      data: {
        count: req.files.length,
        results,
      },
    },
  });
});

// ---- SERVER ----
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
