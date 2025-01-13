const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now, // Default to the current date
        required: true,
    },
    complaint: {
        type: String,
        required: true,
        trim: true, // Trim extra spaces
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
});

module.exports = mongoose.model("Complain", complainSchema);
