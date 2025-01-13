const bcrypt = require('bcrypt')
const Admin = require('../models/adminSchema.js')

// Admin Registration
const adminRegister = async (req, res) => {
    try {
        const { name, email, password, schoolName } = req.body

        const existingAdminByEmail = await Admin.findOne({ email })
        const existingSchool = await Admin.findOne({ schoolName })

        if (existingAdminByEmail) {
            return res.status(400).send({ message: 'Email already exists' })
        }

        if (existingSchool) {
            return res.status(400).send({ message: 'School name already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            schoolName,
        })

        const result = await admin.save()
        result.password = undefined  // Hide password in response

        res.status(201).send(result)
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err })
    }
}

// Admin Login
const adminLogIn = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required" })
    }

    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(404).send({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(400).send({ message: "Invalid password" })
        }

        admin.password = undefined  // Hide password in response
        res.status(200).send(admin)
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err })
    }
}

// Get Admin Details
const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)
        if (!admin) {
            return res.status(404).send({ message: "No admin found" })
        }

        admin.password = undefined  // Hide password in response
        res.status(200).send(admin)
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err })
    }
}

module.exports = { adminRegister, adminLogIn, getAdminDetail }
