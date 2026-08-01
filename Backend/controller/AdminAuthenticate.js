const user = require('../model/User');
const ValidateUser = require('../utils/Validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const registerAdmin = async (req, res) => {
    try {
        if (req.user?.email !== process.env.SUPERADMIN_EMAIL) {
            return res.status(403).send('Only the super admin can create new admins');
        }
        ValidateUser(req.body);

        const { firstname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            ...req.body,
            firstname,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        const token = jwt.sign(
            { _id: newUser._id, email: newUser.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        const safeAdmin = newUser.toObject();
        delete safeAdmin.password;

        res.status(201).json({
            message: 'Admin created successfully',
            user: safeAdmin
        });
    } catch (err) {
        res.status(400).send('Error registering Admin: ' + err.message);
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await user.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json(admins);
    } catch (err) {
        res.status(400).send('Error fetching admins: ' + err.message);
    }
};

const deleteAdmin = async (req, res) => {
    try {
        if (req.user?.email !== process.env.SUPERADMIN_EMAIL) {
            return res.status(403).send('Only the super admin can remove admins');
        }
        const adminId = req.params.id;

        if (req.user?._id?.toString() === adminId) {
            return res.status(400).send('You cannot delete your own admin account');
        }

        const deletedAdmin = await user.findOneAndDelete({ _id: adminId, role: 'admin' });

        if (!deletedAdmin) {
            return res.status(404).send('Admin not found');
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (err) {
        res.status(400).send('Error deleting admin: ' + err.message);
    }
};

module.exports = { registerAdmin, getAllAdmins, deleteAdmin };