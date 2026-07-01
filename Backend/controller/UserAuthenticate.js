const user = require('../model/User');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // NEW: needed for generating reset/verify tokens
const redisClient = require('../config/Redis'); // FIXED: was used in logoutUser but never imported -> ReferenceError. Path matched to actual location: config/Redis.js (same file userMiddleware.js uses).
const sendEmail = require('../utils/sendEmail'); // NEW: small mailer utility -> code given separately, add this file yourself


// Register User

const registerUser = async (req, res) => {
    try {
        ValidateUser(req.body);

        const { firstname, email, password } = req.body;


        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.role = 'user'; // Assigning the role as 'user' for all new registrations

        const newUser = await user.create({ ...req.body, password: hashedPassword });

        const token = jwt.sign({ _id: newUser._id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.status(201).send('User Registered Successfully');
    }
    catch (err) {
        res.status(400).send('Error registering user: ' + err.message); // FIXED: was concatenating raw err object -> showed "[object Object]"/stack leak to client. Use err.message.
    }
}

// Login User

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error('Credentials are Missing');
        }

        const existingUser = await user.findOne({ email });

        if (!existingUser) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        //Generating JSON Web Token (JWT) for the user
        const token = jwt.sign({ _id: existingUser._id, email: existingUser.email, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // FIXED: role was missing here (registerUser token had it, login token didn't) -> auth/role middleware would break right after login.

        //   Setting the token in the Cookie and Setting its MaxAge to 1 hour
        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.status(200).send('User Logged in Successfully');
    }

    catch (err) {
        res.status(401).send('Error logging in user: ' + err.message); // FIXED: raw err -> err.message
    }
}

// Logout User

// const logoutUser = async (req,res)=>{
//     try{
//         res.clearCookie('token');
//         res.status(200).send('User Logged out Successfully');
//     }
//     catch(err){
//         res.status(400).send('Error logging out user');
//     }
// }

// Implementing Logout Feature using Redis to invalidate the JWT token on the server side.
//  This is a more secure approach than just clearing the cookie, as it ensures that the token cannot be used again even if it is still present in the client's cookies.
const logoutUser = async (req, res) => {
    try {
        // validating the Token using Middleware
        const { token } = req.cookies;

        if (!token) { // FIXED: no check earlier -> jwt.decode(undefined) returns null -> payload.exp crash below
            return res.status(401).send('No active session found');
        }

        // Adding the Token to the ReddisBlacklist to Invalidate it on the Server Side

        const payload = jwt.decode(token);

        if (!payload || !payload.exp) { // FIXED: guard against invalid/malformed token before using payload.exp
            return res.status(401).send('Invalid token');
        }

        await redisClient.set(`token:${token}`, 'blocked'); // Set token as blocked
        await redisClient.expireAt(`token:${token}`, payload.exp); // Set expiration time to match the token's expiration

        res.clearCookie('token'); // FIXED: original was `res.cookie("Token", null, new Date(0))` -> wrong cookie name case ("Token" vs "token" set at login) so the real cookie never got cleared, AND 3rd arg to res.cookie must be an options object, not a Date.
        res.status(200).send('User Logged out Successfully');
    }
    catch (err) {
        res.status(401).send('Error logging out user: ' + err.message); // FIXED: raw err -> err.message
    }
}

// Get User Profile

const getUserProfile = async (req, res) => {
    try {
        // Our Auth middleware attaches the decoded token payload to req.user
        const userId = req.user._id;

        const foundUser = await user.findById(userId).select('-password'); // Exclude password from the return data
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(foundUser);
    }
    catch (err) {
        res.status(400).json({ message: 'Error fetching profile: ' + err.message });
    }
}

// Reset Password
// NEW: Implemented full flow in a single controller (two modes based on req.body):
//   1) { email }              -> generates a reset token, saves its hash + expiry on the user, emails the raw token/link
//   2) { token, newPassword } -> verifies token + expiry, sets new hashed password, clears reset fields
// Requires User schema fields: resetPasswordToken (String), resetPasswordExpire (Date)
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        // Mode 2: actually resetting the password using the token from the email link
        if (token && newPassword) {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const existingUser = await user.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() }
            });

            if (!existingUser) {
                return res.status(400).send('Reset token is invalid or has expired');
            }

            existingUser.password = await bcrypt.hash(newPassword, 10);
            existingUser.resetPasswordToken = undefined;
            existingUser.resetPasswordExpire = undefined;
            await existingUser.save();

            return res.status(200).send('Password has been reset successfully');
        }

        // Mode 1: requesting a reset link
        if (!email) {
            return res.status(400).send('Email is required');
        }

        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            // Not revealing whether the email exists, to avoid user enumeration
            return res.status(200).send('If that email is registered, a reset link has been sent');
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        existingUser.resetPasswordToken = hashedToken;
        existingUser.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await existingUser.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

        await sendEmail({
            to: existingUser.email,
            subject: 'Password Reset Request',
            text: `Click the link to reset your password (valid for 15 minutes): ${resetUrl}`
        });

        res.status(200).send('If that email is registered, a reset link has been sent');
    }
    catch (err) {
        res.status(400).send('Error resetting password: ' + err.message);
    }
}

// Update User Profile
// NEW: Updates only whitelisted fields for the logged-in user (req.user from auth middleware).
// Blocks direct changes to role/email/password through this endpoint for security;
// password change should go through resetPassword, role should never be user-editable.
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const allowedUpdates = ['firstname', 'lastname', 'phone', 'address'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).send('No valid fields provided to update');
        }

        const updatedUser = await user.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(400).send('Error updating profile: ' + err.message);
    }
}

// Verify User Email
// NEW: Expects a token (e.g. sent at registration time via email, or generated separately)
// as req.params.token or req.query.token. Requires User schema fields:
// isVerified (Boolean), verificationToken (String)
const verifyUserEmail = async (req, res) => {
    try {
        const token = req.params.token || req.query.token;

        if (!token) {
            return res.status(400).send('Verification token is required');
        }

        const existingUser = await user.findOne({ verificationToken: token });

        if (!existingUser) {
            return res.status(400).send('Invalid or expired verification token');
        }

        existingUser.isVerified = true;
        existingUser.verificationToken = undefined;
        await existingUser.save();

        res.status(200).send('Email verified successfully');
    }
    catch (err) {
        res.status(400).send('Error verifying email: ' + err.message);
    }
}

module.exports = { registerUser, loginUser, logoutUser, getUserProfile, resetPassword, updateUserProfile, verifyUserEmail };