import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ErrorHandler from '../utils/errorHandler.js';
import { sendMail } from '../utils/mailer.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    console.log(`[AUTH] Register attempt for: ${email}`);

    // Validation
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[AUTH] User already exists: ${email}`);
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

    console.log(`[AUTH] User created: ${user._id}`);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);

    // Validation
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check password
    const isPasswordMatch = user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log(`[AUTH] Password mismatch for: ${email}`);
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Generate token
    const token = generateToken(user._id);
    console.log(`[AUTH] Login successful for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
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

// @desc    Forgot password - generate reset token and send email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorHandler('Please provide your email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with the same message (anti-enumeration)
    const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({ success: true, message: genericMessage });
    }

    // Generate raw token (sent in email)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash token (stored in DB) — never store raw token
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Store hashed token and expiry (30 minutes)
    user.resetToken = hashedToken;
    user.resetTokenExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    // Build reset URL using raw token (goes in the email)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    const subject = 'Password Reset Request - Note Taking App';
    const text = `You requested a password reset.\n\nClick the link below to reset your password (valid for 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email. Your password will remain unchanged.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your Note Taking App account.</p>
        <p>Click the button below to reset your password. This link is valid for <strong>30 minutes</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Reset Password</a>
        <p style="color:#666;font-size:14px;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#999;font-size:12px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      </div>`;

    const sent = await sendMail(user.email, subject, text, html);

    if (!sent) {
      // Email not configured — log the link in dev so developers can still test
      console.log(`[PASSWORD RESET] Email not sent (SMTP not configured). Reset link for ${user.email}: ${resetUrl}`);
    }

    res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return next(new ErrorHandler('Reset token is required', 400));
    }

    if (!password) {
      return next(new ErrorHandler('Please provide a new password', 400));
    }

    if (password.length < 6) {
      return next(new ErrorHandler('Password must be at least 6 characters long', 400));
    }

    // Hash the raw token from the URL to match what is stored in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching hashed token that has not yet expired
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    }).select('+resetToken +resetTokenExpire');

    if (!user) {
      return next(new ErrorHandler('Password reset token is invalid or has expired', 400));
    }

    // Hash the new password using the existing static method (consistent with the rest of the app)
    const hashedPassword = User.hashPassword(password);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    console.log(`[AUTH] Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    next(error);
  }
};
