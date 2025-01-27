const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const transporter = require("../utils/emailTransporter");

// Register Admin
const adminRegister = async (req, res) => {
    try {
        const { name, email, password, schoolName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({ name, email, password: hashedPassword, schoolName });
        const result = await admin.save();
        res.status(201).json({ message: "Admin registered successfully", admin: result });
    } catch (err) {
        res.status(500).json({ message: "Error registering admin", error: err.message });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// Get Admin Details
const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin", error: err.message });
    }
};

// Update Admin
const updateAdmin = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin updated successfully", admin });
    } catch (err) {
        res.status(500).json({ message: "Error updating admin", error: err.message });
    }
};

// Delete Admin
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting admin", error: err.message });
    }
};

// Forget Password

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body; // Adjusted to match the field `email`
        const admin = await Admin.findOne({ email }); // Use the `Admin` model as per the upper code

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:5000/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click the link below to reset your password:\n${resetLink}`,
        });

        res.status(200).json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Reset Password

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const { email } = jwt.verify(token, process.env.JWT_SECRET); // Use the same `email` field as above
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({ success: true, message: "Password reset successful." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = { adminRegister, adminLogin, getAdminDetail, updateAdmin, deleteAdmin, forgetPassword, resetPassword };
