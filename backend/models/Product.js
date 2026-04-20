const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    condition: { type: String, enum: ['New', 'Used'], default: 'New' },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    vehicleModel: { type: String, default: '', trim: true },  // e.g. "Toyota Corolla KSP130"
    location: { type: String, default: 'Colombo, LK', trim: true },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerUsername: { type: String, required: true },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'review', 'sold'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
