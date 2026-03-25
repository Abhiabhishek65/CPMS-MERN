const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    rollNo: { type: String, default: "" },
    department: { type: String, default: "" },
    year: { type: String, default: "" },
    placementYear: { type: String, default: String(new Date().getFullYear()) },
    phone: { type: String, default: "" },
    skills: { type: [String], default: [] },
    resumeLink: { type: String, default: "" },

    gradingSystem: { type: String, enum: ["", "cgpa", "percentage"], default: "" },
    cgpa: { type: Number, default: null },
    percentage: { type: Number, default: null },
    class10Percentage: { type: Number, default: null },
    class12Percentage: { type: Number, default: null },
    semesterPercentages: { type: [Number], default: [] },

    resumeFile: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    resumeMimeType: { type: String, default: "" },
    resumeData: { type: Buffer, default: null, select: false },

    profilePhotoFile: { type: String, default: "" },
    profilePhotoFileName: { type: String, default: "" },
    profilePhotoMimeType: { type: String, default: "" },
    profilePhotoData: { type: Buffer, default: null, select: false },

    isApproved: { type: Boolean, default: false },
    approvalNote: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
