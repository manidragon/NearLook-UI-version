const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const checkDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const duplicates = await Category.aggregate([
      { $match: { level: 3 } },
      { $group: { _id: "$name", count: { $sum: 1 }, docs: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`Found ${duplicates.length} category names with duplicates.`);
    if (duplicates.length > 0) {
      console.log('Top duplicates:', duplicates.slice(0, 5));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDuplicates();
