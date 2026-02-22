import Note from '../models/Note.js';
import { cloudinary } from '../config/cloudinary.js'

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res, next) => {
  try {
    const { q, tags, color, notebook, dateFrom, dateTo, pinned, sort } = req.query;

    const query = { user: req.user._id };

    if (q) {
      // use text search if available
      query.$text = { $search: q };
    }

    if (tags) {
      // expect comma-separated tag ids; require notes to contain all provided tags
      const tagIds = String(tags).split(',').filter(Boolean);
      if (tagIds.length > 0) query.tags = { $all: tagIds };
    }

    if (color) query.color = color;

    if (notebook) query.notebook = notebook;

    if (pinned !== undefined) {
      if (pinned === 'true') query.pinned = true;
      if (pinned === 'false') query.pinned = false;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    let mongoQuery = Note.find(query).populate('tags').populate('notebook');

    // If text search is used and no explicit sort, order by text score
    if (q && !sort) {
      mongoQuery = Note.find(query, { score: { $meta: 'textScore' } })
        .populate('tags')
        .populate('notebook')
        .sort({ score: { $meta: 'textScore' } });
    } else {
      // apply sort param or default to updatedAt desc
      if (sort === 'createdAsc') mongoQuery = mongoQuery.sort({ createdAt: 1 });
      else if (sort === 'createdDesc') mongoQuery = mongoQuery.sort({ createdAt: -1 });
      else if (sort === 'updatedAsc') mongoQuery = mongoQuery.sort({ updatedAt: 1 });
      else if (sort === 'updatedDesc') mongoQuery = mongoQuery.sort({ updatedAt: -1 });
      else mongoQuery = mongoQuery.sort({ updatedAt: -1 });
    }

    const notes = await mongoQuery;

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id })
      .populate('tags')
      .populate('notebook');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const note = await Note.create(req.body);
    const populatedNote = await Note.findById(note._id).populate('tags').populate('notebook');

    res.status(201).json({
      success: true,
      data: populatedNote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Normalize attachment fileType to match Note model enum:
    // allowed: ['image', 'pdf', 'document', 'other']
    // Sometimes clients send MIME types like "image/jpeg" which fails validation.
    if (Array.isArray(req.body?.attachments)) {
      req.body.attachments = req.body.attachments.map((a) => {
        if (!a || typeof a !== 'object') return a;
        const ft = a.fileType;
        if (typeof ft !== 'string') return a;
        const lower = ft.toLowerCase();

        // Already valid
        if (lower === 'image' || lower === 'pdf' || lower === 'document' || lower === 'other') {
          return { ...a, fileType: lower };
        }

        // MIME -> enum
        let mapped = 'other';
        if (lower.startsWith('image/')) mapped = 'image';
        else if (lower === 'application/pdf') mapped = 'pdf';
        else if (
          lower.includes('msword') ||
          lower.includes('officedocument') ||
          lower.includes('text/')
        ) mapped = 'document';

        return { ...a, fileType: mapped };
      });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('tags').populate('notebook');

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Attempt to delete attachments from Cloudinary (best-effort)
    try {
      const deletes = (note.attachments || []).map(async (a) => {
        const pub = a.publicId || a.public_id || a.publicid
        if (!pub) return null
        try {
          return await cloudinary.uploader.destroy(pub, { resource_type: 'auto' })
        } catch (err) {
          console.warn('Failed to delete cloudinary asset', pub, err)
          return null
        }
      })
      await Promise.all(deletes)
    } catch (err) {
      console.warn('Attachment cleanup error', err)
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove attachment from note and optionally delete from Cloudinary
// @route   DELETE /api/notes/:id/attachments/:publicId
// @access  Private
export const removeAttachment = async (req, res, next) => {
  try {
    const { id, publicId } = req.params
    const note = await Note.findOne({ _id: id, user: req.user._id })
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' })

    const idx = note.attachments.findIndex(a => a.publicId === publicId || a.public_id === publicId || (a.url && a.url.includes(publicId)))
    if (idx === -1) return res.status(404).json({ success: false, message: 'Attachment not found on note' })

    const attachment = note.attachments[idx]
    const pub = attachment.publicId || attachment.public_id || attachment.publicid

    // Try to delete asset from Cloudinary first (best-effort). Track result.
    let cloudinaryDeleted = false
    if (pub) {
      try {
        const delRes = await cloudinary.uploader.destroy(pub, { resource_type: 'auto' })
        // cloudinary returns result like { result: 'ok' } or 'not found'
        cloudinaryDeleted = !!(delRes && (delRes.result === 'ok' || delRes.result === 'deleted' || delRes === 'ok'))
      } catch (err) {
        console.warn('Cloudinary deletion failed', pub, err)
      }
    }

    // Remove from DB regardless of Cloudinary outcome to keep DB consistent.
    note.attachments.splice(idx, 1)
    await note.save()

    const populated = await Note.findById(note._id).populate('tags').populate('notebook')
    res.status(200).json({ success: true, data: populated, cloudinaryDeleted })
  } catch (err) {
    next(err)
  }
}

// @desc    Get shared note by ID (public access)
// @route   GET /api/notes/shared/:id
// @access  Public
export const getSharedNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('tags').populate('notebook');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (!note.share || !note.share.public) {
      return res.status(403).json({
        success: false,
        message: 'This note is not public',
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};
