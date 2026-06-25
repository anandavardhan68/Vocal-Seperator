import React, { useState } from 'react';

const AudioUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setErrorMsg("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Determine content type — never send empty string
    const contentType = file.type || "application/octet-stream";

    try {
      // STEP 1: Ask your gateway for a presigned URL
      setStatus("requesting");
      const gatewayResponse = await fetch("http://localhost:5000/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: contentType,
        }),
      });

      const gatewayData = await gatewayResponse.json();

      if (!gatewayResponse.ok) {
        throw new Error(gatewayData.detail || "Gateway rejected request");
      }

      const { uploadUrl, fileKey } = gatewayData;
      console.log("✅ Got presigned URL for key:", fileKey);

      // STEP 2: Upload directly to R2 using the presigned URL
      setStatus("uploading");
      const r2Response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,                          // send raw file — correct for presigned URLs
        headers: {
          "Content-Type": contentType,       // must match what gateway signed
        },
      });

      if (!r2Response.ok) {
        // R2 returns XML errors — log it so you can see exactly what went wrong
        const errorText = await r2Response.text();
        console.error("❌ R2 XML Error:", errorText);
        throw new Error(`R2 rejected upload: ${r2Response.status}`);
      }

      setStatus("success");
      console.log("✅ File uploaded successfully! Key:", fileKey);

    } catch (error) {
      console.error("❌ Upload failed:", error.message);
      setStatus("error");
      setErrorMsg(error.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h2>Upload Song for Separation</h2>

      <input
        type="file"
        accept="audio/*,.txt"         // txt for testing, audio for real use
        onChange={handleFileChange}
        style={{ marginBottom: "15px", display: "block" }}
      />

      {file && (
        <p style={{ fontSize: "13px", color: "#555" }}>
          {file.name} — {(file.size / 1024).toFixed(1)} KB — {file.type || "unknown type"}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === "requesting" || status === "uploading"}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {status === "idle" && "Upload to Cloudflare"}
        {status === "requesting" && "Getting Secure Link..."}
        {status === "uploading" && "Uploading to Cloud..."}
        {status === "success" && "✅ Upload Complete!"}
        {status === "error" && "❌ Upload Failed (Try Again)"}
      </button>

      {/* Show error message below button so you don't have to open devtools */}
      {status === "error" && errorMsg && (
        <p style={{ color: "red", marginTop: "10px", fontSize: "13px" }}>
          Error: {errorMsg}
        </p>
      )}
    </div>
  );
};

export default AudioUploader;