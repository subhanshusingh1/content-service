import Poll from "../models/Poll.js"; // Import Poll model


// Create Poll
export const createPoll = async (req, res) => {
  try {
    const { question, options, regionId, regionType, reporterId, status } = req.body;

    const newPoll = new Poll({
      question,
      options,
      regionId,
      regionType,
      reporterId,
      status,
    });

    await newPoll.save();

    res.status(201).json({ message: "Poll created successfully", poll: newPoll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve / Reject Poll
export const changePollStatus = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { status } = req.body; // status can be 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedPoll = await Poll.findByIdAndUpdate(
      pollId,
      { status },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll status updated", poll: updatedPoll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Like Poll
export const likePoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user._id; // Assuming user is authenticated and user._id is available

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if the user already liked the poll
    const alreadyLiked = poll.likes.some(like => like.userId.toString() === userId.toString());

    if (alreadyLiked) {
      return res.status(400).json({ message: "You already liked this poll" });
    }

    // Add like
    poll.likes.push({ userId, likedAt: Date.now() });
    await poll.save();

    res.status(200).json({ message: "Poll liked successfully", poll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Poll
export const updatePoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { question, options, regionId, regionType, status } = req.body;

    const updatedPoll = await Poll.findByIdAndUpdate(
      pollId,
      { question, options, regionId, regionType, status },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll updated successfully", poll: updatedPoll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Poll by ID
export const deletePoll = async (req, res) => {
  try {
    const pollId = req.params.id;

    const deletedPoll = await Poll.findByIdAndDelete(pollId);

    if (!deletedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Share Poll
export const sharePoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Add share
    poll.shares.push({ userId, sharedAt: Date.now() });
    await poll.save();

    res.status(200).json({ message: "Poll shared successfully", poll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on Poll
export const commentOnPoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { comment } = req.body;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.comments.push({ userId, comment, commentedAt: Date.now() });
    await poll.save();

    res.status(200).json({ message: "Comment added successfully", poll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Comment on Polls
export const getCommentsOnPoll = async (req, res) => {
  try {
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId).select('comments');
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({ comments: poll.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Poll By Id
export const getPollById = async (req, res) => {
  try {
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Poll By Region
export const getPollsByRegion = async (req, res) => {
  try {
    const regionId = req.params.regionId;

    const polls = await Poll.find({ regionId, status: "approved" });
    if (!polls.length) {
      return res.status(404).json({ message: "No polls found for this region" });
    }

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Poll by Region Type
export const getPollsByRegionType = async (req, res) => {
  try {
    const regionType = req.params.regionType;

    if (!["State", "District", "City", "Locality"].includes(regionType)) {
      return res.status(400).json({ message: "Invalid region type" });
    }

    const polls = await Poll.find({ regionType, status: "approved" });
    if (!polls.length) {
      return res.status(404).json({ message: "No polls found for this region type" });
    }

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Featured Poll
export const getFeaturedPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ featured: true, status: "approved" });
    if (!polls.length) {
      return res.status(404).json({ message: "No featured polls found" });
    }

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote on Poll
export const voteOnPollOption = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionIndex } = req.body; // The index of the option the user wants to vote for
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Increment the vote count for the selected option
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.status(200).json({ message: "Vote recorded", poll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


