import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import axios from "axios";

const UploadCard = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Processing file...");

    try {
      // Create a promise to handle file reading
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            let data;
            if (file.type === "application/json") {
              data = JSON.parse(event.target.result);
            } else {
              // Parse CSV using PapaParse
              const result = Papa.parse(event.target.result, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
              });
              data = result.data;
            }
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      // Store data locally
      localStorage.setItem("chartData", JSON.stringify(fileData));

      // Attempt to upload to server
      try {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post("http://localhost:8001/ai21/upload-dataset", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setUploadStatus("Upload successful");
      } catch (uploadError) {
        console.warn("Server upload failed, continuing with local data:", uploadError);
        setUploadStatus("Connected to local data");
      }

      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to visualization
      navigate("/visualize");

    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus("Error processing file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-transparent backdrop-blur-sm border border-gray-700 shadow-xl rounded-lg p-8 m-2 w-[500px] transition-all duration-300 hover:shadow-blue-500/20">
      {/* Datamatic Logo */}
      <h1 className="text-5xl font-extrabold tracking-wider text-center relative mb-12">
        <span className="text-blue-400 animate-pulse">Data</span>
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text">
          matic
        </span>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"></div>
      </h1>

      {/* Upload Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-200">
          Upload & Visualize
        </h2>
        
        <div className="relative">
          <input 
            type="file" 
            accept=".csv, .json" 
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload"
          />
          <label 
            htmlFor="file-upload" 
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 
                     text-gray-300 cursor-pointer hover:bg-gray-700/50 transition-colors
                     flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{file ? file.name : 'Choose a CSV or JSON file'}</span>
          </label>
        </div>

        <button 
          onClick={handleUpload} 
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transform transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.98] font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">Processing...</span>
            </div>
          ) : (
            "Upload & Visualize"
          )}
        </button>

        {uploadStatus && (
          <p className="mt-4 text-center text-red-400 bg-red-900/20 py-2 px-4 rounded-lg">
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadCard;
