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
    required: true, // Ensure email is mandatory
  },
  studentImage: {
    type: String, // File path or URL of the image
    required: false, // Make this optional, as not all students may have images
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
    ref: "Admin", // Ensure "admin" is correctly defined elsewhere
  },
  sclassName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sclass", // Replace "class" with the correct model name for classes
  },
  password: {
    type: String,
    required: true, // Ensure password is mandatory
  },
});

module.exports = mongoose.model("student", studentSchema);
