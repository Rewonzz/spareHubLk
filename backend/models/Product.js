const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    condition: { type: String, enum: ['New', 'Used'], default: 'New' },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    vehicleModel: { type: String, default: '', trim: true },
    vehicleYear: { type: String, default: '', trim: true },
    chassisNumber: { type: String, default: '', trim: true },
    location: { type: String, default: 'Colombo, LK', trim: true },
    locationCoords: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
    },
    specs: [{ key: String, value: String }],
    images: [{ type: String }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerUsername: { type: String, required: true },
    sellerPhone: { type: String, default: '' },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'review', 'sold'], default: 'active' },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
