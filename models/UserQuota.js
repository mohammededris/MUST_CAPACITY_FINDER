import mongoose from "mongoose";

const userQuotaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  alertLimit: {
    type: Number,
    required: true,
  },
  alertCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const UserQuota = mongoose.model("UserQuota", userQuotaSchema);
