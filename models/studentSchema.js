const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  enrollmentDate: {
    type: Date
    // default: null
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
});

module.exports = mongoose.model("student", studentSchema);
