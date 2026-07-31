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

        // Checking if the user is in Redis Blocklist
        // FIX: this used to be inside the same try/catch as the auth logic above, so
        // ANY Redis problem (wrong/missing REDIS_HOST/REDIS_PORT in .env, Redis Cloud
        // being briefly unreachable, etc.) was caught by the outer catch and turned into
        // a blanket 401 "Unauthorized" for every single logged-in user on every request -
        // even though their login/JWT was perfectly valid. A logout-blocklist check
        // failing should never be able to lock out the whole app like that.
        try {
            const IsBlocked = await redisClient.exists(`token:${token}`);
            if (IsBlocked) {
                throw new Error('Invalid Token');
            }
        } catch (redisErr) {
            if (redisErr.message === 'Invalid Token') {
                throw redisErr; // genuinely blocklisted -> still reject
            }
            // Redis itself is unreachable/misconfigured -> log it, but don't take down auth.
            console.warn('Redis blocklist check failed (allowing request through):', redisErr.message);
        }

        req.user = existingUser;
        next();
    }
    catch (err) {
        res.status(401).send('Unauthorized Access: ' + err.message);
    }
}
module.exports = userMiddleware;