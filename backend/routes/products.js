const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
});

// POST /api/products/upload — Upload images (protected)
router.post('/upload', verifyToken, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded.' });
        }
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ images: imageUrls });
    } catch (err) {
        console.error('Image upload error:', err);
        res.status(500).json({ message: 'Error uploading images.' });
    }
});

// POST /api/products — Create a new product listing (protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, price, condition, category, subCategory, vehicleModel, vehicleYear, chassisNumber, location, locationCoords, specs, images } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({ message: 'Title, price, and category are required.' });
        }

        if (!vehicleModel || !vehicleYear) {
            return res.status(400).json({ message: 'Vehicle model and year are required.' });
        }

        const product = new Product({
            title,
            price: parseFloat(price),
            condition: condition || 'New',
            category,
            subCategory: subCategory || '',
            vehicleModel: vehicleModel || '',
            vehicleYear: vehicleYear || '',
            chassisNumber: chassisNumber || '',
            location: location || 'Colombo, LK',
            locationCoords: locationCoords || { lat: null, lng: null },
            specs: specs || [],
            images: images || [],
            seller: req.user.id,
            sellerUsername: req.user.name,
            sellerPhone: req.user.phone || '',
        });

        await product.save();

        res.status(201).json({
            message: 'Product listed successfully.',
            product,
        });
    } catch (err) {
        console.error('Product create error:', err);
        res.status(500).json({ message: 'Server error while creating product.' });
    }
});

// GET /api/products — Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { search, category, seller, model, year, engine } = req.query;
        const andConditions = [{ status: 'active' }];

        if (search) {
            andConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { subCategory: { $regex: search, $options: 'i' } },
                    { vehicleModel: { $regex: search, $options: 'i' } }
                ]
            });
        }
        if (category) {
            andConditions.push({ category: { $regex: category, $options: 'i' } });
        }
        if (seller) {
            andConditions.push({ seller });
        }
        if (model) {
            andConditions.push({ vehicleModel: { $regex: model, $options: 'i' } });
        }
        if (year) {
            andConditions.push({ vehicleYear: { $regex: year, $options: 'i' } });
        }
        if (engine) {
            andConditions.push({
                $or: [
                    { title: { $regex: engine, $options: 'i' } },
                    { chassisNumber: { $regex: engine, $options: 'i' } },
                    { 'specs.value': { $regex: engine, $options: 'i' } }
                ]
            });
        }

        const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

        const products = await Product.find(query).populate('seller', 'name phone location isPremium').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error('Products fetch error:', err);
        res.status(500).json({ message: 'Server error fetching products.' });
    }
});

// GET /api/products/seller/:userId — Get products by a specific seller (public)
router.get('/seller/:userId', async (req, res) => {
    try {
        const products = await Product.find({ seller: req.params.userId, status: 'active' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching seller products.' });
    }
});

// GET /api/products/mine — Get logged-in user's products (protected)
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching your products.' });
    }
});

// GET /api/products/:id — Get one product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('seller', 'name phone location');

        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/products/:id — admin only, delete product
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        // Delete associated image files
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgPath => {
                const filePath = path.join(__dirname, '..', imgPath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ message: 'Server error deleting product.' });
    }
});

module.exports = router;
