const user = require('../model/User');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register Admin

const registerAdmin = async (req, res) => {
    try {
        ValidateUser(req.body);

        const { firstname, email, password } = req.body;


        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.role = 'admin'; // Assigning the role as 'admin' for all new registrations

        const newUser = await user.create({ ...req.body, password: hashedPassword });

        const token = jwt.sign({ _id: newUser._id, email: newUser.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });

        res.status(201).send('User Registered Successfully');
    }
    catch (err) {
        res.status(400).send('Error registering Admin: ' + err.message); // FIXED: was concatenating raw err object -> showed "[object Object]"/stack leak to client. Use err.message.
    }
}



module.exports = { registerAdmin };