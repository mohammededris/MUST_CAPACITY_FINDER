import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import mongoose from "mongoose";

import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { coursesRouter } from "./routes/courses.js";
import { workerRouter } from "./routes/worker.js";
import { usersRouter } from "./routes/users.js";
import { inputRouter } from "./routes/input.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/v1/worker", workerRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/search", inputRouter);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}
