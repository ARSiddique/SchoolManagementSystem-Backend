const Notice = require('../models/noticeSchema.js');

// Create a new notice
const noticeCreate = async (req, res) => {
    try {
        const notice = new Notice({
            ...req.body,
            school: req.body.adminID // Ensure adminID exists in the request body
        });
        const result = await notice.save();
        res.status(201).json(result); // Use 201 status code for resource creation
    } catch (err) {
        res.status(500).json({ error: 'Failed to create notice', details: err.message });
    }
};

// Retrieve all notices for a school
const noticeList = async (req, res) => {
    try {
        const notices = await Notice.find({ school: req.params.id }).sort({ createdAt: -1 }); // Sort by creation date
        if (notices.length > 0) {
            res.status(200).json(notices);
        } else {
            res.status(404).json({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notices', details: err.message });
    }
};

// Update a specific notice
const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Ensure data validation is respected
        );
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "Notice not found" });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notice', details: error.message });
    }
};

// Delete a specific notice
const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ message: 'Notice deleted successfully' });
        } else {
            res.status(404).json({ message: 'Notice not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notice', details: error.message });
    }
};

// Delete all notices for a school
const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "No notices found to delete" });
        } else {
            res.status(200).json({ message: `${result.deletedCount} notice(s) deleted` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notices', details: error.message });
    }
};

module.exports = { noticeCreate, noticeList, updateNotice, deleteNotice, deleteNotices };
