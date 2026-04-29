const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");
const { body, validationResult } = require("express-validator");
const winston = require("winston");
const morgan = require("morgan");
const AlertRequest = require("./models/AlertRequest");

dotenv.config();

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy (needed for Azure App Service)
app.set("trust proxy", 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Compression
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body Parser with size limits
app.use(express.json({ limit: "10kb" }));

// HTTP Request Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later.",
});

app.use("/api/alerts", authLimiter);

// Initialize Firebase Admin
try {
  let serviceAccount;

  // 1. Try environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        logger.info("Firebase Admin Initialized from environment variable");
      }
    } catch (e) {
      logger.warn(
        "Invalid JSON in FIREBASE_SERVICE_ACCOUNT. Checking local files...",
      );
    }
  }

  // 2. Try specific file found
  if (!serviceAccount) {
    try {
      serviceAccount = require("./must-capacity-finder-firebase-adminsdk-fbsvc-899716e572.json");
      logger.info("Firebase Admin Initialized from must-capacity...json");
    } catch (e) {
      // 3. Try generic service-account.json
      try {
        serviceAccount = require("./service-account.json");
        logger.info("Firebase Admin Initialized from service-account.json");
      } catch (e) {
        logger.error(
          "Firebase Service Account not found. Auth verification will fail.",
        );
      }
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (e) {
  logger.error("Firebase Init Error:", e.message);
}

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ error: "Unauthorized" });
  }
};

// Input validation middleware
const validateAlertRequest = [
  body("subject")
    .trim()
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("Subject is required and must be under 50 characters"),
  body("course_number")
    .trim()
    .notEmpty()
    .isLength({ max: 20 })
    .withMessage("Course number is required and must be under 20 characters"),
  body("crn")
    .trim()
    .notEmpty()
    .isLength({ max: 20 })
    .withMessage("CRN is required and must be under 20 characters"),
  body("whatsappNumber")
    .trim()
    .notEmpty()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Valid WhatsApp number is required"),
];

// Connect to MongoDB with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info("MongoDB Connected");
      return;
    } catch (err) {
      logger.error(`MongoDB Connection Attempt ${i + 1} Failed:`, err.message);
      if (i === retries - 1) {
        logger.error("Could not connect to MongoDB after retries. Exiting...");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

connectDB();

// MongoDB connection event handlers
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error:", err);
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.database = "Connected";
    } else {
      health.database = "Disconnected";
      health.status = "DEGRADED";
    }

    // Check Firebase
    try {
      await admin.auth().listUsers(1);
      health.firebase = "Connected";
    } catch (e) {
      health.firebase = "Disconnected";
      health.status = "DEGRADED";
    }

    const statusCode = health.status === "OK" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({ status: "ERROR", message: error.message });
  }
});

// Config endpoint for frontend
app.get("/api/config", (req, res) => {
  res.json({
    apiUrl: process.env.API_URL || "",
    baseUrl: process.env.BASE_URL || "",
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  });
});

app.post("/api/users/ensure", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email || "";

    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document with default limit
      await userRef.set({
        email: userEmail,
        maxAlerts: 2,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Created new user in Firestore: ${userId} (${userEmail})`);
      return res.status(201).json({
        message: "User created",
        maxAlerts: 2,
        isNew: true,
      });
    } else {
      // User already exists
      const userData = userDoc.data();
      return res.status(200).json({
        message: "User exists",
        maxAlerts: userData.maxAlerts || 2,
        isNew: false,
      });
    }
  } catch (error) {
    logger.error("Error ensuring user exists:", error);
    // Don't fail the request, just log the error
    res.status(200).json({
      message: "User check completed with warnings",
      maxAlerts: 2,
      isNew: false,
    });
  }
});

app.post("/api/alerts", verifyToken, validateAlertRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { subject, course_number, crn, whatsappNumber } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email || "";

    let maxAlerts = 2;
    try {
      const db = admin.firestore();
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists && userDoc.data().maxAlerts) {
        maxAlerts = userDoc.data().maxAlerts;
      } else if (!userDoc.exists) {
        // Create user if doesn't exist (fallback)
        await userRef.set({
          email: userEmail,
          maxAlerts: 2,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.info(
          `Created new user in Firestore (fallback): ${userId} (${userEmail})`,
        );
        maxAlerts = 2;
      }
    } catch (error) {
      logger.warn("Firestore check failed (using default 2):", error.message);
    }

    const existingRequests = await AlertRequest.countDocuments({ userId });
    if (existingRequests >= maxAlerts) {
      return res.status(400).json({
        error: `Limit reached. You can only have ${maxAlerts} active alerts.`,
      });
    }

    const newRequest = new AlertRequest({
      userId,
      subject,
      course_number,
      crn,
      whatsappNumber,
    });

    await newRequest.save();

    res
      .status(201)
      .json({ message: "Alert request saved successfully", data: newRequest });
  } catch (error) {
    logger.error("Error saving alert request:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/alerts", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const requests = await AlertRequest.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/alerts/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { subject, course_number, crn, whatsappNumber, stopped } = req.body;

    const request = await AlertRequest.findOne({ _id: id, userId });

    if (!request) {
      return res
        .status(404)
        .json({ error: "Request not found or unauthorized" });
    }

    if (subject) request.subject = subject;
    if (course_number) request.course_number = course_number;
    if (crn) request.crn = crn;
    if (whatsappNumber) request.whatsappNumber = whatsappNumber;
    if (stopped !== undefined) request.stopped = stopped;

    await request.save();

    res
      .status(200)
      .json({ message: "Request updated successfully", data: request });
  } catch (error) {
    console.error("Error updating alert:", error);
    logger.status(500).json({ error: "Server error" });
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, "client/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

logger; // Global error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});
