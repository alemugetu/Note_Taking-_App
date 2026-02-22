// Test User model specifically

import User from './models/User.js';

export const testUserModel = async (req, res) => {
  try {
    console.log('=== USER MODEL TEST START ===');
    
    const { email, password, name } = req.body;
    
    console.log('Input data:', { email, password: password ? '[PROVIDED]' : '[MISSING]', name });

    // Test 1: Check if user exists
    console.log('Step 1: Checking if user exists...');
    const existingUser = await User.findOne({ email });
    console.log('Existing user check result:', existingUser ? 'USER EXISTS' : 'USER NOT FOUND');
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Test 2: Create user data object
    console.log('Step 2: Creating user data object...');
    const userData = {
      email,
      password,
      profile: {
        name: name || email.split('@')[0],
      },
    };
    console.log('User data object created:', { ...userData, password: '[HIDDEN]' });

    // Test 3: Try to create user
    console.log('Step 3: Attempting to create user in database...');
    const user = await User.create(userData);
    console.log('User created successfully:', user ? 'SUCCESS' : 'FAILED');

    // Test 4: Get public profile
    console.log('Step 4: Getting public profile...');
    const publicProfile = user.getPublicProfile();
    console.log('Public profile created:', publicProfile);

    res.status(201).json({
      success: true,
      message: 'User model test successful',
      user: publicProfile
    });

    console.log('=== USER MODEL TEST END ===');

  } catch (error) {
    console.error('=== USER MODEL TEST ERROR ===');
    console.error('Error occurred at step:', error.step || 'unknown');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'User model test failed: ' + error.message,
      errorName: error.name,
      step: error.step || 'unknown'
    });
  }
};