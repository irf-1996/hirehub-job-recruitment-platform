import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const sign = (u) =>
  jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
const safe = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, company: u.company });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ message: "Name, email and a 6+ character password are required" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({
      name, email, company: company || "",
      role: role === "employer" ? "employer" : "candidate",
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
