import express from "express";
import { clerkClient, getAuth } from "@clerk/express";
import mongoose from "mongoose";

import { Notification } from "../models/Notification.js";
import { UserQuota } from "../models/UserQuota.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userQuota = await UserQuota.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        alertLimit: 1,
        alertCount: 0,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );

  const alertLimit = userQuota.alertLimit;

  const notifications = await Notification.find({ userId });
  if (!notifications) {
    return res.status(404).json({ error: "No notifications found" });
  }
  res
    .status(200)
    .json({ notifications, alertLimit, alertCount: userQuota.alertCount });
});

router.post("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await mongoose.startSession();

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const alertLimit = Number(clerkUser.publicMetadata?.numOfAlertsLimit ?? 1);
    const { subject, courseCode, crn, whatsAppNumber, userName } = req.body;
    if (!subject || !courseCode || !crn || !whatsAppNumber || !userName) {
      return res.status(400).json({
        error: "All alert fields are required",
      });
    }
    let limitReached = false;

    await session.withTransaction(async () => {
      await UserQuota.updateOne(
        { userId },
        {
          $setOnInsert: {
            userId,
            alertLimit,
            alertCount: 0,
          },
        },
        {
          upsert: true,
          session,
        },
      );

      const quota = await UserQuota.findOneAndUpdate(
        {
          userId,
          alertCount: { $lt: alertLimit },
        },
        {
          $inc: { alertCount: 1 },
          $set: { alertLimit },
        },
        {
          new: true,
          session,
        },
      );

      if (!quota) {
        limitReached = true;
        return;
      }

      await Notification.create(
        [
          {
            subject,
            courseCode,
            crn,
            whatsAppNumber,
            userId,
            userName,
          },
        ],
        { session },
      );
    });

    if (limitReached) {
      return res.status(409).json({
        message: `You can only create ${alertLimit} alert request${
          alertLimit === 1 ? "" : "s"
        }.`,
      });
    }

    return res.status(201).json({
      message: "Alert request created successfully",
    });
  } catch (error) {
    console.error("Create alert failed:", error);

    return res.status(500).json({
      error: "Unable to create alert request",
    });
  } finally {
    await session.endSession();
  }
});

router.put("/:id", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { subject, courseCode, crn, whatsAppNumber } = req.body;

  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notification.subject = subject;
  notification.courseCode = courseCode;
  notification.crn = crn;
  notification.whatsAppNumber = whatsAppNumber;
  notification.messageSent = 0;

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
  notification.messageSent = 0;

  await notification.save();
  res.status(200).json({ message: "Alert request updated successfully" });
});

router.patch("/start/:id", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  notification.stopAlert = false;
  notification.messageSent = 0;

  await notification.save();
  res.status(200).json({ message: "Alert request updated successfully" });
});

export { router as coursesRouter };
