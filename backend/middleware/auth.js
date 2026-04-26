const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Always verify the user still exists in the database
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
        }

        // Attach the fresh DB user object so routes always have current data
        req.user = {
            id: user._id.toString(),
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            premiumStatus: user.premiumStatus,
        };
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken };
