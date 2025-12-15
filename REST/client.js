async function uploadImages(files) {
  const formData = new FormData();

  for (let file of files) {
    formData.append("images", file);
  }

  const startTime = performance.now();

  const response = await fetch("http://localhost:3000/uploadImage", {
    method: "POST",
    body: formData,
  });

  const endTime = performance.now();
  const data = await response.json();

  const payloadSize = JSON.stringify(data).length;

  console.log("Response:", data);
  console.log("Response Time (ms):", (endTime - startTime).toFixed(2));
  console.log("Payload Size (bytes):", payloadSize);
}
