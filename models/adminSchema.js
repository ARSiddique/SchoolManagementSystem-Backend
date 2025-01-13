const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: /.+@.+\..+/,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        default: "Admin",
    },
    schoolName: {
        type: String,
        unique: true,
        required: true,
        minlength: 2,
    },
});

module.exports = mongoose.model('Admin', adminSchema);
