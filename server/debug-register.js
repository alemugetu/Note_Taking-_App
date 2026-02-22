// Ultra simple register without User model to test

export const debugRegister = async (req, res, next) => {
  try {
    console.log('=== DEBUG REGISTER START ===');
    console.log('Request body:', req.body);
    
    const { email, password, name } = req.body;
    console.log('Extracted data:', { email, password: password ? '[PROVIDED]' : '[MISSING]', name });

    // Basic validation
    if (!email || !password) {
      console.log('Validation failed');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('Validation passed');

    // Simulate successful registration without database
    const fakeUser = {
      id: 'fake-id-12345',
      email: email,
      profile: {
        name: name || email.split('@')[0],
        avatar: ''
      },
      preferences: {
        theme: 'light',
        defaultColor: '#007bff'
      },
      createdAt: new Date().toISOString()
    };

    console.log('Fake user created:', fakeUser);

    const fakeToken = 'fake-jwt-token-12345';

    console.log('About to send response');

    res.status(201).json({
      success: true,
      message: 'Debug registration successful',
      token: fakeToken,
      user: fakeUser
    });

    console.log('=== DEBUG REGISTER END ===');

  } catch (error) {
    console.error('=== DEBUG REGISTER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Don't use next() here, send response directly
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
};