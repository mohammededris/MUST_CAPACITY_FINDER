import express from "express";
import { clerkClient, getAuth } from "@clerk/express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      numOfAlertsLimit: 1,
    },
  });
});

export { router as usersRouter };
