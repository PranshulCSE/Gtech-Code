const express = require ('express');
const submitRouter = express.Router();
const { authenticateUser } = require('../middleware/UserMiddleware');
const { submitCode, runCode } = require('../controller/Submission');

submitRouter.post('/submit/:id', authenticateUser, submitCode );
submitRouter.post('/run/:id', authenticateUser, runCode );

module.exports = submitRouter;