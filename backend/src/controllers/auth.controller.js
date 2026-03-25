const Student = require("../models/Student");
const Tpo = require("../models/Tpo");
const Job = require("../models/Job");
const Drive = require("../models/Drive");
const Notice = require("../models/Notice");
const { signToken } = require("../utils/jwt");
const { ensureUniqueIdentity, normalizeEmail, normalizePhone } = require("../utils/identity");

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resumeData;
  delete obj.profilePhotoData;
  return obj;
}

async function studentSignup(req, res) {
  const { name, email, password, rollNo, department, year, phone, placementYear } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

  await ensureUniqueIdentity({ email, phone });

  const student = await Student.create({
    name,
    email: normalizeEmail(email),
    password,
    rollNo: rollNo || "",
    department: department || "",
    year: year || "",
    phone: normalizePhone(phone),
    placementYear: placementYear || String(new Date().getFullYear())
  });

  const token = signToken({ id: student._id, role: "student" });
  res.status(201).json({ token, user: sanitizeUser(student) });
}

async function studentLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email, password required" });

  const student = await Student.findOne({ email: normalizeEmail(email) });
  if (!student) return res.status(401).json({ message: "Invalid credentials" });
  if (password !== student.password) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: student._id, role: "student" });
  res.json({ token, user: sanitizeUser(student) });
}

async function studentForgotPassword(req, res) {
  const { email, phone, newPassword } = req.body;
  if (!email || !phone || !newPassword) {
    return res.status(400).json({ message: "email, phone and newPassword required" });
  }

  const student = await Student.findOne({ email: normalizeEmail(email), phone: normalizePhone(phone) });
  if (!student) return res.status(404).json({ message: "Student account not found for this email and phone" });

  student.password = String(newPassword);
  await student.save();
  res.json({ message: "Password reset successful" });
}

async function tpoSignup(req, res) {
  const { name, email, password, collegeName, phone, previousPassword } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

  const allTpos = await Tpo.find().sort({ updatedAt: -1, createdAt: -1 });

  if (!allTpos.length) {
    await ensureUniqueIdentity({ email, phone });
    const tpo = await Tpo.create({
      name,
      email: normalizeEmail(email),
      password,
      collegeName: collegeName || "",
      phone: normalizePhone(phone)
    });

    const token = signToken({ id: tpo._id, role: "tpo" });
    return res.status(201).json({ token, user: sanitizeUser(tpo) });
  }

  const normalizedPreviousPassword = String(previousPassword || "").trim();
  if (!normalizedPreviousPassword) {
    return res.status(400).json({ message: "Existing TPO password required to create a new TPO account" });
  }

  const matchedTpo = allTpos.find((tpo) => String(tpo.password || "").trim() === normalizedPreviousPassword);
  if (!matchedTpo) {
    return res.status(401).json({ message: "Previous TPO password did not match" });
  }

  await ensureUniqueIdentity({ email, phone, excludeTpoId: matchedTpo._id });

  const otherTpoIds = allTpos
    .filter((tpo) => String(tpo._id) !== String(matchedTpo._id))
    .map((tpo) => tpo._id);

  if (otherTpoIds.length) {
    await Promise.all([
      Job.updateMany({ createdByTpo: { $in: otherTpoIds } }, { $set: { createdByTpo: matchedTpo._id } }),
      Drive.updateMany({ createdByTpo: { $in: otherTpoIds } }, { $set: { createdByTpo: matchedTpo._id } }),
      Notice.updateMany({ createdByTpo: { $in: otherTpoIds } }, { $set: { createdByTpo: matchedTpo._id } }),
    ]);
    await Tpo.deleteMany({ _id: { $in: otherTpoIds } });
  }

  matchedTpo.name = name;
  matchedTpo.email = normalizeEmail(email);
  matchedTpo.password = String(password || "").trim();
  matchedTpo.collegeName = collegeName || "";
  matchedTpo.phone = normalizePhone(phone);
  await matchedTpo.save();

  const token = signToken({ id: matchedTpo._id, role: "tpo" });
  res.status(201).json({ token, user: sanitizeUser(matchedTpo) });
}

async function tpoLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email, password required" });

  const tpo = await Tpo.findOne({ email: normalizeEmail(email) });
  if (!tpo) return res.status(401).json({ message: "Invalid credentials" });
  if (password !== tpo.password) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: tpo._id, role: "tpo" });
  res.json({ token, user: sanitizeUser(tpo) });
}

module.exports = { studentSignup, studentLogin, studentForgotPassword, tpoSignup, tpoLogin };
