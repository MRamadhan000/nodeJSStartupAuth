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

        const roles = user.roles || [];

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

        // Save the refresh token to the database
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        const newRefreshToken = new RefreshToken({
            userId: user._id,
            token: refreshToken,
            expiresAt,
        });
        await newRefreshToken.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set true in production
            sameSite: 'Strict', // prevents CSRF
            maxAge: 10 * 60 * 1000, // 10 minutes
        });

        // Return access token
        res.status(200).json({
            message: "Login successful",
            accessToken,
        });

    } catch (err) {
        res.status(500).json({
            message: "Login error",
            error: err.message,
        });
    }
};

// Controller to refresh the access token using the refresh token from cookie
exports.refreshToken = async (req, res) => {
    const cookies = req.cookies;

    // Check if the refresh token is present in cookies
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    const token = cookies.jwt;

    try {
        // Find the refresh token in the database
        const refreshTokenDoc = await RefreshToken.findOne({ token });

        // If the token is not found
        if (!refreshTokenDoc) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Check if the refresh token has expired
        if (refreshTokenDoc.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
            return res.status(403).json({ message: "Refresh token has expired" });
        }

        // Verify token
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Token verification failed" });
            }

            const payload = {
                userId: user.userId,
                username: user.username,
                roles: user.roles,
            };

            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });

            res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (err) {
        res.status(500).json({ message: "Error refreshing token", error: err.message });
    }
};

exports.logout = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(400).json({ message: "No refresh token found in cookies" });
    }

    const refreshToken = cookies.jwt;

    try {
        // Delete the refresh token from the database
        const deleted = await RefreshToken.deleteOne({ token: refreshToken });

        // Clear the cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,      // Set to true if using HTTPS
            sameSite: 'Strict' // or 'Lax' depending on your setup
        });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "Refresh token not found or already deleted" });
        }

        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        res.status(500).json({ message: "Logout failed", error: err.message });
    }
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