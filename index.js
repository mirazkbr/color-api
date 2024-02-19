const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    socketTimeoutMS: 45000, // 45 seconds timeout for socket connection
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define ColorCode schema
const colorCodeSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true,
        unique: true // Ensure uniqueness of color code
    },
});

// Create ColorCode model
const ColorCode = mongoose.model('ColorCode', colorCodeSchema);

// POST endpoint to store color codes
app.post('/colors', async (req, res) => {
    const { color } = req.body;

    try {
        // Attempt to create a new ColorCode
        const newColorCode = await ColorCode.create({ color });
        res.status(201).json({ message: 'Color code stored successfully', colorCode: newColorCode });
    } catch (err) {
        if (err.name === 'ValidationError') {
            // If validation error occurs (e.g., color is missing or not unique)
            return res.status(400).json({ message: err.message });
        } else if (err.code === 11000) {
            // If MongoDB duplicate key error occurs (color already exists)
            return res.status(400).json({ message: 'Color code already exists' });
        } else {
            // For other errors, log and return internal server error
            console.error('Error storing color code:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

// GET endpoint to retrieve all color codes
app.get('/colors', async (req, res) => {
    try {
        // Retrieve all ColorCodes
        const colorCodes = await ColorCode.find();
        res.status(200).json(colorCodes);
    } catch (err) {
        // Handle errors
        console.error('Error retrieving color codes:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
