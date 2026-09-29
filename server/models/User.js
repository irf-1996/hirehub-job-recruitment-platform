import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["candidate", "employer"], default: "candidate" },
  company: { type: String, default: "" },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
