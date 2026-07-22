const express = require ('express');
const submitRouter = express.Router();
const userMiddleware = require('../middlewares/Usermiddleware');
const { submitCode, runCode } = require('../controller/Submission');

submitRouter.post('/submit/:id', userMiddleware , submitCode );
submitRouter.post('/run/:id', userMiddleware , runCode );

module.exports = submitRouter;