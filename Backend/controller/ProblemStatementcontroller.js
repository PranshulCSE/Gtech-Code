const getLanguageById = require('../utils/LanguageUtils');
const { SubmitBatch, SubmitToken } = require('../utils/SubmitBatch');
const ProblemStatement = require('../model/PS');
const User = require('../model/User');
const Submission = require('../model/submission');
const solutionVideo = require('../model/solutionVideo');

const validateReferenceSolutions = async (referenceSolutions, visibleTestCases) => {
    const validations = referenceSolutions.map(async ({ language, code }) => {
        if (!language || !code) {
            throw new Error('Reference Solution is missing language or code');
        }

        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcases) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
        }));

        const submitResult = await SubmitBatch(submissions);
        const resultToken = submitResult.map((result) => result.token);
        const result = await SubmitToken(resultToken, { maxAttempts: 60, delayMs: 2000 });

        for (const test of result) {
            if (test.status.id !== 3) {
                throw new Error(`Reference Solution failed for test case with input: ${test.stdin}. Error: ${test.stderr}`);
            }
        }
    });

    await Promise.all(validations);
};


const problemCreate = async (req, res) => {
    const { title, description, difficulty, tags, VisibleTestCases, InvisibleTestCases, BoilerplateCode, createdBy, ReferenceSolution, isApproved, isRejected } = req.body;
    try {
        if (!ReferenceSolution || !Array.isArray(ReferenceSolution)) {
            return res.status(400).send("Reference Solution is required and must be an array");
        }
        if (!VisibleTestCases || !Array.isArray(VisibleTestCases)) {
            return res.status(400).send("Visible test cases are required and must be an array");
        }

        await validateReferenceSolutions(ReferenceSolution, VisibleTestCases);
        // Storing the Problem Statement in Database as it has passes all the test cases
        await ProblemStatement.create({
            ...req.body,
            createdBy: req.user._id,
            isApproved: true,
            isRejected: false
        });
        res.status(201).send("Problem Statement Created Successfully");
    }
    catch (err) {
        res.status(500).send("Error in creating problem: " + err.message);
    }
}

const problemUpdate = async (req, res) => {
    const { id } = req.params;

    const { title, description, difficulty, tags, VisibleTestCases, InvisibleTestCases, BoilerplateCode, createdBy, ReferenceSolution, isApproved, isRejected } = req.body;
    try {
        if (!id) {
            return res.status(400).send("Problem Statement id is required");
        }
        const problem = await ProblemStatement.findById(id);
        if (!problem) {
            return res.status(404).send("Problem Statement not found");
        }

        if (ReferenceSolution !== undefined || VisibleTestCases !== undefined) {
            const finalSolutions = ReferenceSolution !== undefined ? ReferenceSolution : problem.ReferenceSolution;
            const finalTestCases = VisibleTestCases !== undefined ? VisibleTestCases : problem.VisibleTestCases;

            if (!Array.isArray(finalSolutions)) {
                return res.status(400).send("Reference Solution must be an array");
            }
            if (!Array.isArray(finalTestCases)) {
                return res.status(400).send("Visible test cases must be an array");
            }

            await validateReferenceSolutions(finalSolutions, finalTestCases);
        }

        // FIX: Only allow updating whitelisted fields to prevent mass assignment
        const updateData = {};
        const allowedFields = ['title', 'description', 'difficulty', 'tags', 'VisibleTestCases', 'InvisibleTestCases', 'BoilerplateCode', 'ReferenceSolution'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const updatedProblem = await ProblemStatement.findByIdAndUpdate(id, updateData, { runValidators: true, returnDocument: 'after' });

        res.status(200).json({ message: "Problem Statement updated successfully", updatedProblem });
    }
    catch (err) {
        res.status(500).send("Error in updating problem: " + err.message);
    }
}

const problemDelete = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("Problem Statement id is required");
        }
        const problem = await ProblemStatement.findById(id);
        if (!problem) {
            return res.status(404).send("Problem Statement not found");
        }
        await ProblemStatement.findByIdAndDelete(id);
        res.status(200).send("Problem Statement deleted successfully");
    }
    catch (err) {
        res.status(500).send("Error in deleting problem: " + err.message);
    }
}

const problemFetch = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("Problem Statement id is required");
        }
        const problem = await ProblemStatement.findById(id);
        if (!problem) {
            return res.status(404).send("Problem Statement not found");
        }

        const videos = await SolutionVideo.find({ problemId: id });

        const problemData = problem.toObject();
        const solvedProblems = req.user?.problemsolved || [];
        const isSolved = solvedProblems.some((solvedProblemId) => solvedProblemId.toString() === problem._id.toString());

        if (videos) {
            problemData.secureUrl = secureUrl;
            problemData.cloudinaryPublicId = cloudinaryPublicId;
            problemData.thumbnailUrl = thumbnailUrl;
            problemData.duration = duration;

            if (!isSolved) {
                delete problemData.ReferenceSolution;
            }

            return res.status(200).send(problemData);
        }
        delete problemData.createdBy;
        delete problemData.isApproved;
        delete problemData.isRejected;

        if (!isSolved) {
            delete problemData.ReferenceSolution;
        }

        res.status(200).send(problemData);
    }
    catch (err) {
        res.status(500).send("Error in fetching problem: " + err.message);
    }
}

const problemFetchAll = async (req, res) => {

    try {
        const problems = await ProblemStatement.find({ isApproved: true, isRejected: false }).select('_id title description difficulty tags ');
        res.status(200).send(problems);
    }
    catch (err) {
        res.status(500).send("Error in fetching all problems: " + err.message);
    }
}

const problemFetchAllForAdmin = async (req, res) => {
    try {
        const problems = await ProblemStatement.find().select('_id title description difficulty tags isApproved isRejected createdAt updatedAt');
        res.status(200).send(problems);
    }
    catch (err) {
        res.status(500).send("Error in fetching all problems: " + err.message);
    }
}

const solvedProblembyUser = async (req, res) => {

    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({
            path: 'problemsolved',
            select: '_id title description difficulty tags'
        });
        res.status(200).send(user.problemsolved);
    }
    catch (err) {
        res.status(500).send("Error in fetching solved problems by user: " + err.message);
    }
}

const submissionbyUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
        res.status(200).send(submissions); // no submissions yet = normal state, not an error
    }
    catch (err) {
        res.status(500).send("Error in fetching submissions by user: " + err.message);
    }
}

// NEW: Fetch problem for admin editing (includes ReferenceSolution and BoilerplateCode)
const problemFetchForAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("Problem Statement id is required");
        }
        const problem = await ProblemStatement.findById(id);
        if (!problem) {
            return res.status(404).send("Problem Statement not found");
        }
        // Return full problem for admin editing
        res.status(200).send(problem);
    }
    catch (err) {
        res.status(500).send("Error in fetching problem: " + err.message);
    }
}

module.exports = { problemCreate, problemUpdate, problemDelete, problemFetch, problemFetchAll, problemFetchAllForAdmin, solvedProblembyUser, submissionbyUser, problemFetchForAdmin };