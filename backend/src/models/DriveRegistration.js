const mongoose = require("mongoose");

const driveRegistrationSchema = new mongoose.Schema(
  {
    drive: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["REGISTERED", "PRESENT", "ABSENT"], default: "REGISTERED" },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

driveRegistrationSchema.index({ drive: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("DriveRegistration", driveRegistrationSchema);
