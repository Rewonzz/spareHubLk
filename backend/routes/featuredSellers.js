const express = require('express');
const FeaturedSeller = require('../models/FeaturedSeller');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/featured-sellers — public, get all featured sellers
router.get('/', async (req, res) => {
    try {
        const featured = await FeaturedSeller.find()
            .populate('sellerId', 'name avatar businessName businessType city isPremium')
            .sort({ order: 1, createdAt: -1 });

        const sellers = featured.map(f => ({
            _id: f._id,
            sellerId: f.sellerId._id,
            name: f.sellerId.name,
            avatar: f.sellerId.avatar,
            shopAvatar: f.sellerId.shopAvatar,
            bannerImage: f.sellerId.bannerImage,
            businessName: f.sellerId.businessName,
            businessType: f.sellerId.businessType,
            city: f.sellerId.city,
            isPremium: f.sellerId.isPremium,
        }));

        res.json(sellers);
    } catch (err) {
        console.error('Get featured sellers error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/featured-sellers — admin only, add a featured seller
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        const { sellerId } = req.body;
        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required.' });
        }

        // Verify seller exists and is a premium/approved seller
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found.' });
        }
        if (!seller.isPremium) {
            return res.status(400).json({ message: 'Only PRO sellers can be featured.' });
        }

        const count = await FeaturedSeller.countDocuments();
        const featured = new FeaturedSeller({ sellerId, order: count });
        await featured.save();

        res.status(201).json({
            message: 'Seller added to featured list.',
            featuredSeller: {
                _id: featured._id,
                sellerId: seller._id,
                name: seller.name,
                avatar: seller.avatar,
                businessName: seller.businessName,
                businessType: seller.businessType,
                city: seller.city,
                isPremium: seller.isPremium,
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'This seller is already featured.' });
        }
        console.error('Add featured seller error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/featured-sellers/:id — admin only, remove a featured seller
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        const featured = await FeaturedSeller.findByIdAndDelete(req.params.id);
        if (!featured) {
            return res.status(404).json({ message: 'Featured seller not found.' });
        }

        res.json({ message: 'Seller removed from featured list.' });
    } catch (err) {
        console.error('Delete featured seller error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
