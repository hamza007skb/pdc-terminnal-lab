async function uploadImages(files, testName) {
  if (!files || files.length === 0) {
    console.log("No files selected");
    return;
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file); // MUST match server multer key
  }

  // Measure response time
  const startTime = performance.now();

  try {
    const response = await fetch("http://localhost:4000/trpc/uploadImage", {
      method: "POST",
      body: formData,
    });

    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(2);

    const data = await response.json();

    // Payload size in bytes
    const payloadSize = new Blob([JSON.stringify(data)]).size;

    // Log results
    const log = {
      protocol: "tRPC",
      test: testName,
      imagesUploaded: files.length,
      responseTimeMs: responseTime,
      payloadSizeBytes: payloadSize,
      results: data.result.data.results,
    };

    console.log("📊 UPLOAD LOG:", log);

    // Optional: download log as JSON
    downloadLog(log);
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

// Optional: download log as JSON file
function downloadLog(log) {
  const blob = new Blob([JSON.stringify(log, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "upload_log.json";
  link.click();
}

// -------- Example usage with input element --------
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imageInput");
  const btn = document.getElementById("uploadBtn");

  btn.addEventListener("click", () => {
    const files = input.files;
    uploadImages(files, "tRPC Image Test");
  });
});
