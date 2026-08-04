const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require("../middlewares/Usermiddleware");
const solveDoubt = require('../controller/solveDoubt');

aiRouter.post('/chat', userMiddleware, solveDoubt);

module.exports = aiRouter;