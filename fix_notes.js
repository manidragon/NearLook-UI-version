const fs = require('fs');

function addNote(filePath, searchString, replaceString) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString) && !content.includes('Supported: JPEG')) {
        content = content.replace(searchString, replaceString);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

// 1. ElectronicCategoryForm
addNote('frontend/src/admin/pages/HomePage/ElectronicCategoryForm.tsx',
    'Category Image *',
    'Category Image * <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 3MB)</span>');

// 2. UpdateHomeCategoryForm
addNote('frontend/src/admin/pages/HomePage/UpdateHomeCategoryForm.tsx',
    'Banner Image *',
    'Banner Image * <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 3MB)</span>');

// 3. UpdateCategoryForm
addNote('frontend/src/admin/components/CategoryManagement/UpdateCategoryForm.tsx',
    'Category Image (Optional)',
    'Category Image (Optional) <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 3MB)</span>');

// 4. CreateCategoryForm
addNote('frontend/src/admin/components/CategoryManagement/CreateCategoryForm.tsx',
    'Category Image (Optional)',
    'Category Image (Optional) <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 3MB)</span>');

// 5. SupaviewModal
addNote('frontend/src/customer/components/Review/SupaviewModal.tsx',
    '<div className=\"supaview__images\">',
    '<p style={{ textAlign: \'center\', fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>\n                                            Supported: JPEG, JPG, PNG, WebP (Max: 3MB)\n                                        </p>\n                                        <div className=\"supaview__images\">');

// 6. WriteReview
addNote('frontend/src/customer/pages/Review/WriteReview.tsx',
    '<label htmlFor=\"file-input\">',
    '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n            <label htmlFor=\"file-input\">');

// 7. SellerReviewForm
addNote('frontend/src/customer/pages/Review/SellerReviewForm.tsx',
    '<label htmlFor=\"file-input\">',
    '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n            <label htmlFor=\"file-input\">');

// 8. ReviewForm
addNote('frontend/src/customer/pages/Review/ReviewForm.tsx',
    '<label htmlFor=\"file-input\">',
    '<p style={{ fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'8px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n                <label htmlFor=\"file-input\">');

// 9. UpdateProductForm
addNote('frontend/src/seller/pages/Products/UpdateProductForm.tsx',
    '</Typography>\n            <div className=\"flex flex-wrap gap-4\">',
    '</Typography>\n            <Typography variant=\"caption\" color=\"text.secondary\" sx={{ display: \'block\', mb: 2 }}>\n              Supported formats: JPEG, JPG, PNG, WebP (Max size: 3MB)\n            </Typography>\n            <div className=\"flex flex-wrap gap-4\">');

// 10. VariantsSection
addNote('frontend/src/seller/pages/Products/components/VariantsSection.tsx',
    '<Typography variant=\"subtitle2\" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images\n                      </Typography>',
    '<Typography variant=\"subtitle2\" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max size: 3MB)</span>\n                      </Typography>');

console.log('Done!');
