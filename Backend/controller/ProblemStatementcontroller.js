const { getLanguageById } = require('../Utils/LanguageUtils');
const {SubmitBatch}= require('../Utils/SubmitBatch');

const problemCreate= async (req,res)=>{
    const { title, description, difficulty, tags, VisibletestCases, InvisibletestCases, BoilerplateCode, createdBy, ReferenceSolution ,isApproved,isRejected}=req.body;
    try {
        for(const {language,code} of ReferenceSolution){
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

            const languageId= getLanguageById(language);

            // Creating Submission Array for Batch Submission for Judge Zero
            const submissions = VisibletestCases.map((input,output) => ({
                source_code: code,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }));

            // Sending Batch Submission to Judge Zero
            const Result = SubmitBatch(Submission);
           

        }
    }
    catch(err){
        res.status(500).send("Error in creating problem"+err.message);
    }
}