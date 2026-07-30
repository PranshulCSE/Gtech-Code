const express = require('express');
const authRouter = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, getUserStats, resetPassword, updateUserProfile, changePassword, verifyUserEmail, deleteUserProfile } = require('../controller/UserAuthenticate');
const userMiddleware = require('../middlewares/Usermiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { registerAdmin, getAllAdmins, deleteAdmin } = require('../controller/AdminAuthenticate');
const user = require('../model/User');

// Register User
authRouter.post('/register', registerUser);
// Login User
authRouter.post('/login', loginUser);
// Logout User
authRouter.post('/logout', userMiddleware, logoutUser);
// Get User Profile
authRouter.get('/profile', userMiddleware, getUserProfile);
authRouter.get('/stats', userMiddleware, getUserStats);
// Delete User Profile
authRouter.delete('/deleteprofile', userMiddleware, deleteUserProfile);


// Reset Password (public - no auth needed, user isn't logged in when resetting)
authRouter.post('/reset-password', resetPassword);
// Update User Profile
authRouter.put('/profile', userMiddleware, updateUserProfile);
authRouter.post('/change-password', userMiddleware, changePassword);
// Verify User Email (supports /verify-email and /verify-email/:token)
authRouter.post('/verify-email', verifyUserEmail);
authRouter.post('/verify-email/:token', verifyUserEmail);

authRouter.get('/check', userMiddleware, async (req, res) => {
    // Our Auth middleware attaches the decoded token payload to req.user
    const userId = req.user._id;

    const foundUser = await user.findById(userId).select('-password'); // Exclude password from the return data
    if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const reply = { ...foundUser.toObject(), role: req.user.role };
    res.status(200).json(reply);
})

// Admin Routes

// Registering Admin, But checking that if I am having the Admin Powers so we will use the Admin Middleware
authRouter.post('/admin/register', adminMiddleware, registerAdmin)
authRouter.get('/admins', adminMiddleware, getAllAdmins)
authRouter.delete('/admins/:id', adminMiddleware, deleteAdmin)


module.exports = authRouter;