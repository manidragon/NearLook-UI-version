const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const fixEdu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cat = await Category.findOne({ name: 'Educational Toys' }).populate('parentCategory');
    const categories = await Category.find({ name: 'Educational Toys', level: 3 }).populate('parentCategory');
    for (const c of categories) {
      if (c.parentCategory && c.parentCategory.name.toLowerCase().includes('educational & learning')) {
        await Category.findByIdAndDelete(c._id);
        console.log('Deleted Educational Toys from Educational & Learning');
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};
fixEdu();
