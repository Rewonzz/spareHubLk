const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => console.log("✅ Database Connected Successfully!"))
  .catch(err => console.error("❌ Database Connection Error:", err));

// --- Auth Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- Product Routes ---
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// --- Premium User Routes ---
const premiumRoutes = require('./routes/premium');
app.use('/api/premium', premiumRoutes);

// --- Review Routes ---
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

// --- Featured Sellers Routes ---
const featuredSellerRoutes = require('./routes/featuredSellers');
app.use('/api/featured-sellers', featuredSellerRoutes);

// --- Platform Feedback Routes ---
const platformFeedbackRoutes = require('./routes/platformFeedback');
app.use('/api/feedback', platformFeedbackRoutes);

// --- Seller Review Routes ---
const sellerReviewRoutes = require('./routes/sellerReviews');
app.use('/api/seller-reviews', sellerReviewRoutes);

// --- Vehicle Schema & Search Route ---
const vehicleSchema = new mongoose.Schema({
  prefix: { type: String, required: true },
  make: String,
  model: String,
  engine: String,
  parts: Array
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

app.get('/api/vehicle/:prefix', async (req, res) => {
  try {
    const car = await Vehicle.findOne({ prefix: req.params.prefix.toUpperCase() });
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: "Vehicle not found in Sri Lankan database" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;