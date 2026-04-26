const express = require('express');
const SellerReview = require('../models/SellerReview');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/seller-reviews/:sellerId — get reviews for a seller (public)
router.get('/:sellerId', async (req, res) => {
    try {
        const reviews = await SellerReview.find({ seller: req.params.sellerId })
            .populate('reviewer', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error('Get seller reviews error:', err);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
});

// GET /api/seller-reviews/:sellerId/stats — get seller review stats (public)
router.get('/:sellerId/stats', async (req, res) => {
    try {
        const stats = await SellerReview.aggregate([
            { $match: { seller: new require('mongoose').Types.ObjectId(req.params.sellerId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                }
            }
        ]);
        res.json({
            total: stats[0]?.total || 0,
            avgRating: stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0,
        });
    } catch (err) {
        console.error('Get seller review stats error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/seller-reviews/:sellerId — add a seller review (auth required)
router.post('/:sellerId', verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const sellerId = req.params.sellerId;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Prevent self-review
        if (sellerId === req.user.id) {
            return res.status(403).json({ message: 'You cannot review yourself.' });
        }

        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found.' });
        }

        const review = new SellerReview({
            seller: sellerId,
            reviewer: req.user.id,
            reviewerName: req.user.name,
            reviewerAvatar: req.user.avatar || null,
            rating: parseInt(rating),
            comment: comment.trim(),
        });

        await review.save();

        const populated = await SellerReview.findById(review._id)
            .populate('reviewer', 'name avatar');

        res.status(201).json({ message: 'Review added.', review: populated });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this seller.' });
        }
        console.error('Add seller review error:', err);
        res.status(500).json({ message: 'Server error adding review.' });
    }
});

// DELETE /api/seller-reviews/:reviewId — delete a seller review (owner or admin)
router.delete('/:reviewId', verifyToken, async (req, res) => {
    try {
        const review = await SellerReview.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }
        if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted.' });
    } catch (err) {
        console.error('Delete seller review error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
