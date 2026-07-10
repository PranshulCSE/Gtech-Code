const express = require("express");
const app = express();
require("dotenv").config();
const ProblemStatement = require("../model/PS");



const submitCode = async (req, res) => {
    
    try{
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if(!userId || !problemId || !code || !language){
            return res.status(400).send("Missing required fields");
        }

        const Problem= ProblemStatement.findById(problemId);
        if(!Problem){
            return res.status(404).send("Problem Statement not found");
        }
        
    }
    catch(err){
        res.status(500).send("Error in submitting code" + err.message);
    }
}

module.exports = { submitCode };