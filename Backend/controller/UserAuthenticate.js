const user= require('../model/User');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register User

const registerUser = async (req, res) => {
    try {
        ValidateUser(req.body);

        const { firstname, email, password } = req.body;

   
        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.role = 'user'; // Assigning the role as 'user' for all new registrations

        const newUser = await user.create({ ...req.body, password: hashedPassword });

        const token = jwt.sign({ _id: newUser._id, email: newUser.email , role: newUser.role}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.status(201).send('User Registered Successfully');
    }
    catch (err) {
        res.status(400).send('Error registering user' + err);
    }
}

// Login User

const loginUser = async (req,res)=>{
try{
    const {email,password} = req.body;

    if(!email || !password){
        throw new Error('Credentials are Missing');
    }

    const existingUser = await user.findOne({ email});

    if(!existingUser){
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);

    if(!isMatch){
        throw new Error('Invalid credentials');
    }

    //Generating JSON Web Token (JWT) for the user
    const token = jwt.sign({ _id: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    //   Setting the token in the Cookie and Setting its MaxAge to 1 hour
    res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); 

    res.status(200).send('User Logged in Successfully');
}

catch(err){
    res.status(401).send('Error logging in user'+err);
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
const logoutUser = async (req,res)=>{
    try{
        // validating the Token using Middleware
        const {token}=req.cookies;

        // Adding the Token to the ReddisBlacklist to Invalidate it on the Server Side
        
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, 'blocked'); // Set token as blocked
        await redisClient.expireAt(`token:${token}`, payload.exp); // Set expiration time to match the token's expiration

        res.cookie("Token",null,new Date(0)); // Clear the cookie by setting it to null and expiring it immediately
        res.status(200).send('User Logged out Successfully');
    }
    catch(err){
        res.status(401).send('Error logging out user');
    }
}

// Get User Profile

const getUserProfile = async(req,res)=>{
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

const resetPassword = async(req,res)=>{
    res.send('This functionality is temporarily unavailable. Please try again later.');
}

// Update User Profile

const updateUserProfile = async(req,res)=>{
    res.send('This functionality is temporarily unavailable. Please try again later.');}

// Verify User Email

const verifyUserEmail = async(req,res)=>{
    res.send('This functionality is temporarily unavailable. Please try again later.'); 

}

module.exports = {registerUser,loginUser,logoutUser,getUserProfile,resetPassword,updateUserProfile,verifyUserEmail};