const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const transporter = require("../utils/emailTransporter");

const adminRegister = async (req, res) => {
    try {
        const admin = new Admin({
            ...req.body
        });

        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        }
        else {
            let result = await admin.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
const adminLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        admin.password = undefined;

        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};
const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select("-password");

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, data: admin });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching admin details", error: err.message });
    }
};
const updateAdmin = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, message: "Admin updated successfully", data: admin });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating admin", error: err.message });
    }
};
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting admin", error: err.message });
    }
};
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "12h" });
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click the link below to reset your password:\n${resetLink}`,
        });

        res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error sending password reset email", error: err.message });
    }
};
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password during reset:", hashedPassword);

        const updatedAdmin = await Admin.updateOne(
            { email },
            { password: hashedPassword }
        );

        if (updatedAdmin.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found or password update failed",
            });
        }

        res.status(200).json({
            success: true,
            message: "Password reset successful.",
        });
    } catch (error) {
        console.error(error);

        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                success: false,
                message: "Token expired",
            });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(400).json({
                success: false,
                message: "Invalid token",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error resetting password",
            error: error.message,
        });
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdmin, deleteAdmin, forgetPassword, resetPassword };
