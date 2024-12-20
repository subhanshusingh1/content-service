import News from "../models/News.js";
import { clerkClient } from "@clerk/express";
import redis from "../config/redisConfig.js";
import axios from "axios";
const authServiceBaseUrl = process.env.VITE_AUTH_SERVICE_BASE_URL; // Fetch from environment variables

// Create News
export const createNewsWithGallery = async (req, res) => {
  try {
    const { title, description, tags, regionId, regionType, clerkUserId } = req.body;

    // Validate required fields
    if (!title || !description || !regionId || !regionType || !clerkUserId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the news with the same title already exists
    const existingNews = await News.findOne({ title });
    if (existingNews) {
      return res.status(400).json({ message: "News with this title already exists." });
    }

    // Create a new news item
    const news = new News({
      title,
      description,
      tags,
      regionId,
      regionType,
      clerkUserId, // Save clerkUserId
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      news.profileImage = req.files.map((file) => file.path); // Save file paths
    }

    // Save the news to the database
    await news.save();

    // Return the created news including clerkUserId
    return res.status(201).json({
      message: "News created successfully.",
      news: {
        ...news.toObject(), // Convert Mongoose document to plain object
        clerkUserId, // Explicitly include clerkUserId in the response
      },
      profileImage: news.profileImage || [], // Return profile image paths
    });
  } catch (error) {
    console.error("Error creating news with gallery:", error);
    return res.status(500).json({
      message: "Error creating news with gallery.",
      error: error.message,
    });
  }
};



// Delete News
export const deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const news = await News.findByIdAndDelete(newsId);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    res.status(200).json({ message: "News article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update News
export const updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const updates = req.body;

    const news = await News.findByIdAndUpdate(newsId, updates, { new: true });

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approved / Reject News
export const approveRejectNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { status } = req.body; // Expecting 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const news = await News.findByIdAndUpdate(
      newsId,
      { status },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Feature a News
export const featureNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { featured } = req.body; // Expecting 'true' or 'false'

    const news = await News.findByIdAndUpdate(
      newsId,
      { featured },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Featured News
export const getFeaturedNews = async (req, res) => {
  try {
    const featuredNews = await News.find({ featured: true }).limit(4); // You can adjust the number of featured news as needed

    if (!featuredNews || featuredNews.length === 0) {
      return res.status(404).json({ message: "No featured news found" });
    }

    // Sending back the featured news with title, description, and profile image (first image)
    const responseData = featuredNews.map((news) => ({
      id: news._id,
      title: news.title,
      description: news.description,
      reporter: news.reporterId?.name,
      imageSrc:
        news.profileImage.length > 0
          ? news.profileImage[0]
          : "https://via.placeholder.com/300x200", // Fallback image if no profileImage is available
    }));

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getFeaturedNews = async (req, res) => {
//   try {
//     // Fetch featured news with a limit
//     const featuredNews = await News.find({ featured: true }).limit(5);

//     if (!featuredNews || featuredNews.length === 0) {
//       return res.status(404).json({ message: "No featured news found" });
//     }

//     // Fetch reporter details for all featured news
//     const responseData = await Promise.all(
//       featuredNews.map(async (news) => {
//         let reporterName = "Unknown Reporter"; // Default value if no reporter details are available

//         // Determine which reporter ID to use (prefer reporterId if both exist)
//         const reporterId = news.reporterId || news.clerkUserId;

//         if (reporterId) {
//           try {
//             console.log(`Fetching reporter profile for ID: ${reporterId}`);

//             // Fetch reporter details
//             const reporterResponse = await axios.get(
//               `${authServiceBaseUrl}/api/v1/users/profile/${reporterId}`,
//               { timeout: 5000 }
//             );
//             reporterName = reporterResponse.data?.user?.name || reporterName;
//           } catch (reporterError) {
//             console.error(`Failed to fetch reporter for news ${news._id}:`, {
//               errorMessage: reporterError.message,
//               errorStack: reporterError.stack,
//             });
//           }
//         }

//         // Construct the response object
//         return {
//           id: news._id,
//           title: news.title,
//           description: news.description,
//           reporter: reporterName, // Fetched or fallback reporter name
//           date: news.date,
//           imageSrc:
//             news.profileImage.length > 0
//               ? news.profileImage[0]
//               : "https://via.placeholder.com/300x200", // Fallback image
//         };
//       })
//     );

//     // Send the processed response
//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error("Error in getFeaturedNews:", {
//       errorMessage: error.message,
//       errorStack: error.stack,
//     });

//     res.status(500).json({
//       message: "Internal server error while fetching featured news",
//       errorDetails: error.message,
//     });
//   }
// };


// Like a News
export const likeNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { userId } = req.body;

    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    // Check if user has already liked the news
    const alreadyLiked = news.likes.some(
      (like) => like.userId.toString() === userId
    );

    if (alreadyLiked) {
      return res.status(400).json({ message: "User already liked this news" });
    }

    news.likes.push({ userId });
    await news.save();

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share a News
export const shareNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { userId } = req.body;

    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    news.shares.push({ userId });
    await news.save();

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on news
export const commentNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { userId, comment } = req.body;

    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    news.comments.push({ userId, comment });
    await news.save();

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all the comments
export const getCommentsOnNews = async (req, res) => {
  try {
    const newsId = req.params.id;

    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    res.status(200).json(news.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific News
// Get specific News
// export const getSpecificNews = async (req, res) => {
//   try {
//     const newsId = req.params.id;

//     // Find the specific news article and filter by 'approved' status
//     const news = await News.findOne({ _id: newsId, status: "approved" });

//     if (!news) {
//       return res
//         .status(404)
//         .json({ message: "Approved news article not found" });
//     }

//     // Assuming the User microservice is accessible at 'http://localhost:5001/api/v1/users/profile/{id}'
//     const reporterResponse = await axios.get(
//       `http://localhost:5001/api/v1/users/profile/${news.reporterId}`
//     );

//     // Prepare the response data
//     const responseData = {
//       id: news._id,
//       title: news.title,
//       description: news.description,
//       reporter: reporterResponse.data.user.name, // Assuming the reporter name is in the response
//       date: news.date,
//       imageSrc:
//         news.profileImage.length > 0
//           ? news.profileImage[0]
//           : "https://via.placeholder.com/300x200", // Fallback image if no profileImage is available
//     };

//     // Sending back the news article along with reporter's name
//     res.status(200).json(responseData);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getSpecificNews = async (req, res) => {
  try {
    const newsId = req.params.id;

    // Find the specific news article and filter by 'approved' status
    const news = await News.findOne({ _id: newsId, status: "approved" });

    if (!news) {
      return res
        .status(404)
        .json({ message: "Approved news article not found" });
    }

    let reporterName = "Unknown Reporter"; // Default value if no reporter details are available

    // Determine which reporter ID to use (prefer reporterId if both exist)
    const reporterId = news.reporterId || news.clerkUserId;

    if (reporterId) {
      try {
        // Fetch reporter details using the determined reporterId
        const reporterResponse = await axios.get(
          `${authServiceBaseUrl}/api/v1/users/profile/${reporterId}`
        );
        reporterName = reporterResponse.data?.user?.name || reporterName;
      } catch (error) {
        console.warn("Failed to fetch reporter details:", error.message);
      }
    }

    // Prepare the response data
    const responseData = {
      id: news._id,
      title: news.title,
      description: news.description,
      reporter: reporterName,
      date: news.date,
      imageSrc:
        news.profileImage.length > 0
          ? news.profileImage[0]
          : "https://via.placeholder.com/300x200", // Fallback image if no profileImage is available
    };

    // Sending back the news article along with reporter's name
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching specific news:", error.message);
    res.status(500).json({ message: "An error occurred while fetching the news." });
  }
};


// Controller to fetch only trending news
export const getTrendingNews = async (req, res) => {
  try {
    // Find all news articles marked as trending
    const trendingNews = await News.find({ isTrending: true }).limit(5); // Adjust the limit as needed

    if (!trendingNews || trendingNews.length === 0) {
      return res.status(404).json({ message: "No trending news found" });
    }

    // Fetch reporter names concurrently for all trending news
    const responseData = await Promise.all(
      trendingNews.map(async (news) => {
        let reporterName = "Unknown Reporter"; // Default value if no reporter details are available

        // Determine which reporter ID to use (prefer reporterId if both exist)
        const reporterId = news.reporterId || news.clerkUserId;

        if (reporterId) {
          try {
            // Fetch reporter details using the appropriate ID
            const reporterResponse = await axios.get(
              `${authServiceBaseUrl}/api/v1/users/profile/${reporterId}`
            );
            reporterName = reporterResponse.data?.user?.name || reporterName;
          } catch (error) {
            console.error(
              `Failed to fetch reporter for news ID ${news._id}:`,
              error.message
            );
          }
        }

        // Construct the detailed trending news object
        return {
          id: news._id,
          title: news.title,
          description: news.description,
          reporter: reporterName, // Reporter name (either fetched or fallback)
          date: news.date,
          imageSrc:
            news.profileImage.length > 0
              ? news.profileImage[0]
              : "https://via.placeholder.com/300x200", // Fallback image if no profileImage is available
        };
      })
    );

    // Send the response with the processed trending news
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching trending news:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// const getUserDetails = async (userId) => {
//   const cacheKey = `user:${userId}`; // Redis cache key

//   // Check if user details exist in Redis
//   const cachedUser = await redis.get(cacheKey);
//   if (cachedUser) return JSON.parse(cachedUser);

//   // Fetch user details from the User service
//   const response = await axios.get(
//     `http://localhost:5001/api/v1/users/profile/${userId}`
//   );
//   const userDetails = response.data;

//   // Cache user details in Redis with TTL of 5 minutes
//   await redis.setex(cacheKey, 300, JSON.stringify(userDetails));

//   return userDetails;
// };

// Get News By Region Id
// Get News By Region Id
export const getNewsByRegion = async (req, res) => {
  try {
    const regionId = req.params.regionId;

    console.log(regionId);

    // Fetch only approved news articles for the given region
    const newsList = await News.find({ regionId, status: "approved" });

    if (!newsList.length) {
      return res
        .status(404)
        .json({ message: "No approved news found for this region" });
    }

    // Map over the news list to add reporter details and construct response data
    const detailedNews = await Promise.all(
      newsList.map(async (news) => {
        let reporterName = "Unknown Reporter"; // Default value if no reporter details are available

        // Determine which reporter ID to use (prefer reporterId if both exist)
        const reporterId = news.reporterId || news.clerkUserId;

        if (reporterId) {
          try {
            // Fetch reporter details from the user microservice
            const reporterResponse = await axios.get(
              `${authServiceBaseUrl}/api/v1/users/profile/${reporterId}`
            );
            reporterName = reporterResponse.data?.user?.name || reporterName;
          } catch (error) {
            console.warn("Failed to fetch reporter details:", error.message);
          }
        }

        // Construct the detailed news object
        return {
          id: news._id,
          title: news.title,
          description: news.description,
          reporter: reporterName,
          date: news.date,
          imageSrc:
            news.profileImage.length > 0
              ? news.profileImage[0]
              : "https://via.placeholder.com/300x200", // Fallback image if no profileImage is available
        };
      })
    );

    // Return the list of detailed news articles
    res.status(200).json(detailedNews);
  } catch (error) {
    console.error("Error fetching news by region:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// Get News by Region Type
export const getNewsByRegionType = async (req, res) => {
  try {
    const regionType = req.params.regionType;

    // Validate the regionType and fetch only approved news articles
    if (!["State", "District", "City", "Locality"].includes(regionType)) {
      return res.status(400).json({ message: "Invalid region type" });
    }

    const news = await News.find({ regionType, status: "approved" });

    if (!news.length) {
      return res
        .status(404)
        .json({ message: "No approved news found for this region type" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @Desc Upload News Image
// export const uploadNewsGallery = async (req, res) => {
//   try {
//     // Check if files were uploaded
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded." });
//     }

//     const newsId = req.params.id; // Assuming news ID is passed as a URL parameter

//     // Find the news by its ID
//     const updatedNews = await News.findById(newsId);
//     if (!updatedNews) {
//       return res.status(404).json({ message: "News not found." });
//     }

// Validate the uploaded files (e.g., file type, size)
// const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
// const maxSize = 5 * 1024 * 1024; // 5MB limit
// for (const file of req.files) {
//   if (!validTypes.includes(file.mimetype)) {
//     return res.status(400).json({ message: `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and GIF are allowed.` });
//   }
//   if (file.size > maxSize) {
//     return res.status(400).json({ message: `File size exceeds the 5MB limit.` });
//   }
// }

// Add the uploaded image paths to the news' gallery
// updatedNews.profileImage.push(...req.files.map(file => file.path));

// Save the updated news
// await updatedNews.save();

//     return res.status(200).json({
//       message: "News gallery uploaded successfully.",
//       profileImage: updatedNews.profileImage,
//     });
//   } catch (error) {
//     console.error("Error uploading images:", error);
//     return res.status(500).json({
//       message: "Error uploading news gallery.",
//       error: error.message,
//     });
//   }
// };

// Controller to get news for regions the user is subscribed to
// export const getNewsForSubscribedRegions = async (req, res) => {
//   try {
//     // Get the authenticated user
//     const { userId } = req.auth;

//     // Fetch user data from Clerk
//     const user = await clerkClient.users.getUser(userId);

//     // Assuming user subscriptions are stored in customClaims.subscribedRegions (an array of regionIds)
//     const subscriptions = user.customClaims?.subscribedRegions || [];

//     // If the user is not subscribed to any regions, return a 404 or message
//     if (!subscriptions.length) {
//       return res
//         .status(404)
//         .json({ message: "No subscriptions found for the user." });
//     }

//     // Query news articles that belong to the regions the user is subscribed to
//     const news = await News.find({
//       regionId: { $in: subscriptions }, // Match any news articles where regionId is in the user's subscribed regions
//       status: "approved", // Only approved news
//     });

//     // If no news is found, return a 404 or message
//     if (!news.length) {
//       return res.status(404).json({
//         message: "No approved news found for your subscribed regions.",
//       });
//     }

//     // Return the found news
//     return res.status(200).json(news);
//   } catch (error) {
//     // Handle errors and log them
//     console.error(error);
//     return res.status(500).json({ message: error.message });
//   }
// };

export const getNewsForSubscribedRegions = async (req, res) => {
  try {
    const { clerkUserId } = req.query; // Extract clerkUserId from query parameters

    if (!clerkUserId) {
      return res.status(400).json({ message: "Clerk User ID is required." });
    }

    // Fetch the user and their subscriptions from the user microservice
    const userResponse = await axios.get(
      `${authServiceBaseUrl}/api/v1/users/details/${clerkUserId}`
    );

    console.log(userResponse.data); // Logging the response data

    if (
      !userResponse.data ||
      !userResponse.data.user ||
      !userResponse.data.user.subscriptions ||
      !userResponse.data.user.subscriptions.length
    ) {
      return res
        .status(404)
        .json({ message: "No subscriptions found for the user." });
    }

    // Extract region IDs from the user's subscriptions
    const subscribedRegionIds = userResponse.data.user.subscriptions.map(
      (sub) => sub.regionId
    );

    // Fetch news for the subscribed regions
    const newsList = await News.find({
      regionId: { $in: subscribedRegionIds },
      status: "approved", // Only fetch approved news
    });

    if (!newsList.length) {
      return res.status(404).json({
        message: "No approved news found for your subscribed regions.",
      });
    }

    // Simplify the news structure
    const detailedNews = newsList.map((news) => ({
      id: news._id,
      title: news.title,
      description: news.description,
      date: news.date,
      imageSrc:
        news.profileImage && news.profileImage.length > 0
          ? news.profileImage[0]
          : "https://via.placeholder.com/300x200", // Fallback image
    }));

    return res.status(200).json(detailedNews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Controller to get all news for a selected region (regardless of subscription status)
// export const getNewsForRegion = async (req, res) => {
//   try {
//     const { regionId } = req.params; // The regionId passed in the request to filter news

//     // Query news articles for the selected region
//     const news = await News.find({
//       regionId: regionId, // Match news articles for the selected region
//       status: 'approved', // Only approved news
//     });

//     // If no news is found for the selected region, return a 404 or message
//     if (!news.length) {
//       return res.status(404).json({ message: "No approved news found for this region." });
//     }

//     // Return the found news
//     return res.status(200).json(news);

//   } catch (error) {
//     // Handle errors and log them
//     console.error(error);
//     return res.status(500).json({ message: error.message });
//   }
// };
