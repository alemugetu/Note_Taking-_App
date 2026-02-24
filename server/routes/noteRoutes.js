import express from 'express';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  removeAttachment,
  getSharedNote,
  restoreNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/shared/:id', getSharedNote);

// All subsequent routes are protected
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.put('/:id/restore', restoreNote);

router.route('/:id/attachments/:publicId')
  .delete(removeAttachment);

export default router;
