const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");

const packageDef = protoLoader.loadSync("image.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const imageProto = grpcObj.imageclassifier;

const client = new imageProto.ImageClassifier(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// ---------- Upload one image and log ----------
function uploadImage(filePath) {
  const imageData = fs.readFileSync(filePath);

  const start = Date.now();
  client.UploadImage({ imageData }, (err, response) => {
    const end = Date.now();
    if (err) {
      console.error("gRPC error:", err);
      return;
    }

    // Latency in milliseconds
    const latency = (end - start).toFixed(2);

    // Payload size in bytes (approx)
    const payloadSize = Buffer.byteLength(JSON.stringify(response));

    console.log("📊 gRPC LOG:", {
      file: filePath,
      latencyMs: latency,
      payloadSizeBytes: payloadSize,
      label: response.label,
      confidence: response.confidence,
    });
  });
}

// ---------- Upload multiple images sequentially ----------
async function uploadMultipleImages(filePaths) {
  for (const file of filePaths) {
    await new Promise((resolve) => uploadImageWithPromise(file, resolve));
  }
}

// Wrap callback in a promise to await
function uploadImageWithPromise(filePath, done) {
  const imageData = fs.readFileSync(filePath);
  const start = Date.now();

  client.UploadImage({ imageData }, (err, response) => {
    const end = Date.now();
    if (err) {
      console.error("gRPC error:", err);
      done();
      return;
    }

    const latency = (end - start).toFixed(2);
    const payloadSize = Buffer.byteLength(JSON.stringify(response));

    console.log("📊 gRPC LOG:", {
      file: filePath,
      latencyMs: latency,
      payloadSizeBytes: payloadSize,
      label: response.label,
      confidence: response.confidence,
    });

    done();
  });
}

// ---------- Example usage ----------
const images = ["assets/1.png", "assets/2.png"]; // replace with your images
uploadMultipleImages(images);
