const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const port = 5001;

// Load environment variables from .env file
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fileUploads', { useNewUrlParser: true, useUnifiedTopology: true });

// MongoDB schema and model
const fileSchema = new mongoose.Schema({
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now },
});
const FileModel = mongoose.model('File', fileSchema);

// Multer setup for local file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'files')); // Local storage for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to the file name
    }
});
const upload = multer({ storage: storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    // Ensure file is of a valid type
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = path.extname(req.file.originalname);

    if (!allowedTypes.includes(fileExtension)) {
        return res.status(400).send('Unsupported file type.');
    }

    // Upload file to Cloudinary
    cloudinary.uploader.upload(filePath, { resource_type: "auto" }, (error, result) => {
        if (error) {
            return res.status(500).send({ error: 'Upload to Cloudinary or database failed.' });
        }

        // Save file URL in MongoDB
        const fileUrl = result.secure_url;
        const fileRecord = new FileModel({ fileUrl });

        fileRecord.save()
            .then(() => {
                res.status(200).json({ fileUrl });

                // Optionally, delete the file from the local server after upload
                fs.unlinkSync(filePath);
            })
            .catch((err) => res.status(500).send({ error: 'Error saving file URL to database.' }));
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
