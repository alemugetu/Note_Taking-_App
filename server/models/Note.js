import mongoose from 'mongoose';

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    filename: { type: String },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document', 'other'],
    },
    size: { type: Number, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    content: {
      type: String,
      default: '',
    },

    color: {
      type: String,
      default: '#ffffff',
      match: [/^#([0-9A-Fa-f]{6})$/, 'Invalid hex color'],
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    archived: {
      type: Boolean,
      default: false,
      index: true,
    },

    notebook: {
      type: Schema.Types.ObjectId,
      ref: 'Notebook',
      default: null,
      index: true,
    },

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],

    attachments: [attachmentSchema],

    reminder: {
      date: {
        type: Date,
        default: null,
      },
      notified: {
        type: Boolean,
        default: false,
      },
    },

    share: {
      public: { type: Boolean, default: false },
      link: { type: String, default: '' },
      access: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view',
      },
    },
  },
  { timestamps: true }
);

/* ===== Indexes for performance ===== */

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, pinned: -1 });
noteSchema.index({ user: 1, notebook: 1 });
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;
