const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    company: { type: String, required: true },
    package: { type: String, default: "" },
    joiningDate: { type: Date, default: null },
    offerLetterLink: { type: String, default: "" }
  },
  { timestamps: true }
);

placementSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Placement", placementSchema);
