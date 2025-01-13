const express = require('express');
const router = express.Router();
const upload = require("../middleware/fileUpload.js");
const { adminRegister, adminLogIn, getAdminDetail } = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require("../controllers/class-controller.js");
const { complainCreate, complainList } = require("../controllers/complain-controller.js");
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require("../controllers/notice-controller.js");
const { studentRegister, studentLogIn, getStudents, getStudentDetail, deleteStudents, deleteStudent, updateStudent, studentAttendance, deleteStudentsByClass, updateExamResult, clearAllStudentsAttendanceBySubject, clearAllStudentsAttendance, removeStudentAttendanceBySubject, removeStudentAttendance, uploadStudents } = require("../controllers/student_controller.js");
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require("../controllers/subject-controller.js");
const { teacherRegister, teacherLogIn, getTeachers, deleteTeacher, teacherAttendance } = require("../controllers/teacher-controller.js");

// Admin Registration
router.post('/AdminReg', adminRegister);
// Admin Login
router.post('/AdminLogin', adminLogIn);
// Get Admin Details by ID
router.get('/Admin/:id', getAdminDetail);

// Sclass
router.post("/sclass/create", sclassCreate);
router.get("/sclass/list/:id", sclassList);
router.get("/sclass/detail/:id", getSclassDetail);
router.get("/sclass/students/:id", getSclassStudents);
router.delete("/sclass/delete/:id", deleteSclass);
router.delete("/sclass/deleteAll/:id", deleteSclasses);

// Complain
// Route for creating a complaint
router.post("/complains", complainCreate);
// Route for fetching all complaints related to a specific school
router.get("/complains/:id", complainList);

// Notice
// Create a new notice
router.post("/notices", noticeCreate);
// List all notices for a specific school
router.get("/notices/:id", noticeList);
// Update a specific notice
router.put("/notices/:id", updateNotice);
// Delete a specific notice
router.delete("/notices/:id", deleteNotice);
// Delete all notices for a school
router.delete("/notices/school/:id", deleteNotices);


// Student
router.post("/upload", upload.single("file"), uploadStudents);
router.post("/StudentReg", studentRegister);
router.post("/StudentLogin", studentLogIn);
router.get("/Students/:id", getStudents);
router.get("/Student/:id", getStudentDetail);
router.delete("/Students/:id", deleteStudents);
router.delete("/StudentsClass/:id", deleteStudentsByClass);
router.delete("/Student/:id", deleteStudent);
router.put("/Student/:id", updateStudent);
router.put("/UpdateExamResult/:id", updateExamResult);
router.put("/StudentAttendance/:id", studentAttendance);
router.put("/RemoveAllStudentsSubAtten/:id",clearAllStudentsAttendanceBySubject);
router.put("/RemoveAllStudentsAtten/:id", clearAllStudentsAttendance);
router.put("/RemoveStudentSubAtten/:id", removeStudentAttendanceBySubject);
router.put("/RemoveStudentAtten/:id", removeStudentAttendance);



// Subject
router.post("/SubjectCreate", subjectCreate);
router.get("/AllSubjects/:id", allSubjects);
router.get("/ClassSubjects/:id", classSubjects);
router.get("/FreeSubjectList/:id", freeSubjectList);
router.get("/Subject/:id", getSubjectDetail);
router.delete("/Subject/:id", deleteSubject);
router.delete("/Subjects/:id", deleteSubjects);
router.delete("/SubjectsClass/:id", deleteSubjectsByClass);

// Teacher
router.post("/TeacherReg", teacherRegister);
router.post("/TeacherLogin", teacherLogIn);
router.get("/Teachers/:id", getTeachers);
router.delete("/Teacher/:id", deleteTeacher);
router.post("/TeacherAttendance/:id", teacherAttendance);


module.exports = router;