import mongoose from "mongoose";
const Schema = mongoose.Schema;



const notificationSchema = new Schema({
  subject: { type: String, required: true },
  courseCode: { type: String, required: true },
  crn: { type: String, required: true },
  whatsAppNumber: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  stopAlert: { type: Boolean, default: false },
  messageSent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

export { Notification as Notification };
