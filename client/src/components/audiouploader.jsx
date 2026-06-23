import React, { useState } from 'react';

const AudioUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, requesting, uploading, success, error

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      // --- CHAPTER 1: Ask Node.js for the Presigned URL ---
      setStatus("requesting");
      
      // Make sure this matches your actual Express server port!
      const gatewayResponse = await fetch("http://localhost:5000/get-upload-url", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "audio/mpeg", // Fallback for some mp3s
        }),
      });

      const gatewayData = await gatewayResponse.json();
      
      if (!gatewayResponse.ok) {
        throw new Error(gatewayData.error || "Gateway rejected the request");
      }

      const { uploadUrl, fileKey } = gatewayData;

      // --- CHAPTER 2: Upload directly to Cloudflare R2 ---
      setStatus("uploading");

      const r2Response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "audio/mpeg",
        },
      });

      if (!r2Response.ok) {
        throw new Error("Cloudflare R2 rejected the file upload");
      }

      setStatus("success");
      console.log("Success! The file is sitting in R2 with the key:", fileKey);

    } catch (error) {
      console.error("Upload workflow failed:", error);
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h2>Upload Song for Separation</h2>
      
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange} 
        style={{ marginBottom: "15px", display: "block" }}
      />
      
      <button 
        onClick={handleUpload} 
        disabled={!file || status === "requesting" || status === "uploading"}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {status === "idle" && "Upload to Cloudflare"}
        {status === "requesting" && "Getting Secure Link..."}
        {status === "uploading" && "Uploading to Cloud..."}
        {status === "success" && "Upload Complete!"}
        {status === "error" && "Upload Failed (Try Again)"}
      </button>
    </div>
  );
};

export default AudioUploader;