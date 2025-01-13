const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;

    if (!name || !email || !password || !school || !teachSclass) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    try {
        const existingTeacherByEmail = await Teacher.findOne({ email });
        if (existingTeacherByEmail) {
            return res.status(400).send({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });
        const result = await teacher.save();

        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
        }

        result.password = undefined; // Hide hashed password
        return res.status(201).send(result);
    } catch (err) {
        return res.status(500).send({ message: "Server error", error: err });
    }
};

const teacherLogIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required" });
    }

    try {
        const teacher = await Teacher.findOne({ email }).populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName");

        if (!teacher) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        const validated = await bcrypt.compare(password, teacher.password);
        if (!validated) {
            return res.status(400).send({ message: "Invalid password" });
        }

        teacher.password = undefined; // Hide hashed password
        res.status(200).send(teacher);
    } catch (err) {
        console.error("Error during teacher login:", err); // Log error details in the console
        res.status(500).send({
            message: "Server error during login",
            error: err.message || "Unknown error occurred",
        });
    }
};


const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");

        if (!teachers.length) {
            return res.status(404).send({ message: "No teachers found" });
        }

        const modifiedTeachers = teachers.map((teacher) => {
            teacher.password = undefined;
            return teacher;
        });

        return res.status(200).send(modifiedTeachers);
    } catch (err) {
        res.status(500).send({ message: "Server error", error: err });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        await Subject.updateOne({ teacher: teacher._id }, { $unset: { teacher: "" } });
        return res.status(200).send({ message: "Teacher deleted", teacher });
    } catch (err) {
        res.status(500).send({ message: "Server error", error: err });
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    if (!status || !date) {
        return res.status(400).send({ message: "Status and date are required" });
    }

    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        const formattedDate = new Date(date).toDateString();
        const existingAttendance = teacher.attendance.find(a => new Date(a.date).toDateString() === formattedDate);

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.status(200).send(result);
    } catch (err) {
        res.status(500).send({ message: "Server error", error: err });
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    deleteTeacher,
    teacherAttendance
};
