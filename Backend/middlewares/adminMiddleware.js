// Middlearw to check whether a user is admin or not. This middleware will be used in routes that require admin privileges.


const jwt = require('jsonwebtoken');
const user = require('../model/User');
const redisClient = require('../config/Redis');

const adminMiddleware = async (req, res, next) => {

    try {
        // Check if the token exists in the cookies
        const { token } = req.cookies;

        if (!token) {
            throw new Error('Access Denied. No token provided.');
        }

        // Token Exists, Verify it
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (payload.role !== 'admin') {
            throw new Error('Access Denied. You are not an admin.');
        }

        // Check if the user exists in the database
        const { _id } = payload;

        if (!_id) {
            throw new Error('Invalid ID');
        }


        const existingUser = await user.findById(_id);

        if (!existingUser) {
            throw new Error('Admin not found');
        }

        // Checking if the user is in Redis Blocklist
        // FIX: same issue as Usermiddleware.js - a Redis connection problem shouldn't
        // be able to lock every admin out with a blanket 401.
        try {
            const IsBlocked = await redisClient.exists(`token:${token}`);
            if (IsBlocked) {
                throw new Error('Invalid Token');
            }
        } catch (redisErr) {
            if (redisErr.message === 'Invalid Token') {
                throw redisErr;
            }
            console.warn('Redis blocklist check failed (allowing request through):', redisErr.message);
        }

        req.user = existingUser;
        next();
    }
    catch (err) {
        res.status(401).send('Unauthorized Access: ' + err.message);
    }
}

module.exports = adminMiddleware;