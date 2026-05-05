const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        console.log("Auth Header found:", req.headers.authorization);
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                // User not found in DB — fall through to default-user
                console.warn("[Auth] Token valid but user not found in DB. Using default-user.");
                req.user = { id: "default-user" };
            }

            return next();
        } catch (error) {
            console.warn("[Auth] Token verification failed:", error.message);
            // Fall through to default-user instead of blocking
        }
    }

    // No token or token failed — use default-user for development
    console.log("[Auth] No valid token. Using default-user for development.");
    req.user = { id: "default-user" };
    next();
};

module.exports = { protect };
