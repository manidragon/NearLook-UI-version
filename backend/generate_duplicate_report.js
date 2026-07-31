const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Category = require('./src/models/Category');

const generateDuplicateReport = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find all Level 3 categories and populate parent
    const level3Categories = await Category.find({ level: 3 }).populate('parentCategory', 'name').lean();
    
    // Group by name
    const grouped = {};
    for (const cat of level3Categories) {
      if (!grouped[cat.name]) {
        grouped[cat.name] = [];
      }
      grouped[cat.name].push(cat.parentCategory ? cat.parentCategory.name : 'No Parent');
    }
    
    // Filter to only those with duplicates and sort by count descending
    const duplicates = Object.entries(grouped)
      .filter(([name, parents]) => parents.length > 1)
      .sort((a, b) => b[1].length - a[1].length);
      
    // Generate Markdown
    let md = `# Duplicate Level 3 Categories\n\n`;
    md += `Found **${duplicates.length}** category names that appear multiple times under different parents.\n\n`;
    
    md += `| Category Name | Count | Parent Categories |\n`;
    md += `| --- | --- | --- |\n`;
    
    for (const [name, parents] of duplicates) {
      md += `| **${name}** | ${parents.length} | ${parents.join(', ')} |\n`;
    }
    
    fs.writeFileSync('C:\\Users\\IND\\.gemini\\antigravity-ide\\brain\\b283fb47-7a50-4e17-a0cf-4785d8f29e56\\duplicate_categories.md', md);
    console.log('Artifact generated successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

generateDuplicateReport();
