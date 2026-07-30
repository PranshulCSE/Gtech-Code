const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require('../middlewares/adminMiddleware');
const UserMiddleware = require('../middlewares/Usermiddleware');
const { problemCreate, problemUpdate, problemDelete, problemFetch, problemFetchAll, solvedProblembyUser, submissionbyUser } = require('../controller/ProblemStatementcontroller');

// All the three controller function required Admin Acces
// So they will be protected by Admin Middleware

// Creating Problem
problemRouter.post("/create", adminMiddleware, problemCreate);
// Updating Problem
problemRouter.put("/update/:id", adminMiddleware, problemUpdate);
// Deleting Problem
problemRouter.delete("/delete/:id", adminMiddleware, problemDelete);


// Fetching the Problem by id
problemRouter.get("/fetch/:id", UserMiddleware, problemFetch);
problemRouter.get("/problemById/:id", UserMiddleware, problemFetch);
// Fetching all Problems
problemRouter.get("/", UserMiddleware, problemFetchAll);
problemRouter.get("/getAllProblem", UserMiddleware, problemFetchAll);
// Problem Solved By User
problemRouter.get("/user", UserMiddleware, solvedProblembyUser);
problemRouter.get("/problemSolvedByUser", UserMiddleware, solvedProblembyUser);
// Getting all solutions for a problem submitted by User
problemRouter.get("/solutions/:id", UserMiddleware, submissionbyUser);
problemRouter.get("/submittedProblem/:id", UserMiddleware, submissionbyUser);

module.exports = problemRouter;