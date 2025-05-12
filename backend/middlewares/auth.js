const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // If no token is found, deny access
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token with the secret key
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Store the decoded payload (e.g., user info) in req.user
    req.user = decoded;

    console.log("Decoded token:", decoded);
    

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token", error: err.message });
  }
};

module.exports = authenticateToken;