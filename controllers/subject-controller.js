const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const { subjects, adminID, sclassName } = req.body;

        if (!subjects || !adminID || !sclassName) {
            return res.status(400).send({ message: "Invalid input data" });
        }

        const isDuplicate = await Subject.findOne({
            subCode: subjects[0]?.subCode,
            school: adminID,
        });

        if (isDuplicate) {
            return res.status(400).send({ message: "Subject code must be unique" });
        }

        const newSubjects = subjects.map((subject) => ({
            ...subject,
            sclassName,
            school: adminID,
        }));

        const result = await Subject.insertMany(newSubjects);
        res.status(201).send({ message: "Subjects created", data: result });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const allSubjects = async (req, res) => {
    try {
        const { id } = req.params;
        const subjects = await Subject.find({ school: id }).populate("sclassName", "sclassName");

        if (!subjects.length) {
            return res.status(404).send({ message: "No subjects found" });
        }

        res.status(200).send(subjects);
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const classSubjects = async (req, res) => {
    try {
        const { id } = req.params;
        const subjects = await Subject.find({ sclassName: id });

        if (!subjects.length) {
            return res.status(404).send({ message: "No subjects found" });
        }

        res.status(200).send(subjects);
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const freeSubjectList = async (req, res) => {
    try {
        const { id } = req.params;
        const subjects = await Subject.find({ sclassName: id, teacher: { $exists: false } });

        if (!subjects.length) {
            return res.status(404).send({ message: "No subjects found" });
        }

        res.status(200).send(subjects);
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        const { id } = req.params;
        let subject = await Subject.findById(id)
            .populate("sclassName", "sclassName")
            .populate("teacher", "name");

        if (!subject) {
            return res.status(404).send({ message: "Subject not found" });
        }

        res.status(200).send(subject);
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSubject = await Subject.findByIdAndDelete(id);

        if (!deletedSubject) {
            return res.status(404).send({ message: "Subject not found" });
        }

        await Teacher.updateOne(
            { teachSubject: id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            {
                $pull: {
                    examResult: { subName: id },
                    attendance: { subName: id },
                },
            }
        );

        res.status(200).send({ message: "Subject deleted", data: deletedSubject });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const { id } = req.params;

        const subjectsToDelete = await Subject.find({ school: id });
        const subjectIds = subjectsToDelete.map((subject) => subject._id);

        if (!subjectsToDelete.length) {
            return res.status(404).send({ message: "No subjects found" });
        }

        await Subject.deleteMany({ school: id });
        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            {
                $pull: {
                    examResult: { subName: { $in: subjectIds } },
                    attendance: { subName: { $in: subjectIds } },
                },
            }
        );

        res.status(200).send({ message: "Subjects deleted" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const { id } = req.params;

        const subjectsToDelete = await Subject.find({ sclassName: id });
        const subjectIds = subjectsToDelete.map((subject) => subject._id);

        if (!subjectsToDelete.length) {
            return res.status(404).send({ message: "No subjects found" });
        }

        await Subject.deleteMany({ sclassName: id });
        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            {
                $pull: {
                    examResult: { subName: { $in: subjectIds } },
                    attendance: { subName: { $in: subjectIds } },
                },
            }
        );

        res.status(200).send({ message: "Subjects deleted by class" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects,
};
