import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const UploadCard = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      let data;
      try {
        if (file.type.includes("csv")) {
          data = Papa.parse(target.result, { header: true }).data;
        } else if (file.type.includes("json")) {
          data = JSON.parse(target.result);
        }

        // Analyze first 10 rows
        const sampleData = data.slice(0, 10);
        const analysis = analyzeData(data, sampleData);
        
        localStorage.setItem("chartData", JSON.stringify(data));
        localStorage.setItem("dataAnalysis", JSON.stringify(analysis));
        navigate("/visualize");
      } catch (error) {
        setUploadStatus("Error processing file: " + error.message);
      }
    };

    reader.readAsText(file);
  };

  const analyzeData = (fullData, sampleData) => {
    const columns = Object.keys(sampleData[0]);
    const analysis = {};

    columns.forEach(column => {
      const uniqueValues = new Set(fullData.map(row => 
        String(row[column]).toLowerCase().trim()
      ));
      
      // Check if column might be boolean
      const isBoolean = uniqueValues.size <= 3 && 
        Array.from(uniqueValues).every(val => 
          ['yes', 'no', 'maybe', ''].includes(val.toLowerCase())
        );

      // Check if column is numerical
      const isNumeric = fullData.every(row => !isNaN(parseFloat(row[column])));

      analysis[column] = {
        type: isBoolean ? 'boolean' : isNumeric ? 'numeric' : 'text',
        uniqueValues: Array.from(uniqueValues),
        sample: sampleData.map(row => row[column])
      };
    });

    return analysis;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-2 w-96 transition-transform duration-300 transform hover:scale-105">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Upload & Visualize</h2>
      <input type="file" accept=".csv, .json" onChange={handleFileChange} className="mb-4 border border-gray-300 rounded p-2 w-full" />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
        Upload & Visualize
      </button>
      {uploadStatus && <p className="mt-4 text-center text-red-600">{uploadStatus}</p>}
    </div>
  );
};

export default UploadCard;
