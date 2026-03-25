const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    attachment: {
      fileName: { type: String, trim: true },
      originalName: { type: String, trim: true },
      mimetype: { type: String, trim: true },
      size: { type: Number },
      url: { type: String, trim: true }
    },
    createdByTpo: { type: mongoose.Schema.Types.ObjectId, ref: "Tpo", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
