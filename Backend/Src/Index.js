const express= require('express');
const app= express();
require('dotenv').config();
const main= require('../config/DB');
const cookieParser=require('cookie-parser');
const authRouter=require("../routes/UserAuth");
const ProblemRouter=require("../routes/ProblemStatement");
const RedisClient = require('../config/Redis');

// To convert request body into json format
app.use(express.json());

// To convert cookies into json format
app.use(cookieParser());

// Routing user to Route
app.use("/user",authRouter);

// Routing user to Problem Statement Route
app.use("/problem",ProblemRouter);

// To Connect MongoDB Database and Start the Server
const InitializeConnection= async ()=>{
    try{
        await Promise.all([main(), RedisClient.connect()]);   
        console.log("Databases connected successfully");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }catch(err){
        console.log("Database connection failed", err);
    }
}


InitializeConnection();
