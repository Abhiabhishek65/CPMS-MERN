const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");

async function createInterview(req, res) {
  const { applicationId } = req.params;
  const { round, dateTime, location, mode, note } = req.body;
  if (!dateTime) return res.status(400).json({ message: "dateTime required" });

  const app = await Application.findById(applicationId).populate("job");
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (String(app.job.createdByTpo) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });

  const interview = await Interview.findOneAndUpdate(
    { application: applicationId },
    {
      $set: {
        application: applicationId,
        round: round || "Round 1",
        dateTime: new Date(dateTime),
        location: location || "",
        mode: mode === "ONLINE" ? "ONLINE" : "OFFLINE",
        note: note || ""
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(interview);
}

async function listMyInterviews(req, res) {
  const apps = await Application.find({ student: req.user.id }).select("_id");
  const ids = apps.map(a => a._id);

  const items = await Interview.find({ application: { $in: ids } })
    .populate({ path: "application", populate: [{ path: "job" }] })
    .sort({ dateTime: 1 });

  res.json(items);
}

async function listJobInterviews(req, res) {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (String(job.createdByTpo) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });

  const apps = await Application.find({ job: jobId }).select("_id");
  const ids = apps.map(a => a._id);

  const items = await Interview.find({ application: { $in: ids } })
    .populate({ path: "application", populate: [{ path: "student", select: "-password" }, { path: "job" }] })
    .sort({ dateTime: 1 });

  res.json(items);
}

module.exports = { createInterview, listMyInterviews, listJobInterviews };
