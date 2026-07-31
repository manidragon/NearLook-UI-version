const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/Category');

const megaBatchDelete5 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    let deletedCount = 0;

    const deleteOperations = [
      { name: 'Grouting Chemicals', parent: 'waterproof chemicals & coatings' },
      { name: 'Chemical Accessories', parent: 'waterproof chemicals & coatings' },
      { name: 'Safety Harness', parent: 'construction safety' },
      { name: 'Car Seat Belts', parent: 'pet travel' },
      { name: 'Indicator Lights', parent: 'bike spare parts' },
      { name: 'Bike Horns', parent: 'bike spare parts' },
      { name: 'Puncture Repair Kits', parent: 'safety & emergency' },
      { name: 'Frozen Vegetables', parent: 'fruits & vegetables' },
      { name: 'Organic Spices', parent: 'organic & healthy' },
      { name: 'Resistance Bands', parent: 'yoga & wellness' },
      { name: 'Captain Armbands', parent: 'football' },
      { name: 'Board Games', parent: 'toys' },
      { name: 'Educational Toys', parent: 'education & learning' },
      { name: 'Playpens', parent: 'pet furniture' },
      { name: 'Water Bottles', parent: 'small pet supplies' },
      { name: 'Sharpners', parent: 'school supplies' },
      { name: 'Sharpeners', parent: 'school supplies' },
      { name: 'Erasers', parent: 'school supplies' },
      { name: 'Craft Paper', parent: 'art & craft' },
      { name: 'Grooming Brushes', parent: 'small pet supplies' },
      { name: 'Harnesses', parent: 'small pet supplies' }
    ];

    for (const op of deleteOperations) {
      const nameRegex = new RegExp(`^${op.name}$`, 'i');
      const categories = await Category.find({ name: nameRegex, level: 3 }).populate('parentCategory');
      
      console.log(`\nProcessing '${op.name}' (Remove from ${op.parent})`);
      
      let foundMatchingParent = false;
      for (const cat of categories) {
        const parentName = cat.parentCategory ? cat.parentCategory.name.toLowerCase() : 'unknown';
        const shouldDelete = parentName.includes(op.parent.toLowerCase());
        
        if (shouldDelete) {
          console.log(`  [-] Deleting under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
          await Category.findByIdAndDelete(cat._id);
          deletedCount++;
          foundMatchingParent = true;
        } else {
          console.log(`  [+] Keeping under parent: ${cat.parentCategory ? cat.parentCategory.name : 'Unknown'} (ID: ${cat._id})`);
        }
      }
      
      if (categories.length === 0) {
        console.log(`  [!] No categories found matching name '${op.name}'`);
      } else if (!foundMatchingParent) {
        console.log(`  [!] Did not find any '${op.name}' under a parent matching '${op.parent}'`);
      }
    }

    console.log(`\nSuccessfully deleted ${deletedCount} categories in total.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

megaBatchDelete5();
