// Model for Problem Statement

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProblemStatementSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 1000
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },
    tags: {
        type: [String],
        default: [],
        enum: ["arrays", "strings", "maths", "dynamic programming", "greedy", "graphs", "trees", "hashing", "recursion", "backtracking", "sorting", "searching", "bit manipulation", "linked list", "stack", "queue", "heap", "trie", "dp on trees", "dp on graphs"]

    },
    VisibletestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explaination: {
                type: String,
                required: true
            }
        }
    ],
    InvisibletestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    BoilerplateCode: [
        {
        language:{
            type: String,
            required: true
        },
        startingCode: {
            type: String,
            required: true
        }
    }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ReferenceSolution: [
        {
            languge: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            }
        }
    ],
    isApproved: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const ProblemStatement = mongoose.model("ProblemStatement", ProblemStatementSchema);
module.exports = ProblemStatement;