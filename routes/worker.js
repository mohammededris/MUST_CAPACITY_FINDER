import express from "express";

import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const password = process.env.WORKER_PASSWORD;
  if (req.headers.password !== password) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const notifications = await Notification.find();
  res.status(200).json({ notifications });
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
