const Complain = require('../models/complainSchema.js');

const mongoose = require('mongoose');

const complainCreate = async (req, res) => {
    try {
        // console.log("Received Complain Data:", req.body); 

        if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        req.body.user = new mongoose.Types.ObjectId(req.body.user); // Convert user to ObjectId
        const complain = new Complain(req.body);
        const result = await complain.save();

        // console.log("Saved Complain:", result);
        res.send(result);
    } catch (err) {
        console.error("Error creating complain:", err);
        res.status(500).json({ error: err.message });
    }
};


const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ school: req.params.id })
            .populate("user", "studentName")

        // console.log("Populated Complains:", complains);

        if (complains.length > 0) {
            res.send(complains);
        } else {
            res.status(404).json({ message: "No complaints found" });
        }
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = { complainCreate, complainList };
