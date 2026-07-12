
const ProblemStatement = require("../model/PS");
const Submission = require("../model/submission");
const getLanguageById = require('../Utils/LanguageUtils');
const { SubmitBatch, SubmitToken } = require('../Utils/SubmitBatch');

const submitCode = async (req, res) => {

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

        // FIX: testCasesTotal ko InvisibletestCases se le rahe hain kyunki submission invisible cases pe hi judge hota hai
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: Problem.InvisibletestCases.length
        })

        // Submitting Code to Judge0

        const languageId = getLanguageById(language);

        // Creating Submission Array for Batch Submission for Judge Zero
        // FIX: "Problem.InvisibletestCases" use kiya, "ProblemStatement.InvisibletestCases" galat tha (model pe field nahi hota)
        const submissions = Problem.InvisibletestCases.map((testcases) => ({
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

       if(! req.result.problemSolved.includes(problemId)) {
         req.result.problemSolved.push(problemId);
         await req.result.save();
       }

        res.status(201).send(submittedResult);

    }
    catch (err) {
        res.status(500).send("Error in submitting code" + err.message);
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
        // FIX: "Problem.InvisibletestCases" use kiya, "ProblemStatement.InvisibletestCases" galat tha (model pe field nahi hota)
        const submissions = Problem.VisibletestCases.map((testcases) => ({
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


        res.status(201).send(result);

    }
    catch (err) {
        res.status(500).send("Error in submitting code" + err.message);
    }
}

module.exports = { submitCode , runCode };