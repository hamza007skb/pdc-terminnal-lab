const express = require("express");
const multer = require("multer");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Load proto
const packageDef = protoLoader.loadSync("image.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const imageProto = grpcObj.imageclassifier;

// gRPC client to Microservice B
const grpcClient = new imageProto.ImageClassifier(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// REST endpoint
app.post("/uploadImage", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const startTotal = Date.now(); // end-to-end
  const startInternal = Date.now(); // internal A → B

  grpcClient.UploadImage({ imageData: req.file.buffer }, (err, response) => {
    const endInternal = Date.now();
    if (err) return res.status(500).json({ error: err.message });

    const endTotal = Date.now();

    console.log("📦 Microservice A log:", {
      imageName: req.file.originalname,
      internalLatencyMs: endInternal - startInternal,
      endToEndLatencyMs: endTotal - startTotal,
      label: response.label,
      confidence: response.confidence,
    });

    res.json({
      label: response.label,
      confidence: response.confidence,
      internalLatencyMs: endInternal - startInternal,
      endToEndLatencyMs: endTotal - startTotal,
    });
  });
});

app.listen(8000, () => {
  console.log("🚀 Microservice A running on http://localhost:8000");
});
