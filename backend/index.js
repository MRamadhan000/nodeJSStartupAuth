const express = require('express');
const connectDB = require('./config/db.js');
const boardingHouseRoutes = require('./routes/boardingHouseRoutes.js');
const userRoutes = require('./routes/authRoutes.js');
const cookieParser = require('cookie-parser');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/boardingHouses', boardingHouseRoutes);
app.use('/api/auth', userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});