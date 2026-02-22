import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGODB_URI.replace(/<db_password>/, '****'));

const testConnection = async () => {
  try {
    console.log('\n⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('📊 Host:', conn.connection.host);
    console.log('📁 Database:', conn.connection.name);
    console.log('🔌 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('Error:', error.message);
    console.log('\n💡 Common Issues:');
    console.log('   1. Replace <db_password> with your actual password in .env');
    console.log('   2. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Verify database user credentials');
    console.log('   4. Check network connectivity');
    process.exit(1);
  }
};

testConnection();
