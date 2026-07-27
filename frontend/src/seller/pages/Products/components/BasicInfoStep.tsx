// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Products\components\BasicInfoStep.tsx
import React, { useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Alert,
  Chip,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { FastTextField as TextField } from './FastTextField';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import StyleIcon from '@mui/icons-material/Style';
import type { FormikProps } from 'formik';
import type {
  ProductFormValues,
  CatalogSearchState,
  CategoryAttribute
} from '../types/productFormTypes';
import type { Category } from '../../../../types/categoryTypes';
import { useAppSelector } from '../../../../redux/Store';
import { Lock } from '@mui/icons-material';

// ✅ UPDATED: Props interface to match AddProductForm.tsx usage
interface BasicInfoStepProps {
  formik: FormikProps<ProductFormValues>;
  catalogSearch: CatalogSearchState;
  selectedCatalog: any | null;

  // ✅ NEW: Catalog mode flags (passed directly from AddProductForm)
  isCatalogProduct?: boolean;  // true = listing on shared catalog
  isOwner?: boolean;           // true = current seller created this catalog

  // ✅ Category props for display (passed from AddProductForm)
  categories?: Category[];
  levelOneCategories?: Category[];
  levelTwoCategories?: Category[];
  levelThreeCategories?: Category[];
}

// ✅ FIX: Component definition FIRST, hooks INSIDE
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formik,
  catalogSearch,
  selectedCatalog,
  // ✅ Use direct props with defaults
  isCatalogProduct = false,
  isOwner = false,
  categories = [],
  levelOneCategories = [],
  levelTwoCategories = [],
  levelThreeCategories = [],
}) => {
  // ✅ FIX: ALL hooks must be called INSIDE component function, at top level

  // ✅ Get category attributes from Redux state
  const attributeState = useAppSelector((state: any) => state.categoryAttribute);

  // ✅ Determine which fields are editable based on direct props
  const isCatalogMode = isCatalogProduct && selectedCatalog;
  const canEditSharedFields = !isCatalogMode || isOwner;  // ✅ Only owners edit shared fields

  // ✅ Fields that are ALWAYS editable (even for catalog products)
  const ALWAYS_EDITABLE = ['variants']; // Price/stock per variant

  // ✅ Fields that are read-only for non-owner catalog products
  const READ_ONLY_FIELDS = isCatalogMode && !isOwner
    ? ['title', 'description', 'images', 'category', 'category2', 'category3', 'highlights']
    : [];

  // ✅ Helper to check if a field is disabled
  const isFieldDisabled = (fieldName: string) => {
    return READ_ONLY_FIELDS.includes(fieldName);
  };

  // ✅ Helper to get category name by ID (for display)
  const getCategoryName = (categoryId: string | undefined, categoryList: Category[]): string => {
    if (!categoryId) return '';
    const cat = categoryList.find((c: Category) => c._id === categoryId);
    return cat?.name || '';
  };

  // ✅✅✅ CRITICAL FIX: Safe value helper for MUI Select
  // Returns the category ID only if it exists in the available options, otherwise returns empty string
  const getSafeSelectValue = (categoryId: string | undefined, availableCategories: Category[]): string => {
    if (!categoryId) return '';
    // ✅ Only return the ID if it exists in the dropdown options
    if (availableCategories.some(cat => cat._id === categoryId)) {
      return categoryId;
    }
    // ✅ If not found, return empty string to avoid MUI "out-of-range" error
    // The category will still display in the read-only summary below
    return '';
  };

  // ✅ Filter: Only show attributes where displayInHighlights=true AND isVariantField=false
  const highlightAttributes = useMemo(() => {
    const attrs = (attributeState.attributes || [])
      .filter((attr: CategoryAttribute) =>
        attr.displayInHighlights && !attr.isVariantField && attr.isActive
      )
      .sort((a: CategoryAttribute, b: CategoryAttribute) => a.sortOrder - b.sortOrder);


    return attrs;
  }, [attributeState.attributes, formik.values.highlights]);

  // ✅ Helper: Render attribute field based on admin-defined type (READ-ONLY config)
  const renderAttributeField = (
    attr: CategoryAttribute,
    value: any,
    onChange: (val: any) => void,
    disabled: boolean = false
  ) => {
    const label = `${attr.label}${attr.required ? ' *' : ''}`;

    switch (attr.type) {
      case 'select': {
        const rawValue = value == null ? '' : String(value);
        const options: string[] = [...(attr.options || [])].sort((a, b) => a.localeCompare(b));

        return (
          <Autocomplete
            freeSolo
            options={options}
            value={rawValue}
            disabled={disabled}
            onChange={(_event, newValue) => {
              onChange(newValue || '');
            }}
            onInputChange={(_event, newInputValue, reason) => {
              if (reason === 'input') {
                onChange(newInputValue);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {label}
                    {disabled && (
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Lock style={{ fontSize: '14px', color: '#9e9e9e' }} />
                      </span>
                    )}
                  </Box>
                }
                placeholder={`Select or type ${attr.label}`} 
              />
            )}
          />
        );
      }
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => {
                  if (!disabled) onChange(e.target.checked);
                }}
                disabled={disabled}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {label}
                {disabled && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Lock style={{ fontSize: '14px', color: '#9e9e9e' }} />
                  </span>
                )}
              </Box>
            }
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {label}
                {disabled && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Lock style={{ fontSize: '14px', color: '#9e9e9e' }} />
                  </span>
                )}
              </Box>
            }
            value={value || ''}
            onChange={(e) => {
              if (!disabled) onChange(e.target.value);
            }}
            required={attr.required}
            placeholder={attr.placeholder}
            disabled={disabled}
          />
        );
      default: // 'text' or 'number'
        return (
          <TextField
            fullWidth
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {label}
                {disabled && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Lock style={{ fontSize: '14px', color: '#9e9e9e' }} />
                  </span>
                )}
              </Box>
            }
            type={attr.type === 'number' ? 'number' : 'text'}
            value={value ?? ''}
            onChange={(e) => {
              if (!disabled) {
                const newValue = attr.type === 'number'
                  ? (e.target.value === '' ? '' : Number(e.target.value))
                  : e.target.value;
                onChange(newValue);
              }
            }}
            required={attr.required}
            placeholder={attr.placeholder}
            disabled={disabled}
            inputProps={attr.type === 'number' ? { min: attr.min, max: attr.max, step: attr.step } : {}}
          />
        );
    }
  };

  return (
    <Grid container spacing={2}>

      {/* Basic Info Header */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3, 
          background: isCatalogMode ? 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)' : 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: isCatalogMode ? 'warning.200' : 'secondary.100',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <Typography variant="h5" fontWeight="700" color={isCatalogMode ? 'warning.900' : 'secondary.main'} gutterBottom>
            📝 {isCatalogMode ? 'Shared Catalog Information' : 'Basic Product Information'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isCatalogMode
              ? isOwner
                ? "✅ You created this catalog. You can edit title, description, images, and variants. Other sellers can list offers on your catalog."
                : "🔒 Listing on shared catalog. Title, description, and images are managed by the catalog owner. You can only set your price and stock."
              : "Enter the core details for your independent product. You will be the owner and can edit all fields."}
          </Typography>
        </Paper>
      </Grid>

      {/* Catalog Info Banner */}
      {isCatalogMode && selectedCatalog && (
        <Grid size={{ xs: 12 }}>
          <Alert
            severity={isOwner ? "success" : "info"}
            variant="outlined"
            sx={{ mb: 2, borderRadius: 2 }}
            icon={isOwner ? <EditIcon /> : <LockIcon />}
          >
            <Typography variant="body2" fontWeight="500">
              {isOwner ? "👑 You Own This Catalog" : "📦 Shared Product"}: "{selectedCatalog.title}"
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {isOwner
                ? "Changes to title, description, or images will update the master catalog for all sellers."
                : "Contact the catalog owner or admin to request changes to shared product details."}
            </Typography>
          </Alert>
        </Grid>
      )}

      {/* Title & Description Group */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
          <Typography variant="subtitle1" fontWeight="600" mb={3}>Core Details</Typography>
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Product Title *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={
                  formik.touched.title && formik.errors.title
                    ? String(formik.errors.title)
                    : isCatalogMode && !isOwner
                      ? "ℹ️ Inherited from catalog (read-only)"
                      : isCatalogMode && isOwner
                        ? "ℹ️ Editable: Changes affect all sellers"
                        : ""
                }
                required={!isCatalogMode}
                disabled={isFieldDisabled('title')}
                InputProps={{
                  endAdornment: isCatalogMode && !isOwner && (
                    <Chip label="Read-Only" size="small" color="info" icon={<LockIcon fontSize="small" />} />
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    '&:hover:not(.Mui-disabled)': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                    '&.Mui-focused': { boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)' }
                  }
                }}
              />
            </Grid>

            {/* Description Field */}
            <Grid size={{ xs: 12 }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                id="description"
                name="description"
                label="Description *"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  formik.touched.description && formik.errors.description
                    ? String(formik.errors.description)
                    : isCatalogMode && !isOwner
                      ? "ℹ️ Inherited from catalog (read-only)"
                      : isCatalogMode && isOwner
                        ? "ℹ️ Editable: Changes affect all sellers"
                        : ""
                }
                required={!isCatalogMode}
                disabled={isFieldDisabled('description')}
                InputProps={{
                  endAdornment: isCatalogMode && !isOwner && (
                    <Chip label="Read-Only" size="small" color="info" icon={<LockIcon fontSize="small" />} sx={{ position: 'absolute', top: 12, right: 12 }} />
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    '&:hover:not(.Mui-disabled)': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                    '&.Mui-focused': { boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* ✅✅✅ Category Fields - Always read-only after selection */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📁 Product Category
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
          <Grid container spacing={2}>
            {/* Level 1 - Main Category */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled>
                <InputLabel>Main Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  // ✅ Use safe value helper to prevent MUI "out-of-range" error
                  value={getSafeSelectValue(formik.values.category, levelOneCategories)}
                  label="Main Category"
                >
                  <MenuItem value="">
                    <em>Select Main Category</em>
                  </MenuItem>
                  {levelOneCategories.map((cat: Category) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Level 2 - Sub-Category */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled>
                <InputLabel>Sub-Category</InputLabel>
               <Select
                  labelId="category2-label"
                  id="category2"
                  name="category2"
                  value={getSafeSelectValue(formik.values.category2, levelTwoCategories)}
                  label="Sub-Category"
                  disabled
                >
                  <MenuItem value="">
                    <em>Select Sub-Category</em>
                  </MenuItem>
                  {levelTwoCategories.map((cat: Category) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Level 3 - Product Type */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled>
                <InputLabel>Product Type</InputLabel>
                <Select
                  labelId="category3-label"
                  id="category3"
                  name="category3"
                  value={getSafeSelectValue(formik.values.category3, levelThreeCategories)}
                  label="Product Type"
                  disabled
                >
                  <MenuItem value="">
                    <em>Select Product Type</em>
                  </MenuItem>
                  {levelThreeCategories.map((cat: Category) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ✅ Category Path Display - Shows actual category names even if ID not in dropdown */}
          {formik.values.category3 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.dark">
                <strong>Selected Path:</strong>{' '}
                {getCategoryName(formik.values.category, categories) || formik.values.category} →{' '}
                {getCategoryName(formik.values.category2, categories) || formik.values.category2} →{' '}
                <strong>
                  {getCategoryName(formik.values.category3, categories) || formik.values.category3}
                </strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                ℹ️ Categories cannot be changed after product creation
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* ✅ Highlights Section - Admin-configured displayInHighlights attributes */}
     {/* ✅ Highlights Section - Admin-configured displayInHighlights attributes */}
{highlightAttributes.length > 0 && (
  <Grid size={{ xs: 12 }}>
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        ✨ Product Highlights (Admin-Configured)
      </Typography>
      {isCatalogMode && !isOwner && (
        <Chip label="Read-Only" size="small" color="info" variant="outlined" />
      )}
    </Box>
    
    <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
      <Grid container spacing={2}>
        {highlightAttributes
          // ✅ Filter: For non-owners of catalog products, only show highlights with values
          .filter((attr: CategoryAttribute) => {
            const highlightValue = formik.values.highlights?.[attr.name];
            // ✅ If catalog product AND non-owner: only show if value exists and is non-empty
            if (isCatalogMode && !isOwner) {
              return highlightValue !== undefined && 
                     highlightValue !== null && 
                     String(highlightValue).trim() !== '';
            }
            // ✅ For owners or independent products: show all configured highlights
            return true;
          })
          .map((attr: CategoryAttribute) => {
            const highlightValue = formik.values.highlights?.[attr.name];
            const isReadOnly = isCatalogMode && !isOwner;
            
            return (
              <Grid key={attr._id} size={{ xs: 12, sm: 6 }}>
                {renderAttributeField(
                  attr,
                  highlightValue,
                  (value: any) => {
                    if (!isReadOnly) {
                      formik.setFieldValue(`highlights.${attr.name}`, value);
                    }
                  },
                  isReadOnly
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Type: {attr.type} | Required: {attr.required ? 'Yes' : 'No'}
                  {isReadOnly && ' 🔒 Read-Only (from catalog)'}
                </Typography>
              </Grid>
            );
          })}
      </Grid>
      
      {/* ✅ Show message if no highlights to display for non-owner */}
      {isCatalogMode && !isOwner && 
       highlightAttributes.filter((attr: CategoryAttribute) => {
         const highlightValue = formik.values.highlights?.[attr.name];
         return highlightValue !== undefined && 
                highlightValue !== null && 
                String(highlightValue).trim() !== '';
       }).length === 0 && (
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          <Typography variant="body2">
            ℹ️ No highlight attributes are pre-filled for this catalog product. 
            Contact the catalog owner to add shared attributes.
          </Typography>
        </Alert>
      )}
    </Paper>
  </Grid>
)}

{/* ✅ Show loading state while attributes fetch */}
{highlightAttributes.length === 0 && attributeState.attributes?.length === 0 && isCatalogMode && (
  <Grid size={{ xs: 12 }}>
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        ✨ Product Highlights (Admin-Configured)
      </Typography>
      <CircularProgress size={16} />
    </Box>
    <Alert severity="info" variant="outlined">
      <Typography variant="body2">Loading highlight attributes...</Typography>
    </Alert>
  </Grid>
)}

{/* ✅ No highlight attributes configured */}
{highlightAttributes.length === 0 && attributeState.attributes?.length > 0 && (
  <Grid size={{ xs: 12 }}>
    <Divider sx={{ my: 2 }} />
    <Alert severity="info" variant="outlined">
      <Typography variant="body2">
        ℹ️ No highlight attributes configured for this category
      </Typography>
    </Alert>
  </Grid>
)}

      {/* Color Variants Section Header */}
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyleIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Product Variants & Pricing
          </Typography>
          {isCatalogMode && (
            <Chip
              label={isOwner ? "Owner: Full Edit" : "Seller: Price/Stock Only"}
              size="small"
              color={isOwner ? "success" : "info"}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isCatalogMode && !isOwner
            ? "Add your price and stock for each variant. Colors and images are inherited from the catalog."
            : isCatalogMode && isOwner
              ? "Edit variant details, prices, and stock. Changes to images affect the master catalog."
              : "Add product variants with images, specifications, prices, and stock."}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default BasicInfoStep;
