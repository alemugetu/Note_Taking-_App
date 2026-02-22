import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const simpleUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profile: {
      name: {
        type: String,
        default: '',
      },
      avatar: {
        type: String,
        default: '',
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      defaultColor: {
        type: String,
        default: '#007bff',
      },
    },
  },
  {
    timestamps: true,
  }
);

// NO PRE-SAVE HOOK - we'll hash manually in controller

// Method to compare passwords
simpleUserSchema.methods.comparePassword = function(candidatePassword) {
  try {
    return bcrypt.compareSync(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to get public profile
simpleUserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    profile: this.profile,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

const SimpleUser = mongoose.model('SimpleUser', simpleUserSchema);

export default SimpleUser;