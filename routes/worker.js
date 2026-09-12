import express from "express";
import { clerkClient } from "@clerk/express";

import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const password = process.env.WORKER_PASSWORD;
  if (req.headers.password !== password) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const notifications = await Notification.find({ stopAlert: false });
    const notificationsWithEmail = await Promise.all(
      notifications.map(async (notification) => {
        try {
          const clerkUser = await clerkClient.users.getUser(
            notification.userId,
          );

          const primaryEmail = clerkUser.emailAddresses.find(
            (email) => email.id === clerkUser.primaryEmailAddressId,
          )?.emailAddress;

          return {
            ...notification.toObject(),
            email: primaryEmail ?? null,
          };
        } catch (error) {
          if (error.status === 404) {
            console.warn(`Clerk user not found: ${notification.userId}`);

            return {
              ...notification.toObject(),
              email: null,
              userNotFound: true,
            };
          }

          throw error;
        }
      }),
    );
    res.status(200).json({ notifications: notificationsWithEmail });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const password = process.env.WORKER_PASSWORD;
  if (req.headers.password !== password) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const id = req.params.id;
  const { stopAlert, messageSent } = req.body;
  const notification = await Notification.findByIdAndUpdate(id, {
    stopAlert,
    messageSent,
  });
  res.status(200).json({ notification });
});

export { router as workerRouter };
