const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain(req.body);
        const result = await complain.save();
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ success: false, message: "Error creating complain", error: err.message });
    }
};

const complainList = async (req, res) => {
    try {
        const { id } = req.params;
        const complains = await Complain.find({ school: id }).populate("user", "name");

        if (!complains || complains.length === 0) {
            return res.status(404).json({ success: false, message: "No complaints found for this school" });
        }
        res.status(200).json({ success: true, data: complains });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ success: false, message: "Error fetching complaints", error: err.message });
    }
};

module.exports = { complainCreate, complainList };
