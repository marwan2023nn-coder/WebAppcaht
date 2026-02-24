import React, { useState, ChangeEvent } from "react";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import { ImageDisplay } from "./ImageDisplay";
import { ImageMode } from "../types";
import "../../style.scss";

function Model() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    "https://ai.creativepoint.io:8100"
  );

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data:image/[type];base64, prefix
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Check file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const generateImage = async () => {
    if (!selectedFile) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null); // Reset the generated image

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(selectedFile);

      const response = await fetch(`${apiUrl}/process-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.image); // Set the generated image
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-min-h-screen custom-padding">
      <div className="custom-container">
        <div className="custom-header">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 flex items-center justify-center gap-3">
            <Sparkles className="custom-sparkles-icon" />
            تحسين الصور بالذكاء الإصطناعي
          </h1>
        </div>

        <div className="custom-card">
          <div className="custom-input-group">
            <div className="custom-input-container">
            <label htmlFor="server"> رابط السرفر</label>

              <input
                type="url"
                id="server"

                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="أدخل رابط معالجة الصورة"
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <label htmlFor="image"> قم برفع الصورة التي تريد تحسينها</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
            <button
              onClick={generateImage}
              disabled={loading || !selectedFile}
              className={`custom-generate-button button22 ${
                loading || !selectedFile ? "disabled" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="custom-loader" />
                  تحسين.....
                </>
              ) : (
                <>
                  <ImageIcon />
                  تحسين
                </>
              )}
            </button>
          </div>

          {error && <div className="custom-error-message">{error}</div>}
        </div>

        {/* Displaying both selected and generated images */}
        {selectedFile && (
          <div>
            <p>الصورة  قبل التحسين:</p>
            <br />
            {/* Display the selected image */}
            <ImageDisplay imageData={URL.createObjectURL(selectedFile)} />
          </div>
        )}
        {generatedImage && (
          <div>
            <br />
            <p>الصورة بعد التحسين:</p>
            <br />
            {/* Display the generated image */}
            <ImageDisplay imageData={generatedImage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Model;
