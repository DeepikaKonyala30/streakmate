import mongoose from 'mongoose';
const circleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  habits: [String],
  category: {
    type: String,
    enum: ['Fitness', 'Mindfulness', 'Learning', 'Productivity', 'Health', 'Other'],
    default: 'Other'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
// Index for search functionality
circleSchema.index({ name: 'text', description: 'text' });
export default mongoose.model('Circle', circleSchema);
