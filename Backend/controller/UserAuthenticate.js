const user= require('../model/User');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Register User

const Register = async (req,res)=>{
    try{
        // Validating the request body
        ValidateUser(req.body);
       
        const {firstname,email,password} = req.body;

        // Hash the password before saving it
        req.body.password = await bcrypt.hash(password, 10);

        // Creating a new user in the database

        const newUser = await user.create({ ...req.body, password: hashedPassword });

        //Generating JSON Web Token (JWT) for the user
        const token = jwt.sign({ _id:newUser._id,email:newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //   Setting the token in the Cookie and Setting its MaxAge to 1 hour
        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 }); 

        res.status(201).send('User Registered Successfully');

    }
    catch(err){
        res.status(400).json({message: 'Error registering user'});
    }
}

// Login User

const Login = async (req,res)=>{
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

const Logout = async (req,res)=>{
    try{
        res.clearCookie('token');
        res.status(200).send('User Logged out Successfully');
    }
    catch(err){
        res.status(400).send('Error logging out user');
    }
}
// Get User Profile
 

// Reset Password

// Update User Profile

// Verify User Email

