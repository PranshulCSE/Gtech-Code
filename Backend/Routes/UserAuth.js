const express= require('express');
const authRouter = express.Router();


// Register User
authRouter.post('/register',registerUser);
// Login User
authRouter.post('/login',loginUser);
// Logout User
authRouter.post('/logout',logoutUser);
// Get User Profile
authRouter.get('/profile',getUserProfile);

// Reset Password
authRouter.post('/reset-password',resetPassword);
// Update User Profile
authRouter.put('/profile',updateUserProfile);
// Verify User Email
authRouter.post('/verify-email',verifyUserEmail);
