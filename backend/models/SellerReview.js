const mongoose = require('mongoose');

const sellerReviewSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewerName: {
        type: String,
        required: true,
    },
    reviewerAvatar: {
        type: String,
        default: null,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
}, { timestamps: true });

// Prevent duplicate reviews from same user on same seller
sellerReviewSchema.index({ seller: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('SellerReview', sellerReviewSchema);
