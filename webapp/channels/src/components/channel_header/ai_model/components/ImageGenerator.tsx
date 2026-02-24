import React, { useState } from "react";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import { ModeSelector } from "./ModeSelector";
import { ImageDisplay } from "./ImageDisplay";
import { ImageMode } from "../types";
import "../../style.scss";
import img from "../utils/Vector.png";
import img2 from "../utils/bot.svg";
function Model() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<ImageMode>("general");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(
    "https://ai.creativepoint.io:8100"
  );

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("قم بوصف الصورة اولاً");
      return;
    }

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch(`${apiUrl}/text_to_image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: mode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setImage(data.image);
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
        {/* <div className="custom-header">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 flex items-center justify-center gap-3">
            <Sparkles className="custom-sparkles-icon" />
            توليد الصور بالذكاء الإصطناعي
          </h1>
        </div> */}

        <div className="custom-card">
          <div>
            <div style={{ display: "flex", alignItems: "center",  }}>
              <img src={img2} width={30} height={30} alt="" />
              <p style={{    paddingTop: "7px",
    paddingInlineEnd: "5px"}} >الذكاء الاصطناعي</p>
            </div>
            <hr />
            <img
              src={img}
              alt=""
              height={100}
              width={100}
              style={{ marginBottom: "30px" }}
            />
            <div>
              <p> عذراً خدمة الذكاء الاصطناعي غير متوفرة </p>
              <p>هذه الميزة لا تعمل الا على سيرفرات مزودة بكروت شاشة خارجية</p>
            </div>
          </div>
          {/* <div className="custom-input-group">
            <div className="custom-input-container">
              <label htmlFor="server"> رابط السرفر</label>

              <input
                type="url"
                id="server"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="أدخل رابط توليد الصورة"
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <label htmlFor="image"> وصف الصورة</label>

              <input
                type="text"
                id="image"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="قم بوصف الصورة التي تريد توليدها...."
                className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <label htmlFor="type"> نوع الصورة</label>

              <ModeSelector
                value={mode}
                onChange={setMode}
                disabled={loading}
              />
            </div>
            <button
              onClick={generateImage}
              disabled={loading}
              className={`custom-generate-button button22 ${loading ? "disabled" : ""}`}
            >
              {loading ? (
                <>
                  <Loader2 className="custom-loader" />
                  توليد.....
                </>
              ) : (
                <>
                  <ImageIcon />
                  توليد
                </>
              )}
            </button>
          </div>

          {error && <div className="custom-error-message">{error}</div>} */}
        </div>

        {/* {image && <ImageDisplay imageData={image} />} */}
      </div>
    </div>
  );
}

export default Model;
