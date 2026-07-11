const express = require ('express');
const submitRouter = express.Router();
const { authenticateUser } = require('../middleware/UserMiddleware');
const { submitCode } = require('../controller/Submission');

submitRouter.post('/submit/:id', authenticateUser, submitCode );

module.exports = submitRouter;