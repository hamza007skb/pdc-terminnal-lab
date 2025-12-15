const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("image.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const imageProto = grpcObj.imageclassifier;

const server = new grpc.Server();

function classifyImage(call, callback) {
  const start = Date.now();
  const imgBuffer = call.request.imageData;

  // Simulate model prediction
  const label = Math.random() > 0.5 ? "cat" : "dog";
  const confidence = +(Math.random() * (0.99 - 0.5) + 0.5).toFixed(2);

  const duration = Date.now() - start;
  console.log("📦 Microservice B log:", {
    imageSizeBytes: imgBuffer.length,
    processingTimeMs: duration,
    label,
    confidence,
  });

  callback(null, { label, confidence });
}

server.addService(imageProto.ImageClassifier.service, {
  UploadImage: classifyImage,
});

const PORT = "0.0.0.0:50052";
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err) => {
  if (err) return console.error(err);
  console.log(`🚀 Microservice B running at ${PORT}`);
  server.start();
});
