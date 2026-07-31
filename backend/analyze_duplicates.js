const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Category = require('./src/models/Category');

const analyzeDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Group all categories by name
    const grouped = await Category.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          docs: { $push: { id: "$_id", parent: "$parentCategory", level: "$level" } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      }
    ]);
    
    let report = '# Remaining Duplicate Categories\n\n';
    let totalDuplicates = 0;
    
    for (const group of grouped) {
      report += `## ${group._id} (${group.count} occurrences)\n`;
      totalDuplicates++;
      
      for (const doc of group.docs) {
        let parentPath = 'Unknown / Top Level';
        if (doc.parent) {
          const parent = await Category.findById(doc.parent);
          if (parent) {
            parentPath = parent.name;
            if (parent.parentCategory) {
              const grandparent = await Category.findById(parent.parentCategory);
              if (grandparent) {
                parentPath = `${grandparent.name} > ${parentPath}`;
              }
            }
          }
        }
        report += `- Level ${doc.level || '?'} under: **${parentPath}** (ID: ${doc.id})\n`;
      }
      report += '\n';
    }
    
    if (totalDuplicates === 0) {
      report += "Great news! No duplicate category names were found.\n";
    }
    
    fs.writeFileSync('remaining_duplicates.md', report);
    console.log(`Found ${totalDuplicates} distinct names with duplicates.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

analyzeDuplicates();
