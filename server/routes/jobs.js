import { Router } from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res) => {
  const { q, location, type, company } = req.query;
  const filter = {};
  if (q) filter.$or = [{ title: new RegExp(esc(q), "i") }, { company: new RegExp(esc(q), "i") }];
  if (location) filter.location = new RegExp(esc(location), "i");
  if (type) filter.type = type;
  if (company) filter.company = new RegExp(`^${esc(company)}$`, "i");
  res.json(await Job.find(filter).sort({ createdAt: -1 }).limit(100));
});

router.get("/mine/list", auth, requireRole("employer"), async (req, res) => {
  res.json(await Job.find({ employer: req.user.id }).sort({ createdAt: -1 }));
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    job ? res.json(job) : res.status(404).json({ message: "Job not found" });
  } catch { res.status(400).json({ message: "Invalid job id" }); }
});

router.post("/", auth, requireRole("employer"), async (req, res) => {
  try {
    const { title, company, location, type, salary, description } = req.body;
    const job = await Job.create({ title, company, location, type, salary, description, employer: req.user.id });
    res.status(201).json(job);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete("/:id", auth, requireRole("employer"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employer: req.user.id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();
  res.json({ ok: true });
});

export default router;