const express = require('express');
const authRouter = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, resetPassword, updateUserProfile, verifyUserEmail } = require('../controller/UserAuthenticate');
const userMiddleware = require('../middlewares/Usermiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Register User
authRouter.post('/register', registerUser);
// Login User
authRouter.post('/login', loginUser);
// Logout User
authRouter.post('/logout', userMiddleware, logoutUser);
// Get User Profile
authRouter.get('/profile', userMiddleware, getUserProfile);


// Reset Password (public - no auth needed, user isn't logged in when resetting)
authRouter.post('/reset-password', resetPassword);
// Update User Profile
authRouter.put('/profile', userMiddleware, updateUserProfile); // FIXED: userMiddleware was missing -> req.user would be undefined inside updateUserProfile, causing a crash, and also let anyone (even logged-out users) hit this route.
// Verify User Email (public - user clicks link from email, isn't logged in yet)
authRouter.post('/verify-email', verifyUserEmail);


// Admin Routes
// FIXED: `adminRegister` was never imported/defined anywhere -> Express throws immediately
// on server startup ("Route.post() requires a callback function but got a [object Undefined]"),
// which means the ENTIRE app fails to boot, not just this route.
// Commented out until you create the admin controller. Once ready:
//   const { adminRegister } = require('../controller/AdminController');
// then uncomment the line below.
// authRouter.post('/admin/register',adminMiddleware,adminRegister);

module.exports = authRouter;