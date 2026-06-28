const express= require('express');
const authRouter = express.Router();
const {registerUser,loginUser,logoutUser,getUserProfile,resetPassword,updateUserProfile,verifyUserEmail} = require('../controller/UserAuthenticate');
const userAuth = require('../middlewares/Auth');

// Register User
authRouter.post('/register',registerUser);
// Login User
authRouter.post('/login',loginUser);
// Logout User
authRouter.post('/logout',logoutUser);
// Get User Profile
authRouter.get('/profile',userAuth,getUserProfile);


// These Three Functionalities are temporary Unavailable as they are not implemented yet. They are just placeholders for future implementation.
// Reset Password
authRouter.post('/reset-password',resetPassword);
// Update User Profile
authRouter.put('/profile',updateUserProfile);
// Verify User Email
authRouter.post('/verify-email',verifyUserEmail);

module.exports = authRouter;