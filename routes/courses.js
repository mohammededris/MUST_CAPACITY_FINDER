import express from "express";
import { clerkMiddleware, clerkClient, getAuth } from "@clerk/express";

import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const notifications = await Notification.find({ userId });
  if (!notifications) {
    return res.status(404).json({ error: "No notifications found" });
  }
  res.status(200).json({ notifications });
});

router.post("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { subject, courseCode, crn, whatsAppNumber, userName } = req.body;

  const notification = new Notification({
    subject,
    courseCode,
    crn,
    whatsAppNumber,
    userId,
    userName,
  });
  await notification.save();
  res.status(201).json({ message: "Alert request created successfully" });
});

router.put("/:id", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { subject, courseCode, crn, whatsAppNumber, userName } = req.body;

  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notification.subject = subject;
  notification.courseCode = courseCode;
  notification.crn = crn;
  notification.whatsAppNumber = whatsAppNumber;
  notification.userName = userName;

  await notification.save();
  res.status(200).json({ message: "Alert request updated successfully" });
});

router.patch("/stop/:id", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notification.stopAlert = true;

  await notification.save();
  res.status(200).json({ message: "Alert request updated successfully" });
});

export { router as coursesRouter };
