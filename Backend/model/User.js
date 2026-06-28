const mongoose = require('mongoose');
const { Schema } = mongoose;

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
        type: [String],
    },
    password: {
        type: String,
        required: true
    }

}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;