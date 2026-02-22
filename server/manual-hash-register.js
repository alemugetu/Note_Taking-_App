import SimpleUser from './simple-user-model.js';
import generateToken from './utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const manualHashRegister = async (req, res) => {
  try {
    console.log('=== MANUAL HASH REGISTER START ===');
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
    const existingUser = await SimpleUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    console.log('User does not exist, proceeding with registration');

    // MANUALLY hash password BEFORE creating user
    console.log('Hashing password manually...');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log('Password hashed successfully');

    // Create user with already hashed password
    const userData = {
      email,
      password: hashedPassword, // Already hashed!
      profile: {
        name: name || email.split('@')[0],
      },
    };

    console.log('Creating user with hashed password...');
    const user = await SimpleUser.create(userData);
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('Token generated');

    res.status(201).json({
      success: true,
      message: 'Manual hash registration successful',
      token,
      user: user.getPublicProfile()
    });

    console.log('=== MANUAL HASH REGISTER END ===');

  } catch (error) {
    console.error('=== MANUAL HASH REGISTER ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Manual hash registration failed: ' + error.message
    });
  }
};