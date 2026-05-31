"use client";

import React, { useState, useRef, useCallback } from "react";
import Footer from "@/components/footer";

type TabType = "image" | "text" | "pdf" | "audio" | "video" | "url";

interface ImageFileInfo {
  resolution: string;
  mimeType: string;
  extension: string;
  size: string;
  channels: string;
  bitDepth: string;
}

export default function Base64Converter() {
  const [activeTab, setActiveTab] = useState<TabType>("image");

  // Image states
  const [imageBase64, setImageBase64] = useState("");
  const [decodedImage, setDecodedImage] = useState<string>("");
  const [imageFileInfo, setImageFileInfo] = useState<ImageFileInfo | null>(
    null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Text states
  const [textBase64, setTextBase64] = useState("");
  const [decodedText, setDecodedText] = useState("");

  // PDF states
  const [pdfBase64, setPdfBase64] = useState("");
  const [decodedPdf, setDecodedPdf] = useState<string>("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Audio states
  const [audioBase64, setAudioBase64] = useState("");
  const [decodedAudio, setDecodedAudio] = useState<string>("");
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Video states
  const [videoBase64, setVideoBase64] = useState("");
  const [decodedVideo, setDecodedVideo] = useState<string>("");
  const videoInputRef = useRef<HTMLInputElement>(null);

  // URL states
  const [urlBase64, setUrlBase64] = useState("");
  const [decodedUrl, setDecodedUrl] = useState("");

  // Image encoding
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limit image size to 10MB to prevent memory issues
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("Image file is too large. Maximum size is 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        setImageBase64(base64Data);

        // Get image info
        const img = new Image();
        img.onload = () => {
          setImageFileInfo({
            resolution: `${img.width} x ${img.height}`,
            mimeType: file.type,
            extension: file.name.split(".").pop() || "unknown",
            size: formatFileSize(file.size),
            channels: "RGB",
            bitDepth: "24",
          });
        };
        img.src = result;
      };
      reader.onerror = () => {
        alert("Error reading image file");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Image decoding
  const handleImageDecode = useCallback(() => {
    if (!imageBase64) return;

    try {
      const mimeType = detectMimeType(imageBase64);
      const fullBase64 = `data:${mimeType};base64,${imageBase64}`;
      setDecodedImage(fullBase64);

      // Get image info
      const img = new Image();
      img.onload = () => {
        setImageFileInfo({
          resolution: `${img.width} x ${img.height}`,
          mimeType: mimeType,
          extension: mimeType.split("/")[1] || "unknown",
          size: formatFileSize((imageBase64.length * 3) / 4),
          channels: "RGB",
          bitDepth: "24",
        });
      };
      img.src = fullBase64;
    } catch {
      alert("Error decoding Base64");
    }
  }, [imageBase64]);

  const downloadImage = useCallback(() => {
    if (!decodedImage) return;

    const link = document.createElement("a");
    link.href = decodedImage;
    const ext = imageFileInfo?.extension || "png";
    link.download = `image.${ext}`;
    link.click();
  }, [decodedImage, imageFileInfo]);

  // Text encoding
  const handleTextEncode = useCallback((text: string) => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(text)));
      setTextBase64(encoded);
    } catch {
      alert("Error encoding text");
    }
  }, []);

  // Text decoding
  const handleTextDecode = useCallback(() => {
    if (!textBase64) return;

    try {
      const decoded = decodeURIComponent(escape(atob(textBase64)));
      setDecodedText(decoded);
    } catch {
      alert("Error decoding Base64");
    }
  }, [textBase64]);

  // PDF encoding
  const handlePdfUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limit PDF size to 25MB to prevent memory issues
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        alert("PDF file is too large. Maximum size is 25MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        setPdfBase64(base64Data);
      };
      reader.onerror = () => {
        alert("Error reading PDF file");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // PDF decoding
  const handlePdfDecode = useCallback(() => {
    if (!pdfBase64) return;

    try {
      const fullBase64 = `data:application/pdf;base64,${pdfBase64}`;
      setDecodedPdf(fullBase64);
    } catch {
      alert("Error decoding Base64");
    }
  }, [pdfBase64]);

  const downloadPdf = useCallback(() => {
    if (!decodedPdf) return;

    const link = document.createElement("a");
    link.href = decodedPdf;
    link.download = "document.pdf";
    link.click();
  }, [decodedPdf]);

  const clearImage = useCallback(() => {
    setImageBase64("");
    setDecodedImage("");
    setImageFileInfo(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  const clearText = useCallback(() => {
    setTextBase64("");
    setDecodedText("");
  }, []);

  const clearPdf = useCallback(() => {
    setPdfBase64("");
    setDecodedPdf("");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  }, []);

  // Audio encoding
  const handleAudioUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limit audio size to 20MB to prevent memory issues
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        alert("Audio file is too large. Maximum size is 20MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        setAudioBase64(base64Data);
      };
      reader.onerror = () => {
        alert("Error reading audio file");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Audio decoding
  const handleAudioDecode = useCallback(() => {
    if (!audioBase64) return;

    try {
      const fullBase64 = `data:audio/mp3;base64,${audioBase64}`;
      setDecodedAudio(fullBase64);
    } catch {
      alert("Error decoding Base64");
    }
  }, [audioBase64]);

  const downloadAudio = useCallback(() => {
    if (!decodedAudio) return;

    const link = document.createElement("a");
    link.href = decodedAudio;
    link.download = "audio.mp3";
    link.click();
  }, [decodedAudio]);

  const clearAudio = useCallback(() => {
    setAudioBase64("");
    setDecodedAudio("");
    if (audioInputRef.current) audioInputRef.current.value = "";
  }, []);

  // Video encoding
  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limit video size to 50MB to prevent memory issues
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert("Video file is too large. Maximum size is 50MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        setVideoBase64(base64Data);
      };
      reader.onerror = () => {
        alert("Error reading video file");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Video decoding
  const handleVideoDecode = useCallback(() => {
    if (!videoBase64) return;

    try {
      const fullBase64 = `data:video/mp4;base64,${videoBase64}`;
      setDecodedVideo(fullBase64);
    } catch {
      alert("Error decoding Base64");
    }
  }, [videoBase64]);

  const downloadVideo = useCallback(() => {
    if (!decodedVideo) return;

    const link = document.createElement("a");
    link.href = decodedVideo;
    link.download = "video.mp4";
    link.click();
  }, [decodedVideo]);

  const clearVideo = useCallback(() => {
    setVideoBase64("");
    setDecodedVideo("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, []);

  // URL encoding
  const handleUrlEncode = useCallback((url: string) => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(url)));
      setUrlBase64(encoded);
    } catch {
      alert("Error encoding URL");
    }
  }, []);

  // URL decoding
  const handleUrlDecode = useCallback(() => {
    if (!urlBase64) return;

    try {
      const decoded = decodeURIComponent(escape(atob(urlBase64)));
      setDecodedUrl(decoded);
    } catch {
      alert("Error decoding Base64");
    }
  }, [urlBase64]);

  const clearUrl = useCallback(() => {
    setUrlBase64("");
    setDecodedUrl("");
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Base64 Converter
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-gray-900 rounded-lg p-1 flex gap-1 flex-wrap justify-center">
            {(
              ["image", "text", "pdf", "audio", "video", "url"] as TabType[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all capitalize text-sm sm:text-base ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Image Tab */}
        {activeTab === "image" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode Image to Base64
              </h2>
              <div className="space-y-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {imageBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={imageBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(imageBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to Image
              </h2>
              <div className="space-y-4">
                <textarea
                  value={imageBase64}
                  onChange={(e) => setImageBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleImageDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearImage}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedImage && (
                  <div className="space-y-4 mt-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <img
                        src={decodedImage}
                        alt="Decoded"
                        className="max-w-full h-auto rounded-lg border border-gray-700"
                      />
                    </div>

                    {imageFileInfo && (
                      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">
                          File Info
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Resolution:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.resolution}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">MIME type:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.mimeType}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Extension:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.extension}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Size:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.size}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Channels:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.channels}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Bit depth:</span>{" "}
                            <span className="text-gray-200">
                              {imageFileInfo.bitDepth}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={downloadImage}
                          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                          Download: image.{imageFileInfo.extension}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Text Tab */}
        {activeTab === "text" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode Text to Base64
              </h2>
              <div className="space-y-4">
                <textarea
                  placeholder="Enter text to encode..."
                  onChange={(e) => handleTextEncode(e.target.value)}
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 resize-none"
                />
                {textBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={textBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(textBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to Text
              </h2>
              <div className="space-y-4">
                <textarea
                  value={textBase64}
                  onChange={(e) => setTextBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleTextDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearText}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedText && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-200">
                      Decoded Text
                    </h3>
                    <textarea
                      value={decodedText}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 resize-none"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(decodedText)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Text
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PDF Tab */}
        {activeTab === "pdf" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode PDF to Base64
              </h2>
              <div className="space-y-4">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {pdfBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={pdfBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(pdfBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to PDF
              </h2>
              <div className="space-y-4">
                <textarea
                  value={pdfBase64}
                  onChange={(e) => setPdfBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePdfDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearPdf}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedPdf && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">
                            PDF Document
                          </p>
                          <p className="text-gray-400 text-sm">
                            Size: {formatFileSize((pdfBase64.length * 3) / 4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={downloadPdf}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === "audio" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode Audio to Base64
              </h2>
              <div className="space-y-4">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {audioBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={audioBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(audioBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to Audio
              </h2>
              <div className="space-y-4">
                <textarea
                  value={audioBase64}
                  onChange={(e) => setAudioBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAudioDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearAudio}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedAudio && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <audio src={decodedAudio} controls className="w-full" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">
                            Audio File
                          </p>
                          <p className="text-gray-400 text-sm">
                            Size: {formatFileSize((audioBase64.length * 3) / 4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={downloadAudio}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                      >
                        Download Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === "video" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode Video to Base64
              </h2>
              <div className="space-y-4">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {videoBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={videoBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(videoBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to Video
              </h2>
              <div className="space-y-4">
                <textarea
                  value={videoBase64}
                  onChange={(e) => setVideoBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleVideoDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearVideo}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedVideo && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <video
                        src={decodedVideo}
                        controls
                        className="w-full max-h-96 rounded-lg"
                      />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">
                            Video File
                          </p>
                          <p className="text-gray-400 text-sm">
                            Size: {formatFileSize((videoBase64.length * 3) / 4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={downloadVideo}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                      >
                        Download Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === "url" && (
          <div className="space-y-6">
            {/* Encode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Encode URL to Base64
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter URL to encode..."
                  onChange={(e) => handleUrlEncode(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300"
                />
                {urlBase64 && (
                  <div className="space-y-3">
                    <textarea
                      value={urlBase64}
                      readOnly
                      className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                      placeholder="Base64 string will appear here..."
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(urlBase64)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy Base64
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Decode Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                Decode Base64 to URL
              </h2>
              <div className="space-y-4">
                <textarea
                  value={urlBase64}
                  onChange={(e) => setUrlBase64(e.target.value)}
                  placeholder="Paste Base64 string here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleUrlDecode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Decode
                  </button>
                  <button
                    onClick={clearUrl}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {decodedUrl && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-200">
                      Decoded URL
                    </h3>
                    <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200 font-medium break-all">
                          {decodedUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(decodedUrl)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Copy URL
                    </button>
                    {decodedUrl.startsWith("http") && (
                      <a
                        href={decodedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors inline-block"
                      >
                        Open URL
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 border-t border-gray-800 pt-6 sm:pt-8">
          <Footer />
        </footer>
      </div>
    </div>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function detectMimeType(base64: string): string {
  // Simple detection based on common patterns
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("R0lGODlh")) return "image/gif";
  if (base64.startsWith("Qk0")) return "image/bmp";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/png"; // default
}
