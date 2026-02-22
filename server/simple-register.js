import User from './models/User.js';
import generateToken from './utils/generateToken.js';

export const simpleRegister = async (req, res, next) => {
  try {
    console.log('Simple register started');
    console.log('Request body:', req.body);
    
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('Validation passed');

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    console.log('User does not exist, creating new user');

    // Create user
    const userData = {
      email,
      password,
      profile: {
        name: name || email.split('@')[0],
      },
    };

    console.log('User data prepared:', { ...userData, password: '[HIDDEN]' });

    const user = await User.create(userData);
    
    console.log('User created successfully');

    // Generate token
    const token = generateToken(user._id);
    
    console.log('Token generated');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        createdAt: user.createdAt,
      }
    });

    console.log('Response sent successfully');

  } catch (error) {
    console.error('Simple register error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};