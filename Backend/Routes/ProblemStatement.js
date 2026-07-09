const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require('../Middlewares/AdminMiddleware');
const UserMiddleware = require('../Middlewares/UserMiddleware');
const { problemCreate , problemUpdate , problemDelete , problemFetch , problemFetchAll , solvedProblembyUser } = require('../Controller/ProblemStatementController');
 
// All the three controller function required Admin Acces
// So they will be protected by Admin Middleware

// Creating Problem
problemRouter.post("/create",adminMiddleware,problemCreate);
// Updating Problem
problemRouter.put("/update/:id",adminMiddleware,problemUpdate);
// Deleting Problem
problemRouter.delete("/delete/:id",adminMiddleware,problemDelete);


// Fetching the Problem by id
problemRouter.get("/fetch/:id",UserMiddleware,problemFetch);
// Fetching all Problems
problemRouter.get("/", UserMiddleware, problemFetchAll);
// Problem Solved By User
problemRouter.get("/user",UserMiddleware,solvedProblembyUser);

module.exports = problemRouter;