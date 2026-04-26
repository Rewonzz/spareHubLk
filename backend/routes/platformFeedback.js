const express = require('express');
const PlatformFeedback = require('../models/PlatformFeedback');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/feedback — get all platform feedback (public)
router.get('/', async (req, res) => {
    try {
        const feedbacks = await PlatformFeedback.find()
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(feedbacks);
    } catch (err) {
        console.error('Get platform feedback error:', err);
        res.status(500).json({ message: 'Server error fetching feedback.' });
    }
});

// GET /api/feedback/stats — get platform stats (public)
router.get('/stats', async (req, res) => {
    try {
        const stats = await PlatformFeedback.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                }
            }
        ]);
        const counts = await PlatformFeedback.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);
        res.json({
            total: stats[0]?.total || 0,
            avgRating: stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0,
            distribution: counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
        });
    } catch (err) {
        console.error('Get feedback stats error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/feedback — add platform feedback (auth required)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { rating, comment, category } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const feedback = new PlatformFeedback({
            user: req.user.id,
            userName: req.user.name,
            userAvatar: req.user.avatar || null,
            rating: parseInt(rating),
            comment: comment.trim(),
            category: category || 'platform',
        });

        await feedback.save();

        const populated = await PlatformFeedback.findById(feedback._id)
            .populate('user', 'name avatar');

        res.status(201).json({ message: 'Feedback submitted.', feedback: populated });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already submitted feedback.' });
        }
        console.error('Add platform feedback error:', err);
        res.status(500).json({ message: 'Server error adding feedback.' });
    }
});

// DELETE /api/feedback/:id — delete feedback (owner or admin)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const feedback = await PlatformFeedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }
        if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        await feedback.deleteOne();
        res.json({ message: 'Feedback deleted.' });
    } catch (err) {
        console.error('Delete feedback error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
