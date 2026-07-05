const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require('../Middlewares/AdminMiddleware');
const { problemCreate, problemUpdate, problemDelete, problemFetch, problemFetchAll, solvedProblem } = require('../Controllers/ProblemStatementController');

// All the three controller function required Admin Acces
// So they will be protected by Admin Middleware

// Creating Problem
problemRouter.post("/create",adminMiddleware,problemCreate);
// Updating Problem
problemRouter.patch("/update/:id",adminMiddleware,problemUpdate);
// Deleting Problem
problemRouter.delete("/delete/:id",adminMiddleware,problemDelete);


// Fetching the Problem by id
problemRouter.get("/fetch/:id", problemFetch);
// Fetching all Problems
problemRouter.get("/", problemFetchAll);
// Problem Solved By User
problemRouter.get("/user",solvedProblembyUser);