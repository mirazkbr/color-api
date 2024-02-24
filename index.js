app.post('/colors', async (req, res) => {
    try {
        const { color } = req.body;
        console.log('Received request with color:', color);

        const newColorCode = await ColorCode.create({ color });
        console.log('Color code stored successfully:', newColorCode);

        res.status(201).json({ message: 'Color code stored successfully', colorCode: newColorCode });
    } catch (err) {
        console.error('Error storing color code:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
