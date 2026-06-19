const jwt = require("jsonwebtoken");

/**
 * REQUIRED authentication middleware
 * Blocks request if token is missing or invalid
 */
const auth = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token." });
    }

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * OPTIONAL authentication middleware
 * Allows guests + logged-in users
 */
const optionalAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Invalid token → treat as guest
    next();
  }
};

module.exports = {
  auth,
  optionalAuth
};
