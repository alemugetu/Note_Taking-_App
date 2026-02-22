import mongoose from 'mongoose';

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      minlength: [1, 'Tag name cannot be empty'],
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },

    color: {
      type: String,
      default: '#6c757d',
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/* ===== Smart uniqueness per user ===== */
tagSchema.index({ user: 1, name: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
