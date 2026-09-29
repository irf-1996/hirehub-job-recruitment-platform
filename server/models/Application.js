import mongoose from "mongoose";
const appSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  status: { type: String, enum: ["applied", "shortlisted", "rejected"], default: "applied" },
}, { timestamps: true });
appSchema.index({ job: 1, candidate: 1 }, { unique: true });
export default mongoose.model("Application", appSchema);
