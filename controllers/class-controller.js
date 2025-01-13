const Sclass = require("../models/sclassSchema.js");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");
const Teacher = require("../models/teacherSchema.js");

const sclassCreate = async (req, res) => {
    try {
        const { sclassName, adminID } = req.body;

        // Check for existing class with the same name
        const existingSclass = await Sclass.findOne({ sclassName, school: adminID });
        if (existingSclass) {
            return res.status(400).json({ message: "Class name already exists" });
        }

        // Create and save the new class
        const sclass = new Sclass({ sclassName, school: adminID });
        const result = await sclass.save();

        return res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const sclassList = async (req, res) => {
    try {
        const sclasses = await Sclass.find({ school: req.params.id });
        if (sclasses.length === 0) {
            return res.status(404).json({ message: "No classes found" });
        }
        res.status(200).json(sclasses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSclassDetail = async (req, res) => {
    try {
        const sclass = await Sclass.findById(req.params.id).populate("school", "schoolName");
        if (!sclass) {
            return res.status(404).json({ message: "Class not found" });
        }
        res.status(200).json(sclass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSclassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        // Remove the password field from the student records
        const modifiedStudents = students.map(({ _doc }) => ({
            ..._doc,
            password: undefined,
        }));
        res.status(200).json(modifiedStudents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteSclass = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the class and associated records
        const deletedClass = await Sclass.findByIdAndDelete(id);
        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        await Promise.all([
            Student.deleteMany({ sclassName: id }),
            Subject.deleteMany({ sclassName: id }),
            Teacher.deleteMany({ teachSclass: id }),
        ]);

        res.status(200).json({ message: "Class and related records deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSclasses = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete all classes and related records under a specific school
        const deletedClasses = await Sclass.deleteMany({ school: id });
        if (deletedClasses.deletedCount === 0) {
            return res.status(404).json({ message: "No classes found to delete" });
        }

        await Promise.all([
            Student.deleteMany({ school: id }),
            Subject.deleteMany({ school: id }),
            Teacher.deleteMany({ school: id }),
        ]);

        res.status(200).json({ message: "Classes and related records deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents
};
