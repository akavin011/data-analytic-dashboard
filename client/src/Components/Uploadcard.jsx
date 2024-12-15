import React, { useState } from 'react';

const UploadCard = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setUploadStatus(`File uploaded successfully! File URL: ${result.fileUrl}`);
                console.log("Response from server:", result);
            } else {
                const error = await response.json();
                setUploadStatus(`File upload failed: ${error.error}`);
                console.error("Upload failed:", response.statusText);
            }
        } catch (error) {
            setUploadStatus("Error during upload.");
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 m-2 w-80 transition-transform duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Upload Data</h2>
            <input
                type="file"
                accept=".csv, .xlsx, .xls, .json"
                onChange={handleFileChange}
                className="mb-4 border border-gray-300 rounded p-2 w-full"
            />
            <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                Upload
            </button>
            {uploadStatus && (
                <p className={`mt-4 text-center ${uploadStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {uploadStatus}
                </p>
            )}
        </div>
    );
};

export default UploadCard;
