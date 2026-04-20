const express = require('express');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/products — Create a new product listing (protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, price, condition, category, subCategory, vehicleModel, location } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({ message: 'Title, price, and category are required.' });
        }

        const product = new Product({
            title,
            price: parseFloat(price),
            condition: condition || 'New',
            category,
            subCategory: subCategory || '',
            vehicleModel: vehicleModel || '',
            location: location || 'Colombo, LK',
            seller: req.user.id,
            sellerUsername: req.user.username,
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
        const { search, category, seller } = req.query;
        const query = { status: 'active' };

        if (search) query.title = { $regex: search, $options: 'i' };
        if (category) query.category = { $regex: category, $options: 'i' };
        if (seller) query.seller = seller;

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching products.' });
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
        ).populate('seller', 'username sector');

        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
