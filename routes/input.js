import express from "express";
import { clerkMiddleware, clerkClient, getAuth } from "@clerk/express";

import { Alldata } from "../models/Alldata.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { searchSubject, searchcourseNumber } = req.query;

  try {
    // Level 1: Load subjects
    if (!searchSubject && !searchcourseNumber) {
      const subjects = await Alldata.distinct("subject");

      return res.json(
        subjects
          .filter(Boolean)
          .map((subject) => String(subject).toUpperCase())
          .sort(),
      );
    }

    // A course number cannot be searched without a subject
    if (!searchSubject && searchcourseNumber) {
      return res.status(400).json({
        error: "searchSubject is required before searchcourseNumber",
      });
    }

    const normalizedSubject = String(searchSubject).trim().toUpperCase();

    // Level 2: Load course numbers for the selected subject
    if (!searchcourseNumber) {
      const courseNumbers = await Alldata.distinct("courseNumber", {
        subject: normalizedSubject,
      });

      return res.json(
        courseNumbers
          .filter(Boolean)
          .map((courseNumber) => String(courseNumber))
          .sort((first, second) =>
            first.localeCompare(second, undefined, { numeric: true }),
          ),
      );
    }

    // Level 3: Load CRNs for the selected subject and course number
    const crns = await Alldata.distinct("courseReferenceNumber", {
      subject: normalizedSubject,
      courseNumber: String(searchcourseNumber).trim(),
    });

    return res.json(
      crns
        .filter(Boolean)
        .map((crn) => String(crn))
        .sort((first, second) =>
          first.localeCompare(second, undefined, { numeric: true }),
        ),
    );
  } catch (error) {
    console.error("Error fetching search data:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export { router as inputRouter };

/*

router.get("/", async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);

  const { searchCrn, searchcourseNumber, searchSubject } = req.query;

  //   if (!isAuthenticated) {
  //     return res.status(401).json({ error: "Unauthorized" });
  //   }
  try {
    console.log("searchCrn:", searchCrn);
    console.log("searchcourseNumber:", searchcourseNumber);
    console.log("searchSubject:", searchSubject);

    if (!searchSubject || !searchcourseNumber) {
      return res.status(400).json({
        error: "searchSubject and searchcourseNumber are required",
      });
    }

    const crns = await Alldata.distinct("courseReferenceNumber", {
      subject: String(searchSubject).toUpperCase(),
      courseNumber: String(searchcourseNumber),
    });

    

    res.json(crns);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
*/
