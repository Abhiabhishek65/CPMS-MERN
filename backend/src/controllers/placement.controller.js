const Placement = require("../models/Placement");
const Application = require("../models/Application");

function excelCsv(csvBody) {
  const bom = "\ufeff";
  const sep = "sep=,\r\n";
  const body = String(csvBody).replace(/\r?\n/g, "\r\n");
  return bom + sep + body;
}

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function excelText(v) {
  const s = String(v ?? "");
  if (!s) return "";
  return `="${s.replace(/"/g, '""')}"`;
}

function buildPlacementFilter(req) {
  const filter = {};
  if (req.query.placementYear) {
    filter["student.placementYear"] = String(req.query.placementYear);
  }
  return filter;
}

async function listPlacements(req, res) {
  const items = await Placement.find()
    .populate("student", "-password")
    .populate("job")
    .sort({ createdAt: -1 });

  const placementYear = String(req.query.placementYear || "").trim();
  const filtered = placementYear
    ? items.filter((x) => String(x.student?.placementYear || "") === placementYear)
    : items;

  res.json(filtered);
}

async function markSelectedToPlacement(req, res) {
  const { applicationId } = req.params;
  const { package: pkg, joiningDate, offerLetterLink } = req.body;

  const app = await Application.findById(applicationId).populate("job");
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (String(app.job.createdByTpo) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });

  app.status = "SELECTED";
  await app.save();

  const placement = await Placement.findOneAndUpdate(
    { student: app.student, job: app.job._id },
    {
      $set: {
        student: app.student,
        job: app.job._id,
        company: app.job.company,
        package: pkg || app.job.salary || "",
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        offerLetterLink: offerLetterLink || ""
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(placement);
}

async function deletePlacement(req, res) {
  const { placementId } = req.params;
  const placement = await Placement.findById(placementId).populate("job");
  if (!placement) return res.status(404).json({ message: "Placement not found" });
  if (String(placement.job?.createdByTpo) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });

  await Placement.findByIdAndDelete(placementId);
  await Application.updateMany(
    { job: placement.job?._id, student: placement.student, status: "SELECTED" },
    { $set: { status: "APPLIED" } }
  );

  res.json({ message: "Placement deleted" });
}

async function downloadPlacementsReport(req, res) {
  const items = await Placement.find()
    .populate("student", "-password")
    .populate("job")
    .sort({ createdAt: -1 });

  const placementYear = String(req.query.placementYear || "").trim();
  const filtered = placementYear
    ? items.filter((x) => String(x.student?.placementYear || "") === placementYear)
    : items;

  const headers = ["StudentName","Email","RollNo","Dept","Year","PlacementYear","Company","JobTitle","Package","JoiningDate","OfferLetterLink","CreatedAt"];
  const rows = filtered.map(p => ([
    p.student?.name, p.student?.email, excelText(p.student?.rollNo), p.student?.department, p.student?.year, p.student?.placementYear,
    p.company, p.job?.title, p.package,
    p.joiningDate ? new Date(p.joiningDate).toISOString() : "",
    p.offerLetterLink || "",
    p.createdAt ? new Date(p.createdAt).toISOString() : ""
  ]));

  const csv = [headers.join(","), ...rows.map(r => r.map(csvEscape).join(","))].join("\n");

  const suffix = placementYear || "all";
  res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="placements_report_${suffix}.csv"`);
  return res.status(200).send(excelCsv(csv));
}

module.exports = { listPlacements, markSelectedToPlacement, deletePlacement, downloadPlacementsReport };
