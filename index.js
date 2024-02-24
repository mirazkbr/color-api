const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const colorCodeSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true,
        unique: true
    },
});

const ColorCode = mongoose.model('ColorCode', colorCodeSchema);

app.post('/colors', async (req, res) => {
    const { color } = req.body;

    try {
        const newColorCode = await ColorCode.create({ color });
        res.status(201).json({ message: 'Color code stored successfully', colorCode: newColorCode });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        } else if (err.code === 11000) {
            return res.status(400).json({ message: 'Color code already exists' });
        } else {
            console.error('Error storing color code:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

app.get('/colors', async (req, res) => {
    try {
        const colorCodes = await ColorCode.find();
        res.status(200).json(colorCodes);
    } catch (err) {
        console.error('Error retrieving color codes:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/', async (req, res) => {
    try {
        res.send("hello colors");
    } catch (err) {
        console.error('Error retrieving color codes:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
