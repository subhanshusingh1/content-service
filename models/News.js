import mongoose from "mongoose";
import validator from "validator";

// News Schema
const newsSchema = new mongoose.Schema(
  {
    clerkUserId: {
       type: String, required: true 
    }, // Add clerkUserId field
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String, // Tags for categorization
      },
    ],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    profileImage: [
      {
        type: String,
        validate: {
          validator: validator.isURL,
          message: "Invalid URL format",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "regionType", // Dynamically references the correct region (State, District, City, Locality)
      required: true,
    },
    regionType: {
      type: String,
      enum: ["State", "District", "City", "Locality"], // Dynamic reference to the type of region
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (Reporter)
      // required: true,
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (Editor)
    },
    likes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        likedAt: { type: Date, default: Date.now },
      },
    ],
    shares: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        commentedAt: { type: Date, default: Date.now },
      },
    ],
    featured: { type: Boolean, default: false }, // Flag for curated content
    isTrending: {
      type: Boolean,
      default: false, // Flag for marking news as trending
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

export default News;
