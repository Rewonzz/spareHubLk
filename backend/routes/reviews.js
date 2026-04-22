const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/:productId — get all reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
});

// POST /api/reviews/:productId — add a review (auth required)
router.post('/:productId', verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Prevent seller from reviewing their own product
        if (product.seller.toString() === req.user.id) {
            return res.status(403).json({ message: 'You cannot review your own product.' });
        }

        const review = new Review({
            product: productId,
            user: req.user.id,
            userName: req.user.name,
            rating: parseInt(rating),
            comment: comment.trim(),
        });

        await review.save();

        // Update product average rating and count
        const stats = await Review.aggregate([
            { $match: { product: product._id } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            product.averageRating = Math.round(stats[0].avgRating * 10) / 10;
            product.reviewCount = stats[0].count;
            await product.save();
        }

        res.status(201).json({ message: 'Review added successfully.', review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this product.' });
        }
        console.error('Add review error:', err);
        res.status(500).json({ message: 'Server error adding review.' });
    }
});

// DELETE /api/reviews/:reviewId — delete a review (owner or admin)
router.delete('/:reviewId', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // Only review owner or admin can delete
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review.' });
        }

        const productId = review.product;
        await review.deleteOne();

        // Recalculate product stats
        const product = await Product.findById(productId);
        if (product) {
            const stats = await Review.aggregate([
                { $match: { product: product._id } },
                { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);
            if (stats.length > 0) {
                product.averageRating = Math.round(stats[0].avgRating * 10) / 10;
                product.reviewCount = stats[0].count;
            } else {
                product.averageRating = 0;
                product.reviewCount = 0;
            }
            await product.save();
        }

        res.json({ message: 'Review deleted successfully.' });
    } catch (err) {
        console.error('Delete review error:', err);
        res.status(500).json({ message: 'Server error deleting review.' });
    }
});

module.exports = router;
