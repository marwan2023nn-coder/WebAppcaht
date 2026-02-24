import React, { useState, ChangeEvent } from "react";
import { Loader2, MusicIcon, Sparkles } from "lucide-react";
import "../../style.scss";

function VoiceGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    "https://ai.creativepoint.io:8100"
  );
  const [previewSrc, setPreviewSrc] = useState<string | null>(null); // For previewing the audio

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data:audio/[type];base64, prefix
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
      if (!file.type.startsWith("audio/")) {
        setError("Please select an audio file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create a preview URL for the selected audio file
      const previewUrl = URL.createObjectURL(file);
      setPreviewSrc(previewUrl);
    }
  };

  const generateAudio = async () => {
    if (!selectedFile) {
      setError("Please select an audio file");
      return;
    }

    setLoading(true);
    setError(null);
    setAudioSrc(null); // Reset the audio source

    try {
      // Convert audio to base64
      const base64Audio = await convertToBase64(selectedFile);

      const response = await fetch(`${apiUrl}/enhance_audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const data = await response.json();
      setAudioSrc(`data:audio/wav;base64,${data.audio}`); // Set the audio source for playback
    } catch (err) {
      setError("Failed to process audio. Please try again.");
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
            تحسين الصوت بالذكاء الإصطناعي
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
                placeholder="أدخل رابط معالجة الصوت"
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <label htmlFor="audio">قم برفع الصوت الذي تريد تحسينه</label>

              <input
                type="file"
                id="audio"
                accept="audio/*"
                onChange={handleFileChange}
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
            <button
              onClick={generateAudio}
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
                  {" "}
                  <MusicIcon />
                  تحسين
                </>
              )}
            </button>
          </div>

          {error && <div className="custom-error-message">{error}</div>}

          {/* Preview Audio Player */}
          {previewSrc && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">
                استمع إلى الصوت قبل المعالجة:
              </h2>
              <audio controls src={previewSrc}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Processed Audio Player */}
          {audioSrc && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">الصوت بعد المعالجة:</h2>
              <audio controls>
                <source src={audioSrc} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceGenerator;
