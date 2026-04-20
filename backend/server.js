const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));