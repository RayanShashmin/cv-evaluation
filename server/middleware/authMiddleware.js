// server/middleware/authMiddleware.js - FIXED VERSION
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Extract token from cookie
    const token = req.cookies.jwt;
    
    if (!token) {
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.user = decoded; // Attach user data (includes _id and role) to request
        next();
    } catch (error) {
        res.status(400).send({ message: "Invalid token." });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).send({ message: "Authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ 
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
            });
        }

        next();
    };
};

module.exports = { authMiddleware, authorize };