const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    FirstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    LastName: {
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
        type: number,
        min: 8,
        max: 80
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problemSolved: {
        type: [String],
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 20
    }

}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;