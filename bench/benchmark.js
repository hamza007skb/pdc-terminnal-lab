const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// ---------- CONFIG ----------
const images = ["assets/1.png" ]; // your test images

// Server URLs
const servers = {
  REST: "http://localhost:3000/uploadImage",
  tRPC: "http://localhost:4000/trpc/uploadImage",
  gRPC_unary: "grpc://localhost:50051", // special case
  S2S_gRPC: "http://localhost:8000/uploadImage",
};

// ---------- Load proto for gRPC ----------
const packageDef = protoLoader.loadSync("image.proto");
const grpcObj = grpc.loadPackageDefinition(packageDef);
const imageProto = grpcObj.imageclassifier;

// ---------- HELPER FUNCTIONS ----------

// Check if server is reachable (HTTP only)
async function isServerUp(url) {
  if (!url.startsWith("http")) return true; // skip gRPC unary
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000); // 1s timeout
    await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    return true;
  } catch {
    console.warn(`⚠️ Server unreachable: ${url}`);
    return false;
  }
}

// REST / tRPC upload
async function uploadHTTP(url, filePath, protocol) {
  if (!(await isServerUp(url))) return null;

  const form = new FormData();
  form.append(protocol === "S2S_gRPC" ? "image" : "images", fs.createReadStream(filePath));

  const start = Date.now();
  try {
    const res = await fetch(url, { method: "POST", body: form });
    const end = Date.now();
    const data = await res.json();

    return {
      protocol,
      file: filePath,
      responseTimeMs: end - start,
      payloadSizeBytes: JSON.stringify(data).length,
      label: data.results?.[0]?.label || data.label,
      internalLatencyMs: data.internalLatencyMs || null,
    };
  } catch (err) {
    console.warn(`⚠️ Failed to upload ${filePath} to ${protocol}: ${err.message}`);
    return null;
  }
}

// gRPC unary upload
function uploadGRPC(filePath) {
  return new Promise((resolve) => {
    const client = new imageProto.ImageClassifier("localhost:50051", grpc.credentials.createInsecure());
    const imageData = fs.readFileSync(filePath);
    const start = Date.now();

    client.UploadImage({ imageData }, (err, response) => {
      const end = Date.now();
      if (err) {
        console.warn(`⚠️ gRPC unary failed: ${err.message}`);
        resolve(null);
        return;
      }

      resolve({
        protocol: "gRPC_unary",
        file: filePath,
        responseTimeMs: end - start,
        payloadSizeBytes: JSON.stringify(response).length,
        label: response.label,
      });
    });
  });
}

// ---------- RUN BENCHMARK ----------
async function runBenchmark() {
  const results = [];

  for (const img of images) {
    const restRes = await uploadHTTP(servers.REST, img, "REST");
    if (restRes) results.push(restRes);

    const trpcRes = await uploadHTTP(servers.tRPC, img, "tRPC");
    if (trpcRes) results.push(trpcRes);

    const grpcRes = await uploadGRPC(img);
    if (grpcRes) results.push(grpcRes);

    const s2sRes = await uploadHTTP(servers.S2S_gRPC, img, "S2S_gRPC");
    if (s2sRes) results.push(s2sRes);
  }

  console.table(results);
}

runBenchmark().catch(console.error);
