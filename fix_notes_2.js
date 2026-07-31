const fs = require('fs');

function addNote(filePath, searchString, replaceString) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString) && !content.includes('Supported: JPEG')) {
        content = content.replace(searchString, replaceString);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    } else if (!content.includes(searchString)) {
        console.log('Search string not found in: ' + filePath);
    }
}

addNote('frontend/src/customer/pages/Review/WriteReview.tsx', '<label htmlFor="fileInput">', '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n            <label htmlFor="fileInput">');
addNote('frontend/src/customer/pages/Review/SellerReviewForm.tsx', '<label htmlFor="fileInput">', '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n            <label htmlFor="fileInput">');
addNote('frontend/src/customer/pages/Review/ReviewForm.tsx', '<label htmlFor="fileInput">', '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n                <label htmlFor="fileInput">');

addNote('frontend/src/seller/pages/Products/UpdateProductForm.tsx', '</Typography>\n            <div className="flex flex-wrap gap-4">', '</Typography>\n            <Typography variant="caption" color="text.secondary" sx={{ display: \'block\', mb: 2 }}>\n              Supported formats: JPEG, JPG, PNG, WebP (Max size: 3MB)\n            </Typography>\n            <div className="flex flex-wrap gap-4">');
addNote('frontend/src/seller/pages/Products/components/VariantsSection.tsx', '<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images\n                      </Typography>', '<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max size: 3MB)</span>\n                      </Typography>');

console.log('Done!');
