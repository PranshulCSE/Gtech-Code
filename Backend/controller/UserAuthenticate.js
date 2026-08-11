const user = require('../model/User');
const submission = require('../model/submission');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // NEW: needed for generating reset/verify tokens
const redisClient = require('../config/Redis'); // FIXED: was used in logoutUser but never imported -> ReferenceError. Path matched to actual location: config/Redis.js (same file userMiddleware.js uses).
const sendEmail = require('../utils/sendEmail'); // NEW: small mailer utility -> code given separately, add this file yourself
const { verificationEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');


// Register User
const registerUser = async (req, res) => {
    try {
        ValidateUser(req.body);

        const { firstname, email, password } = req.body;


        const hashedPassword = await bcrypt.hash(password, 10);

        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
        const clientUrl = process.env.CLIENT_URL;

        // FIX: Explicitly assign only whitelisted fields to prevent mass assignment
        const newUser = await user.create({
            firstname,
            email,
            password: hashedPassword,
            role: 'user', // Always set role as 'user' for new registrations
            isVerified: false, // Always require email verification
            verificationToken: hashedVerificationToken,
            verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000
        });

        const token = jwt.sign({ _id: newUser._id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        const verificationUrl = `${clientUrl}/verify-email/${rawVerificationToken}`;

        // FIX: sendEmail was awaited unguarded -> if email credentials/service failed,
        // the whole request threw even though the user was already created in the DB,
        // leaving an orphaned account and a misleading "registration failed" response.
        let emailSent = true;
        try {
            await sendEmail({
                to: newUser.email,
                subject: 'Verify Your Email',
                text: `Please verify your email within 24 hours: ${verificationUrl}`,
                html: verificationEmailTemplate(verificationUrl, newUser.firstname)
            });
        } catch (emailErr) {
            emailSent = false;
            console.log('Verification email failed to send: ', emailErr.message);
        }

        // Extracting Password
        const UserWithoutPassword = newUser.toObject();
        delete UserWithoutPassword.password;
        delete UserWithoutPassword.verificationToken;
        res.status(201).send({
            user: UserWithoutPassword,
            message: emailSent
                ? 'User Registered Successfully. Please verify your email.'
                : 'User Registered Successfully, but the verification email could not be sent. Please try resending it later.'
        })
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
        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        // Extracting Password
        const UserWithoutPassword = existingUser.toObject();
        delete UserWithoutPassword.password;
        res.status(201).send({
            user: UserWithoutPassword,
            message: 'User Logged in Successfully'
        })
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

const calculateStreak = (acceptedSubmissions) => {
    const solvedDays = new Set(
        acceptedSubmissions.map((submissionItem) => new Date(submissionItem.createdAt).toISOString().slice(0, 10))
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (solvedDays.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [submissions, acceptedSubmissions] = await Promise.all([
            submission.find({ userId }).sort({ createdAt: -1 }).populate('problemId', 'title difficulty tags'),
            submission.find({ userId, status: 'accepted' }).sort({ createdAt: -1 })
        ]);

        const solvedCount = req.user.problemsolved?.length || 0;
        const totalAttempts = submissions.length;
        const acceptanceRate = totalAttempts === 0 ? 0 : Math.round((acceptedSubmissions.length / totalAttempts) * 100);
        const streak = calculateStreak(acceptedSubmissions);

        const recentActivity = submissions.slice(0, 5).map((item) => ({
            _id: item._id,
            problemId: item.problemId?._id || item.problemId,
            title: item.problemId?.title || 'Problem',
            difficulty: item.problemId?.difficulty || 'unknown',
            status: item.status,
            language: item.language,
            createdAt: item.createdAt
        }));

        res.status(200).json({
            solvedCount,
            totalAttempts,
            acceptanceRate,
            streak,
            recentActivity,
            recentSubmissions: recentActivity
        });
    } catch (err) {
        res.status(400).json({ message: 'Error fetching stats: ' + err.message });
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

        const clientUrl = process.env.CLIENT_URL;
        const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

        await sendEmail({
            to: existingUser.email,
            subject: 'Password Reset Request',
            text: `Click the link to reset your password (valid for 15 minutes): ${resetUrl}`,
            html: resetPasswordTemplate(resetUrl, existingUser.firstname)
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

        const allowedUpdates = ['firstname', 'lastname', 'age', 'phone', 'address', 'bio'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).send('No valid fields provided to update');
        }

        const updatedUser = await user.findByIdAndUpdate(userId, updates, { runValidators: true, returnDocument: 'after' }).select('-password');

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(400).send('Error updating profile: ' + err.message);
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send('Current password and new password are required');
        }

        const existingUser = await user.findById(req.user._id);

        if (!existingUser) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, existingUser.password);

        if (!isMatch) {
            return res.status(400).send('Current password is incorrect');
        }

        existingUser.password = await bcrypt.hash(newPassword, 10);
        await existingUser.save();

        res.status(200).send('Password changed successfully');
    } catch (err) {
        res.status(400).send('Error changing password: ' + err.message);
    }
}

// Verify User Email
// NEW: Expects a token (e.g. sent at registration time via email, or generated separately)
// as req.params.token or req.query.token. Requires User schema fields:
// isVerified (Boolean), verificationToken (String)
const verifyUserEmail = async (req, res) => {
    try {
        const token = req.params.token || req.query.token || req.body.token;

        if (!token) {
            return res.status(400).send('Verification token is required');
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const existingUser = await user.findOne({
            verificationToken: hashedToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!existingUser) {
            return res.status(400).send('Invalid or expired verification token');
        }

        existingUser.isVerified = true;
        existingUser.verificationToken = undefined;
        existingUser.verificationTokenExpire = undefined;
        await existingUser.save();

        res.status(200).send('Email verified successfully');
    }
    catch (err) {
        res.status(400).send('Error verifying email: ' + err.message);
    }
}

// Delete User Profile
// Deleting User by its ID.
const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const deletedUser = await user.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send('User not found');
        }
        // Deleting the user's session token from Redis to ensure they are logged out after deletion
        const { token } = req.cookies;
        if (token) {
            await redisClient.del(`token:${token}`);
        }
        // Deleting all the user Submissions from the database
        // We are having a  Submission model and it has a reference to the user
        // await Submission.deleteMany({ userId });
        res.status(200).send('User profile deleted successfully');
    }
    catch (err) {
        res.status(400).send('Error deleting profile: ' + err.message);
    }
};

module.exports = { registerUser, loginUser, logoutUser, getUserProfile, getUserStats, resetPassword, updateUserProfile, changePassword, verifyUserEmail, deleteUserProfile };