import express from 'express';
import {
  createPoll,
  updatePoll,
  deletePoll,
  voteOnPollOption,
  likePoll,
  sharePoll,
  commentOnPoll,
  getCommentsOnPoll,
  getPollById,
  getFeaturedPolls,
  getPollsByRegion,
  getPollsByRegionType,
  changePollStatus
} from '../controllers/pollController.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Protected routes using requireAuth() for authentication

// Create Poll
router.post('/', requireAuth(), createPoll);

// Update Poll
router.put('/:id', requireAuth(), updatePoll);

// Delete Poll
router.delete('/:id', requireAuth(), deletePoll);

// Approve Poll
router.patch('/:id/approve', requireAuth(), changePollStatus);

// Vote on Poll Option
router.post('/:id/vote', requireAuth(), voteOnPollOption);

// Like Poll
router.post('/:id/like', requireAuth(), likePoll);

// Share Poll
router.post('/:id/share', requireAuth(), sharePoll);

// Comment on Poll
router.post('/:id/comment', requireAuth(), commentOnPoll);

// Get Comments on Poll
router.get('/:id/comments', getCommentsOnPoll);

// Get Poll by Region Id
router.get('/region/:regionId', getPollsByRegion);

// Get Poll by Region Type (State, District, City, Locality)
router.get('/regionType/:regionType', getPollsByRegionType);

// Get Poll by Id
router.get('/:id', getPollById);

// Get Featured Polls
router.get('/featured', getFeaturedPolls);

export default router;
