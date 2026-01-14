const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('./models/models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notetakingapp';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin user already exists
    const adminExists = await User.findOne({ username: 'lezama24' });
    
    if (adminExists) {
      console.log('✓ Admin user already exists');
    } else {
      // Hash the admin password
      const passwordHash = await bcrypt.hash('Lezama2402!', 10);
      
      // Create admin user
      await User.create({
        id: 'admin-001',
        username: 'lezama24',
        passwordHash: passwordHash
      });
      
      console.log('✓ Admin user created: lezama24');
    }

    // Show all registered users
    const users = await User.find({}, 'username');
    console.log(`\n✓ Total registered users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username}`);
    });

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
