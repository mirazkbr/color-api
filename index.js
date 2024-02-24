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
    try {
        const { color } = req.body;
        console.log('Received request with color:', color);

        const newColorCode = await ColorCode.create({ color });
        console.log('Color code stored successfully:', newColorCode);

        res.status(201).json({ message: 'Color code stored successfully', colorCode: newColorCode });
    } catch (err) {
        console.error('Error storing color code:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


app.get('/mycolors', async (req, res) => {
    try {
        const colorCodes = await ColorCode.find();
        res.status(200).json(colorCodes);
    } catch (err) {
        console.error('Error retrieving color codes:', err);
        res.status(500).json({ message: 'Internal server error GET' });
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

