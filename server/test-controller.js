// Simple test to isolate the issue

export const testRegister = async (req, res, next) => {
  try {
    console.log('Test register called');
    console.log('Request body:', req.body);
    
    res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      body: req.body
    });
  } catch (error) {
    console.error('Test error:', error);
    next(error);
  }
};