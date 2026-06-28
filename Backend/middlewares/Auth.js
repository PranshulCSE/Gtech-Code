const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    try {
        // Read token from cookies
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).send('Please Login to access this resource' );
        }

        // Verify token consistency
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        // Inject user data down into the request object for the controllers to consume
        req.user = decodedPayload;

        next();
    } catch (err) {
        res.status(401).send('Authentication failed: Invalid or expired token');
    }
};

module.exports = userAuth;