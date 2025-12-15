const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());

// Store files in memory (no disk saving)
const upload = multer({ storage: multer.memoryStorage() });

// Random label generator
function randomPrediction() {
  const labels = ["cat", "dog"];
  const label = labels[Math.floor(Math.random() * labels.length)];
  const confidence = +(Math.random() * (0.99 - 0.5) + 0.5).toFixed(2);

  return { label, confidence };
}


// ---------- ROUTE ----------
app.post("/uploadImage", upload.array("images", 10), (req, res) => {
  const start = Date.now();

  const results = req.files.map((file, index) => ({
    image: file.originalname || `image_${index + 1}`,
    label: Math.random() > 0.5 ? "cat" : "dog",
    confidence: +(Math.random() * 0.5 + 0.5).toFixed(2),
  }));

  const duration = Date.now() - start;

  console.log({
    images: req.files.length,
    serverProcessingTimeMs: duration,
  });

  res.json({ count: req.files.length, results });
});


// ---------- SERVER ----------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
