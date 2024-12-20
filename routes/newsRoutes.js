import express from "express";
import {
  // createNews,
  deleteNews,
  updateNews,
  approveRejectNews,
  featureNews,
  getFeaturedNews,
  likeNews,
  shareNews,
  commentNews,
  getCommentsOnNews,
  getSpecificNews,
  getNewsByRegion,
  getNewsByRegionType,
  // uploadNewsGallery,
  getNewsForSubscribedRegions,
  getTrendingNews,
  createNewsWithGallery,
} from "../controllers/newsController.js"; // Assuming your controller file is 'controllers/newsController.js'
import { requireAuth } from "@clerk/express";
import upload from "../config/multerConfig.js";

const router = express.Router();

// Route to create a news article
// router.post("/", requireAuth(), async (req, res, next) => {
//   if (req.auth.role !== "admin") {
//     return res.status(403).json({ message: "Access forbidden. Admins only." });
//   }
//   next();
// }, createNews);

// Route to get all featured news articles
router.get("/featured", getFeaturedNews);

// Route to get trending news
router.get("/trending", getTrendingNews);

router.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Test route working");
});

// create news
router.post("/create-news", upload.array('profileImage', 1), createNewsWithGallery); 

// Route to get news for regions the user is subscribed to
// router.get("/news/subscribed", requireAuth(), getNewsForSubscribedRegions);
router.get("/subscribed",  getNewsForSubscribedRegions);

// Route to delete a news article
router.delete(
  "/:id",
  requireAuth(),
  async (req, res, next) => {
    if (req.auth.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admins only." });
    }
    next();
  },
  deleteNews
);

// Route to update a news article
router.patch(
  "/:newsId",
  // requireAuth(),
  // async (req, res, next) => {
  //   if (req.auth.role !== "admin") {
  //     return res
  //       .status(403)
  //       .json({ message: "Access forbidden. Admins only." });
  //   }
  //   next();
  // },
  updateNews
);

// Route to approve/reject a news article
// router.patch("/:id/approve-reject", requireAuth(), async (req, res, next) => {
//   if (req.auth.role !== "admin") {
//     return res.status(403).json({ message: "Access forbidden. Admins only." });
//   }
//   next();
// }, approveRejectNews);
router.patch("/:id/approve-reject", approveRejectNews);

// Route to feature/unfeature a news article
router.patch(
  "/:id/feature",
  requireAuth(),
  async (req, res, next) => {
    if (req.auth.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access forbidden. Admins only." });
    }
    next();
  },
  featureNews
);



// Route to like a news article
router.patch("/:id/like", requireAuth(), likeNews);

// Route to share a news article
router.patch("/:id/share", requireAuth(), shareNews);

// Route to comment on a news article
router.patch("/:id/comment", requireAuth(), commentNews);

// Route to get comments on a news article
router.get("/:id/comments", getCommentsOnNews);

// Route to get a specific news article
router.get("/:id", getSpecificNews);

// Route to get news by region ID
router.get("/region/:regionId", getNewsByRegion);

// Route to get news by region type (State, District, City, Locality)
router.get("/region-type/:regionType", getNewsByRegionType);

// router.post(
//   "/upload-news-gallery/:id",
//   requireAuth(),
//   async (req, res, next) => {
//     if (req.auth.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Access forbidden. Admins only." });
//     }
//     next();
//   },
//   upload.array("profileImage", 6),
//   uploadNewsGallery
// );
// router.post(
//   "/upload-news-gallery/:id",
//   upload.array("profileImage", 6),
//   uploadNewsGallery
// );



export default router;
