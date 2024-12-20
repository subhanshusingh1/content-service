import Event from "../models/Event.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, profileImage, regionId, regionType, reporterId } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      profileImage,
      regionId,
      regionType,
      reporterId,
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, profileImage, regionId, regionType, editorId } = req.body;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { title, description, date, profileImage, regionId, regionType, editorId },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/Reject Event
export const changeEventStatus = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: `Event ${status} successfully`, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like Event
export const likeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingLike = event.likes.find((like) => like.userId.toString() === userId);

    if (existingLike) {
      return res.status(400).json({ message: "You have already liked this event" });
    }

    event.likes.push({ userId, likedAt: new Date() });
    await event.save();

    res.status(200).json({ message: "Event liked successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share Event
export const shareEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.shares.push({ userId, sharedAt: new Date() });
    await event.save();

    res.status(200).json({ message: "Event shared successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on Event
export const commentOnEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId, comment } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.comments.push({ userId, comment, commentedAt: new Date() });
    await event.save();

    res.status(200).json({ message: "Comment added successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Comments on Event
export const getCommentsOnEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId).select("comments");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ comments: event.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Event by ID
export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by ID and populate the reporterId field with the 'name' from the User model
    const event = await Event.findById(eventId)
      .populate("reporterId", "name") // Populate reporterId with the 'name' field from User model
      .exec();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Return the event along with the reporter's name
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Events by Region
export const getEventsByRegion = async (req, res) => {
  try {
    const regionId = req.params.regionId;

    const events = await Event.find({ regionId, status: "approved" });

    if (!events.length) {
      return res.status(404).json({ message: "No events found for this region" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Events by Region Type
export const getEventsByRegionType = async (req, res) => {
  try {
    const regionType = req.params.regionType;

    if (!["State", "District", "City", "Locality"].includes(regionType)) {
      return res.status(400).json({ message: "Invalid region type" });
    }

    const events = await Event.find({ regionType, status: "approved" });

    if (!events.length) {
      return res.status(404).json({ message: "No events found for this region type" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @Desc Upload Profile Image
export const uploadEventGallery = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    console.log(req.user);

    const eventId = req.params.id; // Assuming event ID is passed as a URL parameter

    // Update the event's gallery with the new image URLs
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $push: { profileImage: { $each: req.files.map(file => file.path) } } }, // Store multiple images
      { new: true }
    );

    // Check if event exists
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json({
      message: "Event images uploaded successfully.",
      profileImage: updatedEvent.profileImage,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    return res.status(500).json({
      message: "Error uploading event images.",
      error: error.message,
    });
  }
};


