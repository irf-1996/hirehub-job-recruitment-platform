import { Router } from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/:jobId", auth, requireRole("candidate"), async (req, res) => {
  try {
    if (!(await Job.exists({ _id: req.params.jobId }))) return res.status(404).json({ message: "Job not found" });
    const app = await Application.create({
      job: req.params.jobId, candidate: req.user.id,
      coverLetter: req.body.coverLetter, resumeUrl: req.body.resumeUrl,
    });
    res.status(201).json(app);
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 400).json({ message: e.code === 11000 ? "You already applied to this job" : e.message });
  }
});

router.get("/mine", auth, requireRole("candidate"), async (req, res) => {
  res.json(await Application.find({ candidate: req.user.id }).populate("job", "title company location").sort({ createdAt: -1 }));
});

router.get("/job/:jobId", auth, requireRole("employer"), async (req, res) => {
  if (!(await Job.exists({ _id: req.params.jobId, employer: req.user.id })))
    return res.status(404).json({ message: "Job not found" });
  res.json(await Application.find({ job: req.params.jobId }).populate("candidate", "name email").sort({ createdAt: -1 }));
});

router.patch("/:id/status", auth, requireRole("employer"), async (req, res) => {
  const app = await Application.findById(req.params.id).populate("job");
  if (!app || String(app.job.employer) !== req.user.id) return res.status(404).json({ message: "Not found" });
  if (!["applied", "shortlisted", "rejected"].includes(req.body.status)) return res.status(400).json({ message: "Bad status" });
  app.status = req.body.status;
  await app.save();
  res.json(app);
});

export default router;
