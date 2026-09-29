import { Router } from "express";
import Job from "../models/Job.js";

const router = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// List companies that have jobs, with number of openings
router.get("/", async (req, res) => {
  const match = req.query.q ? { company: new RegExp(esc(req.query.q), "i") } : {};
  const companies = await Job.aggregate([
    { $match: match },
    { $group: {
        _id: { $toLower: "$company" },
        name: { $first: "$company" },
        openings: { $sum: 1 },
        locations: { $addToSet: "$location" },
    } },
    { $sort: { openings: -1, name: 1 } },
    { $limit: 100 },
    { $project: { _id: 0, name: 1, openings: 1, locations: { $slice: ["$locations", 3] } } },
  ]);
  res.json(companies);
});

export default router;