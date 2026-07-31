const fs = require('fs');
let c = fs.readFileSync('frontend/src/customer/pages/Review/ReviewForm.tsx','utf8');
c = c.replace('<label className="relative" htmlFor="fileInput">','<p style={{ width: \'100%\', fontSize: \'12px\', color: \'#6b7280\', marginBottom: \'4px\', marginTop: \'0\' }}>Supported: JPEG, JPG, PNG, WebP (Max: 3MB)</p>\n                <label className="relative" htmlFor="fileInput">');
fs.writeFileSync('frontend/src/customer/pages/Review/ReviewForm.tsx', c, 'utf8');

c = fs.readFileSync('frontend/src/seller/pages/Products/UpdateProductForm.tsx', 'utf8');
c = c.replace('</Typography>\n            <div className="flex flex-wrap gap-4">', '</Typography>\n            <Typography variant="caption" color="text.secondary" sx={{ display: \'block\', mb: 2 }}>\n              Supported formats: JPEG, JPG, PNG, WebP (Max size: 3MB)\n            </Typography>\n            <div className="flex flex-wrap gap-4">');
fs.writeFileSync('frontend/src/seller/pages/Products/UpdateProductForm.tsx', c, 'utf8');

c = fs.readFileSync('frontend/src/seller/pages/Products/components/VariantsSection.tsx', 'utf8');
c = c.replace('<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images\n                      </Typography>', '<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>\n                        Images <span style={{ fontWeight: \'normal\', color: \'#6b7280\', fontSize: \'0.8rem\' }}>(Supported: JPEG, JPG, PNG, WebP. Max size: 3MB)</span>\n                      </Typography>');
fs.writeFileSync('frontend/src/seller/pages/Products/components/VariantsSection.tsx', c, 'utf8');
