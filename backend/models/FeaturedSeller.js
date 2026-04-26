const mongoose = require('mongoose');

const featuredSellerSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Ensure a seller can only be featured once
featuredSellerSchema.index({ sellerId: 1 }, { unique: true });

module.exports = mongoose.model('FeaturedSeller', featuredSellerSchema);
