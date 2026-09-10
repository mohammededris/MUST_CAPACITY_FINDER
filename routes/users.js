import express from "express";
import { clerkClient, getAuth } from "@clerk/express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);
    if (!isAuthenticated) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata?.numOfAlertsLimit === undefined) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { numOfAlertsLimit: 1 },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as usersRouter };
