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

function uploadDirect(filePath) {
  const imageData = fs.readFileSync(filePath);
  const start = Date.now();

  client.UploadImage({ imageData }, (err, response) => {
    const end = Date.now();
    if (err) return console.error(err);

    console.log("📊 Direct gRPC log:", {
      file: filePath,
      latencyMs: end - start,
      label: response.label,
      confidence: response.confidence,
    });
  });
}

uploadDirect("1.png");
