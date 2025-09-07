import mongoose from "mongoose";
const joinRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  circleId: { type: mongoose.Schema.Types.ObjectId, ref: "Circle", required: true },
  status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
}, { timestamps: true });
export default mongoose.model("JoinRequest", joinRequestSchema);
