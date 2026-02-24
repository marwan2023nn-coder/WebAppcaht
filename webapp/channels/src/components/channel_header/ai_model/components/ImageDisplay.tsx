import React from "react";
import { formatBase64Image } from "../utils/image";

interface ImageDisplayProps {
  imageData: string;
}

export function ImageDisplay({ imageData }: ImageDisplayProps) {
  const imageUrl = formatBase64Image(imageData);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "generated-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight:"600px",
        maxWidth:"100%",
        alignItems: "center",
        marginBottom:"16px"
      }}
    >
      <img
        src={imageUrl}
        alt="Generated image"
        style={{             
          maxWidth:"100%",
          maxHeight:"400px",

          borderRadius: "10px" }}
        className="w-full h-auto rounded-lg"
      />
      <button className="button22" onClick={handleDownload}>تنزيل الصورة </button>
    </div>
  );
}
