const express = require('express');
const authRouter = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, resetPassword, updateUserProfile, verifyUserEmail, deleteUserProfile } = require('../controller/UserAuthenticate');
const userMiddleware = require('../middlewares/Usermiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const {registerAdmin} = require('../controller/AdminAuthenticate');

// Register User
authRouter.post('/register', registerUser);
// Login User
authRouter.post('/login', loginUser);
// Logout User
authRouter.post('/logout', userMiddleware, logoutUser);
// Get User Profile
authRouter.get('/profile', userMiddleware, getUserProfile);
// Delete User Profile
authRouter.delete('/deleteprofile', userMiddleware, deleteUserProfile); 


// Reset Password (public - no auth needed, user isn't logged in when resetting)
authRouter.post('/reset-password', resetPassword);
// Update User Profile
authRouter.put('/profile', userMiddleware, updateUserProfile); 
// Verify User Email (public - user clicks link from email, isn't logged in yet)
authRouter.post('/verify-email', verifyUserEmail);


// Admin Routes

// Registering Admin, But checking that if I am having the Admin Powers so we will use the Admin Middleware
authRouter.post('/admin/register', adminMiddleware, registerAdmin)


module.exports = authRouter;