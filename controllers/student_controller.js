const bcrypt = require("bcrypt");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");
const xlsx = require("xlsx");
const excelDateToJSDate = require("../utils/dateFunc.js");

// Parse dates from Excel or string
const parseDate = (date) => {
  if (typeof date === "string") {
    const trimmedDate = date.trim();
    if (!trimmedDate) return null;
    const parsedDate = new Date(trimmedDate);
    if (!isNaN(parsedDate)) return parsedDate;
  }
  if (typeof date === "number") return excelDateToJSDate(date);
  return null; // Invalid or empty
};
// Common function to check and prepare student data
const prepareStudentData = async (data, adminID, studentPassword) => {
  const {
    email,
    studentName,
    sclassName,
    courseName,
    enrollmentDate,
    recoveryDate,
    ...otherFields
  } = data;

  if (!email || !studentName || !sclassName || !courseName) {
    throw new Error(`Missing required fields for student: ${email || "Unknown"}`);
  }

  const hashedPassword = studentPassword
    ? await bcrypt.hash(studentPassword, 10)
    : undefined;

  return {
    email,
    studentName,
    sclassName,
    courseName,
    enrollmentDate: parseDate(enrollmentDate),
    recoveryDate: parseDate(recoveryDate),
    password: hashedPassword,
    school: adminID,
    ...otherFields,
  };
};

const uploadStudents = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const studentsData = xlsx.utils.sheet_to_json(sheet);
    const adminID = req.body.adminID;
    const results = [];

    for (const studentData of studentsData) {
      const email = studentData.email || "Unknown";
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({
          email: email.toLowerCase(),
          school: adminID,
        });

        if (existingStudent) {
          results.push({ email, status: "Exists" });
          continue;
        }

        // Prepare student data
        const newStudentData = await prepareStudentData(
          { ...studentData, studentImage: studentData.studentImage || null },
          adminID,
          "default123" // Default password for new uploads
        );

        // Save student
        const student = new Student(newStudentData);
        await student.save();
        results.push({ email, status: "Registered" });
      } catch (error) {
        results.push({ email, status: `Error: ${error.message}` });
      }
    }

    res.status(200).json({ message: "Students Uploaded", results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process the file", details: err.message });
  }
};


// Student Registration Function
const studentRegister = async (req, res) => {
  try {
    const existingStudent = await Student.findOne({
      email: req.body.email,
      school: req.body.adminID,
      sclassName: req.body.sclassName,
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Handle the student image URL if it exists
    let studentImage = null;
    if (req.file) {
      studentImage = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newStudent = new Student({
      ...req.body,
      password: hashedPassword,
      studentImage,
      school: req.body.adminID,
    });

    const result = await newStudent.save();

    result.password = undefined; // Don't include password in the response
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const studentLogIn = async (req, res) => {
  try {
    let student = await Student.findOne({
      email: req.body.email,
      // studentName: req.body.studentName,
    });
    console.log("student", student);
    if (student) {
      console.log("testing");
      const validated = bcrypt.compare(req.body.password, student.password);
      console.log("validated", validated);
      if (validated) {
        student = await student.populate("school", "schoolName");
        student = await student.populate("sclassName", "sclassName");
        student.password = undefined;
        // student.examResult = undefined;
        // student.attendance = undefined;
        res.send(student);
        console.log(
          `student = await student.populate("school", "schoolName");
        student = await student.populate("sclassName", "sclassName");`,
          student
        );
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudents = async (req, res) => {
  try {
    let students = await Student.find({ school: req.params.id }).populate(
      "sclassName",
      "sclassName"
    );
    if (students.length > 0) {
      let modifiedStudents = students.map((student) => {
        return { ...student._doc, password: undefined };
      });
      res.send(modifiedStudents);
    } else {
      res.send({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudentDetail = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id)
      .populate("school", "schoolName")
      .populate("sclassName", "sclassName")
      .populate("examResult.subName", "subName")
      .populate("attendance.subName", "subName sessions");
    if (student) {
      student.password = undefined;
      res.send(student);
    } else {
      res.send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ school: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const updateStudent = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      res.body.password = await bcrypt.hash(res.body.password, salt);
    }
    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateExamResult = async (req, res) => {
  const { subName, marksObtained } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const existingResult = student.examResult.find(
      (result) => result.subName.toString() === subName
    );

    if (existingResult) {
      existingResult.marksObtained = marksObtained;
    } else {
      student.examResult.push({ subName, marksObtained });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const subject = await Subject.findById(subName);

    const existingAttendance = student.attendance.find(
      (a) =>
        a.date.toDateString() === new Date(date).toDateString() &&
        a.subName.toString() === subName
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      // Check if the student has already attended the maximum number of sessions
      const attendedSessions = student.attendance.filter(
        (a) => a.subName.toString() === subName
      ).length;

      if (attendedSessions >= subject.sessions) {
        return res.send({ message: "Maximum attendance limit reached" });
      }

      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
  const subName = req.params.id;

  try {
    const result = await Student.updateMany(
      { "attendance.subName": subName },
      { $pull: { attendance: { subName } } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendance = async (req, res) => {
  const schoolId = req.params.id;

  try {
    const result = await Student.updateMany(
      { school: schoolId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendanceBySubject = async (req, res) => {
  const studentId = req.params.id;
  const subName = req.body.subId;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $pull: { attendance: { subName: subName } } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendance = async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  uploadStudents,
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,

  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};