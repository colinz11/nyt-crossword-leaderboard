const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const nytRoutes = require('./routes/nytRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/nyt', nytRoutes());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});