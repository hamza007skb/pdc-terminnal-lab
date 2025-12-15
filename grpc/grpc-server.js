const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("image.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const imageProto = grpcObj.imageclassifier;

const server = new grpc.Server();

// ---- Unary RPC handler ----
function uploadImage(call, callback) {
  const start = Date.now();
  const imgBuffer = call.request.imageData;

  console.log(`✅ Received image of ${imgBuffer.length} bytes`);

  // Simulate classification
  const label = Math.random() > 0.5 ? "cat" : "dog";
  const confidence = +(Math.random() * (0.99 - 0.5) + 0.5).toFixed(2);

  const duration = Date.now() - start;
  console.log("📦 SERVER LOG:", {
    protocol: "gRPC",
    imageSizeBytes: imgBuffer.length,
    serverProcessingTimeMs: duration,
    label,
    confidence,
  });

  // Send response
  callback(null, { label, confidence });
}

// ---- Bind service ----
server.addService(imageProto.ImageClassifier.service, {
  UploadImage: uploadImage,
});

const PORT = "0.0.0.0:50051";
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) return console.error(err);
  console.log(`🚀 gRPC server running on ${PORT}`);
  server.start();
});
