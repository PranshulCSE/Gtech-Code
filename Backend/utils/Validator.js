// Using the validator library to validate the data
const Validator = require('validator');

const ValidateUser = (data) => {
    const mandatoryFields = ['firstname', 'email', 'password'];

    const IsAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if (!IsAllowed) {
        throw new Error('Missing mandatory fields');
    }
    if (!Validator.isEmail(data.email)) {
        throw new Error('Invalid email format');
    }
    if (!Validator.isStrongPassword(data.password)) {
        throw new Error('Password is not strong enough. It should contain at least 8 characters, including uppercase, lowercase, number, and symbol.');
    }

}

module.exports = ValidateUser;