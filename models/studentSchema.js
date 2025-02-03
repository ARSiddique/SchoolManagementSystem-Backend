const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  enrollmentDate: {
    type: Date,
  },
  institutes: {
    type: String,
  },
  studentName: {
    type: String,
  },
  courseName: {
    type: String,
  },
  batchNo: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  studentImage: {
    type: String,
    required: false,
  },

  address: {
    type: String,
  },
  CNIC: {
    type: String,
  },
  totalFee: {
    type: Number,
  },
  feeRecieved: {
    type: Number,
  },
  pendingFee: {
    type: Number,
  },
  recoveryDate: {
    type: Date,
  },
  paymentMethod: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  csrName: {
    type: String,
  },
  admissionOfficer: {
    type: String,
  },
  branch: {
    type: String,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sclass",
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Student"
  }
});

module.exports = mongoose.model("student", studentSchema);
