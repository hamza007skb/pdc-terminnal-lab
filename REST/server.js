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
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  // Generate random result per image
  const results = req.files.map((file, index) => ({
    image: file.originalname || `image_${index + 1}`,
    ...randomPrediction(),
  }));

  res.json({
    count: req.files.length,
    results,
  });
});

// ---------- SERVER ----------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
