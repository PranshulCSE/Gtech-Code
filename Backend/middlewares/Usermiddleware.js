const jwt = require('jsonwebtoken');
const user = require('../model/User');
const redisClient = require('../config/Redis');

const userMiddleware = async (req, res, next) => {
    try {
        // Check if the token exists in the cookies
        const { token } = req.cookies;

        if (!token) {
            throw new Error('Access Denied. No token provided.');
        }

        // Token Exists, Verify it
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user exists in the database
        const { _id } = payload;

        if (!_id) {
            throw new Error('Invalid ID');
        }


        const existingUser = await user.findById(_id);

        if (!existingUser) {
            throw new Error('User not found');
        }

        // Checking if the user is in Reddis Blocklist
        const IsBlocked = await redisClient.exists(`token:${token}`);

        if (IsBlocked) {
            throw new Error('Invalid Token');
        }

        req.user = existingUser; // FIXED: was `req.result` -> authController.js (getUserProfile, updateUserProfile) reads `req.user._id`, so it never matched and both routes would crash with "Cannot read properties of undefined". Renamed to req.user to match the rest of the codebase.
        next();
    }
    catch (err) {
        res.status(401).send('Unauthorized Access: ' + err.message);
    }
}
module.exports = userMiddleware;