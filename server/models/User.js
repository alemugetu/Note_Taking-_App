import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
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
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// NO PRE-SAVE HOOK - We'll hash password manually in controllers

// Static method to hash password
userSchema.statics.hashPassword = function(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  try {
    return bcrypt.compareSync(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    profile: this.profile,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
