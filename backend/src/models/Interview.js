const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    round: { type: String, default: "Round 1" },
    dateTime: { type: Date, required: true },
    location: { type: String, default: "" },
    mode: { type: String, enum: ["ONLINE", "OFFLINE"], default: "OFFLINE" },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
