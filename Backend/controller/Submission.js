
const ProblemStatement = require("../model/PS");
const Submission = require("../model/submission");
const getLanguageById = require('../utils/LanguageUtils');
const { SubmitBatch, SubmitToken } = require('../utils/SubmitBatch');

const submitCode = async (req, res) => {

    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Missing required fields");
        }

        // NOTE: 'language' is kept as-is ('cpp', not 'c++') because both the Judge0
        // language map (LanguageUtils.js) and the Mongoose schema enum (model/submission.js)
        // expect 'cpp'. Reassigning it to 'c++' here used to crash (const reassignment)
        // and would have failed schema validation anyway.

        const Problem = await ProblemStatement.findById(problemId);
        if (!Problem) {
            return res.status(404).send("Problem Statement not found");
        }

        // FIX: testCasesTotal ko InvisibleTestCases se le rahe hain kyunki submission invisible cases pe hi judge hota hai
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: Problem.InvisibleTestCases.length
        })

        // Submitting Code to Judge0

        const languageId = getLanguageById(language);

        // Creating Submission Array for Batch Submission for Judge Zero
        // FIX: field name matches the schema exactly -> "InvisibleTestCases" (capital T), not "InvisibletestCases"
        const submissions = Problem.InvisibleTestCases.map((testcases) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
        }));

        // Sending Batch Submission to Judge Zero
        const SubmitResult = await SubmitBatch(submissions);

        const resultToken = SubmitResult.map((result) => result.token);
        // Creating Array of Tokens for Judge Zero to get the result of each submission
        const result = await SubmitToken(resultToken);

        // Updating Submit Result
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = "";

        for (const test of result) {
            if (test.status.id === 3) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, parseFloat(test.memory));
            }
            else {
                // FIX: schema ka enum sirf 'pending' | 'accepted' | 'wrong' | 'error' allow karta hai,

                if (test.status.id === 4) {
                    status = 'wrong';
                    errorMessage = test.status.description; // "Wrong Answer"
                }
                else if (test.status.id === 5) {
                    status = 'error';
                    errorMessage = test.status.description; // "Time Limit Exceeded"
                }
                else {
                    status = 'error';
                    errorMessage = test.status.description;
                }
                // break add kiya taaki ek fail milte hi loop rukk jaye, aage ke pass hue test count na badhe
                break;
            }
        }

        // Storing the result in the database
        // FIX: variable ka naam "SubmittedResult" tha jo kahin defined hi nahi tha, sahi naam "submittedResult" use kiya (jo upar Submission.create se aaya hai)
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save();

        // Checking if the Solution is Present in DB if not then we will save it related to the problem statement
        if (status === 'accepted' && !req.user.problemsolved.includes(problemId)) {
            req.user.problemsolved.push(problemId);
            await req.user.save();
        }
        res.status(201).json({
            accepted: status === 'accepted',
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            referenceSolutions: status === 'accepted' ? Problem.ReferenceSolution : []
        });

    }
    catch (err) {
        res.status(500).send("Error in submitting code: " + err.message);
    }
}

const runCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Missing required fields");
        }

        const Problem = await ProblemStatement.findById(problemId);
        if (!Problem) {
            return res.status(404).send("Problem Statement not found");
        }

        // Submitting Code to Judge0

        const languageId = getLanguageById(language);

        // Creating Submission Array for Batch Submission for Judge Zero
        // FIX: field name matches the schema exactly -> "VisibleTestCases" (capital T), not "VisibletestCases"
        const submissions = Problem.VisibleTestCases.map((testcases) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
        }));

        // Sending Batch Submission to Judge Zero
        const SubmitResult = await SubmitBatch(submissions);

        const resultToken = SubmitResult.map((result) => result.token);
        // Creating Array of Tokens for Judge Zero to get the result of each submission
        const result = await SubmitToken(resultToken);


        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for (const test of result) {
            if (test.status.id === 3) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, parseFloat(test.memory));
            } else {
                status = false;
                errorMessage = test.stderr || test.status.description;
                break;
            }
        }

        res.status(201).json({
            success: status,
            testCases: result,
            runtime,
            memory,
            error: errorMessage
        });

    }
    catch (err) {
        res.status(500).send("Error in submitting code: " + err.message);
    }
}

module.exports = { submitCode, runCode };