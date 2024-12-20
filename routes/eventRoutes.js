import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  changeEventStatus,
  likeEvent,
  shareEvent,
  commentOnEvent,
  getCommentsOnEvent,
  getEventById,
  getEventsByRegion,
  getEventsByRegionType,
  uploadEventGallery,
} from "../controllers/eventController.js";
import upload from "../config/multerConfig.js";
import { requireAuth } from '@clerk/express';


const router = express.Router();

// Create Event
router.post("/create", requireAuth(), async (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Admins only." });
  }
  next();
}, createEvent);

// Update Event
router.put("/update/:id", requireAuth(), async (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Admins only." });
  }
  next();
},updateEvent);

// Delete Event
router.delete("/delete/:id", requireAuth(), async (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Admins only." });
  }
  next();
},deleteEvent);

// Approve/Reject Event
router.put("/status/:id", requireAuth(), async (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Admins only." });
  }
  next();
}, changeEventStatus);

// Like Event
router.post("/like/:id", likeEvent);

// Share Event
router.post("/share/:id", shareEvent);

// Comment on Event
router.post("/comment/:id", commentOnEvent);

// Get Comments on Event
router.get("/comments/:id", getCommentsOnEvent);

// Get Event by ID
router.get("/:id", getEventById);

// Get Events by Region
router.get("/region/:regionId", getEventsByRegion);

// Get Events by Region Type
router.get("/region-type/:regionType", getEventsByRegionType);

// upload event gallery
router.post(
  "/upload-event-gallery/:id",
  requireAuth(),
  async (req, res, next) => {
    if (req.auth.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden. Admins only." });
    }
    next();
  },
  upload.array("profileImage", 6),
  uploadEventGallery
);


export default router;
