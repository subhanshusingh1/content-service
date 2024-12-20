import mongoose from "mongoose";

// Poll Schema
const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        optionText: { type: String, required: true },
        votes: { type: Number, default: 0 }, // Track votes for each option
      },
    ],
    // Replace localityId with dynamic regionId and regionType
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
      required: true,
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (Editor)
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
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
  },
  { timestamps: true }
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
