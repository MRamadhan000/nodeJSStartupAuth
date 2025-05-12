const User = require("../models/user.js");
const RefreshToken = require("../models/refreshToken.js");
const jwt = require("jsonwebtoken");
const rolesList = require('../config/rolesList');
require("dotenv").config();

// Controller to register a new user
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Create new user
        const newUser = new User({
            username,
            password,
            roles: [2001] // Default: User
        });

        // Save the user to the database
        await newUser.save();

        // Respond with success
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Controller to login a user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Get user's roles from the document
        const roles = user.roles || []; // default to empty array if not present

        // Create payload with roles included
        const payload = {
            userId: user._id,
            username: user.username,
            roles: roles,
        };

        // Generate Access Token (short-lived)
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '5m',
        });

        // Generate Refresh Token (longer-lived)
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '10m',
        });

        // Save the refresh token to DB
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const newRefreshToken = new RefreshToken({
            userId: user._id,
            token: refreshToken,
            expiresAt,
        });

        await newRefreshToken.save();

        // Return tokens
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({
            message: "Login error",
            error: err.message,
        });
    }
};
// Controller to refresh the access token using the refresh token
exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    // Check if the refresh token is provided
    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    try {
        // Find the refresh token in the database
        const refreshTokenDoc = await RefreshToken.findOne({ token: token });

        // If the token is not found in the database
        if (!refreshTokenDoc) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Check if the refresh token has expired
        if (refreshTokenDoc.expiresAt < new Date()) {
            // Token sudah kadaluarsa, hapus token lama dari database
            await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
            return res.status(403).json({ message: "Refresh token has expired" });
        }

        // Verify the token using the refresh token secret key
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Token verification failed" });
            }

            // If the token is valid, generate a new access token
            const payload = {
                userId: user._id,
                username: user.username,
                roles: user.roles 
            };

            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });

            // Send the new access token to the client
            res.json({ accessToken: newAccessToken });
        });
    } catch (err) {
        res.status(500).json({ message: "Error refreshing token", error: err.message });
    }
};

exports.logout = (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.status(200).json({ message: "Logged out successfully" });
};

exports.promoteToAdmin = async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.roles.includes(rolesList.Admin)) {
            user.roles.push(rolesList.Admin);
            await user.save();
        }

        res.status(200).json({ message: `${username} is now an Admin`, roles: user.roles });
    } catch (err) {
        res.status(500).json({ message: 'Error promoting user', error: err.message });
    }
};