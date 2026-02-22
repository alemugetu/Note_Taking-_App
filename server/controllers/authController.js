import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler('User already exists with this email', 400));
    }

    // Hash password manually BEFORE creating user
    const hashedPassword = User.hashPassword(password);

    // Create user with hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      profile: {
        name: name || email.split('@')[0],
      },
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check password
    const isPasswordMatch = user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme, defaultColor } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Update fields
    if (name !== undefined) user.profile.name = name;
    if (avatar !== undefined) user.profile.avatar = avatar;
    if (theme !== undefined) user.preferences.theme = theme;
    if (defaultColor !== undefined) user.preferences.defaultColor = defaultColor;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new ErrorHandler('Please provide current and new password', 400)
      );
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Verify current password
    const isPasswordMatch = user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return next(new ErrorHandler('Current password is incorrect', 401));
    }

    // Hash new password manually
    const hashedPassword = User.hashPassword(newPassword);
    
    // Update password directly (no pre-save hook)
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
