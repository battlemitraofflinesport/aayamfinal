const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const { isAdmin } = require("../middlewares/authMiddleware");
const uploadEvent = require("../middlewares/uploadEvent");

/* ===============================
   PUBLIC ROUTES
================================ */

// Events listing page
router.get("/events", eventController.getEventsPage);

// Event detail page
router.get("/events/:id", eventController.getEventDetail);

/* ===============================
   REVIEWS (PAST EVENTS)
================================ */

// ADD REVIEW (PUBLIC)
router.post(
  "/events/:id/reviews",
  eventController.addReview
);

// DELETE REVIEW (ADMIN)
router.post(
  "/events/:eventId/reviews/:reviewId/delete",
  isAdmin,
  eventController.deleteReview
);

/* ===============================
   ADMIN ROUTES (CRUD)
================================ */

// Add new event
router.post(
  "/events/add",
  isAdmin,
  uploadEvent.single("bannerImage"),
  eventController.addEvent
);

// Edit event form
router.get(
  "/events/edit/:id",
  isAdmin,
  eventController.getEditEvent
);

// Update event
router.post(
  "/events/edit/:id",
  isAdmin,
  uploadEvent.single("bannerImage"),
  eventController.updateEvent
);

// Delete event
router.post(
  "/events/delete/:id",
  isAdmin,
  eventController.deleteEvent
);

// Manually move event to past
router.post(
  "/events/move-to-past/:id",
  isAdmin,
  eventController.moveEventToPast
);

// ADD GALLERY IMAGES
router.post(
  "/events/:id/gallery",
  isAdmin,
  uploadEvent.array("galleryImages", 15),
  eventController.addGalleryImages
);

// DELETE SINGLE GALLERY IMAGE
router.post(
  "/events/:eventId/gallery/:index/delete",
  isAdmin,
  eventController.deleteGalleryImage
);

// DELETE BANNER IMAGE
router.post(
  "/events/:id/banner/delete",
  isAdmin,
  eventController.deleteBannerImage
);

// ADD COORDINATOR
router.post(
  "/events/:id/conducted-by",
  isAdmin,
  eventController.addCoordinator
);

// DELETE COORDINATOR
router.post(
  "/events/:eventId/conducted-by/:index/delete",
  isAdmin,
  eventController.deleteCoordinator
);
// ADD DOCUMENT
router.post(
  "/events/:id/documents",
  isAdmin,
  uploadEvent.single("document"),
  eventController.addDocument
);

// DELETE DOCUMENT
router.post(
  "/events/:eventId/documents/:index/delete",
  isAdmin,
  eventController.deleteDocument
);

module.exports = router;
