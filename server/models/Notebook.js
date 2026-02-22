import mongoose from 'mongoose';

const { Schema } = mongoose;

const notebookSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Notebook name is required'],
      trim: true,
      maxlength: [100, 'Notebook name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    // Nested folders support (from Code 1)
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Notebook',
      default: null,
      index: true,
    },

    color: {
      type: String,
      default: '#f5f5f5',
    },

    icon: {
      type: String,
      default: '📒',
    },

    notesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/* ===== Performance Indexes ===== */

notebookSchema.index({ user: 1, name: 1 });
notebookSchema.index({ user: 1, parent: 1 });

/* ===== Virtual relation ===== */

notebookSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'notebook',
});

const Notebook = mongoose.model('Notebook', notebookSchema);

export default Notebook;
