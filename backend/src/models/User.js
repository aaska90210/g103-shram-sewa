import mongoose from "mongoose";

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Client", "Freelancer"], required: true },
});

const User = mongoose.model("User", userSchema);

export default User;
