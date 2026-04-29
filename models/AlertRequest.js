const mongoose = require("mongoose");

const AlertRequestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  course_number: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  crn: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    index: true, // Index for fast user lookups
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting
  },
  stopped: {
    type: Boolean,
    default: false,
    index: true, // Index for filtering active alerts
  },
});

// Compound index for common queries (userId + createdAt)
AlertRequestSchema.index({ userId: 1, createdAt: -1 });

// Compound index for filtering active alerts per user
AlertRequestSchema.index({ userId: 1, stopped: 1 });

module.exports = mongoose.model("AlertRequest", AlertRequestSchema);
