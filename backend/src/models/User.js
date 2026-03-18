import mongoose from "mongoose";

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Client", "Freelancer", "Admin"], required: true },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
});

const User = mongoose.model("User", userSchema);

export default User;
