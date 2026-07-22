const mongoose = require('mongoose');
const { Schema } = mongoose;
const Submission = require('./submission');

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    lastname: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    age: {
        type: Number,
        min: 8,
        max: 80
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problemsolved: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProblemStatement'
        }],
        default: []
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,

}, { timestamps: true });


// Here the above function is post function which is executed after the opeartion ends and it will delete all the submissions of the user when the user is deleted from the database.

UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Submission.deleteMany({ userId: doc._id });
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;