const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connected');
});

const colorCodeSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: "undefined"
  },
  category: {
    type: String,
    default: "undefined",
    collation: { locale: 'en', strength: 2 } // Specify collation for case-insensitive sorting
  },
});

const ColorCode = mongoose.model('ColorCode', colorCodeSchema);


app.post('/colors', async (req, res) => {
  const { color, name, category } = req.body;

  try {
    const newColorCode = await ColorCode.create({ color, name, category });
    res.status(201).json({ message: 'Color code stored successfully', colorCode: newColorCode });
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/colors', async (req, res) => {
  const { sortByCategory } = req.query;

  try {
    let colorCodes;

    if (sortByCategory === 'true') {
      colorCodes = await ColorCode.find().collation({ locale: 'en', strength: 2 }).sort({ category: 1 }); // Sorting by category case-insensitive
    } else {
      colorCodes = await ColorCode.find();
    }

    res.status(200).json(colorCodes);
  } catch (err) {
    handleError(err, res);
  }
});

app.put('/colors/:id', async (req, res) => {
    const { id } = req.params;
    const { color, name, category } = req.body;

    try {
        const updatedColorCode = await ColorCode.findByIdAndUpdate(
            id, // Change _id to id
            { color, name, category },
            { new: true }
        );

        if (!updatedColorCode) {
            return res.status(404).json({ message: 'Color code not found' });
        }

        res.status(200).json({ message: 'Color code updated successfully', colorCode: updatedColorCode });
    } catch (err) {
        handleError(err, res);
    }
});

app.delete('/colors/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedColorCode = await ColorCode.findByIdAndDelete(id); // Change _id to id

        if (!deletedColorCode) {
            return res.status(404).json({ message: 'Color code not found' });
        }

        res.status(200).json({ message: 'Color code deleted successfully', colorCode: deletedColorCode });
    } catch (err) {
        handleError(err, res);
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function handleError(error, res) {
  if (error.response) {
    console.error('Server responded with an error status:', error.response.status);
    console.error('Error details:', error.response.data);
    res.status(error.response.status).json({ message: error.response.data });
  } else if (error.request) {
    console.error('No response received from the server');
    res.status(500).json({ message: 'Internal server error' });
  } else {
    console.error('Error setting up the request:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
  console.error('Full error:', error);
}
