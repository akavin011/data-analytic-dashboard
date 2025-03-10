const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const dotenv = require('dotenv');
const port = 5000;

dotenv.config(); // Load environment variables

const app = express(); // Moved app declaration here
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json()); // Essential for handling JSON data

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fileUploads', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// MongoDB schema and model
const fileSchema = new mongoose.Schema({
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now },
});
const FileModel = mongoose.model('File', fileSchema);

// Multer setup for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'files')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = path.extname(req.file.originalname);

    if (!allowedTypes.includes(fileExtension)) {
        fs.unlinkSync(filePath); // Delete unsupported file immediately
        return res.status(400).json({ error: 'Unsupported file type.' });
    }

    // Upload to Cloudinary
    cloudinary.uploader.upload(filePath, { resource_type: "auto" }, async (error, result) => {
        if (error) {
            fs.unlinkSync(filePath); // Clean up failed upload files
            return res.status(500).json({ error: 'Upload to Cloudinary failed.' });
        }

        // Save file URL in MongoDB
        const fileRecord = new FileModel({ fileUrl: result.secure_url });
        try {
            await fileRecord.save();
            res.status(200).json({ fileUrl: result.secure_url });
        } catch (err) {
            res.status(500).json({ error: 'Error saving file URL to database.' });
        } finally {
            fs.unlinkSync(filePath); // Clean up after successful upload
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
