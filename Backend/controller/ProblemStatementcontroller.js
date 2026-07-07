const  getLanguageById  = require('../Utils/LanguageUtils');
const { SubmitBatch, SubmitToken } = require('../Utils/SubmitBatch');
const ProblemStatement = require('../model/PS');


const problemCreate = async (req, res) => {
    const { title, description, difficulty, tags, VisibletestCases, InvisibletestCases, BoilerplateCode, createdBy, ReferenceSolution, isApproved, isRejected } = req.body;
    try {
        for (const { language, code } of ReferenceSolution) {
            // Source Code
            // Language id
            // stdin: Input
            // stdout: Output
            // stderr: Error
            // time: Time taken
            // memory: Memory used
            if (!language || !code) {
                return res.status(400).send("Reference Solution is missing language or code");
            }

            const languageId = getLanguageById(language);

            // Creating Submission Array for Batch Submission for Judge Zero
            const submissions = VisibletestCases.map((testcases) => ({
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

            // Submitting Array of tokens to get Actual Result

            for (const test of result) {
                if (test.status.id !== 3) {
                    return res.status(400).send(`Reference Solution failed for test case with input: ${test.stdin}. Error: ${test.stderr}`);
                }
            }
        }
        // Storing the Problem Statement in Database as it has passes all the test cases
        await ProblemStatement.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).send("Problem Statement Created Successfully");
    }
    catch (err) {
        res.status(500).send("Error in creating problem" + err.message);
    }
}

module.exports = { problemCreate };