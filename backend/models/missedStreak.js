import mongoose from 'mongoose';

const MissedStreakSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  habitId: { type: String, required: true },
  habitName: { type: String, required: true },
  explanation: { type: String, required: true },
  aiResponse: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('MissedStreak', MissedStreakSchema);
