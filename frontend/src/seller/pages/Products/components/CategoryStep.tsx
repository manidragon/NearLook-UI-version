import React, { useEffect, useMemo } from 'react';
import Alert from "../../../../components/CustomAlert";
import CustomLoader from "../../../../components/CustomLoader";
import { Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip } from "@mui/material";
import type { FormikProps } from 'formik';
import type { ProductFormValues } from '../types/productFormTypes';
import type { Category } from '../../../../types/categoryTypes';
import { useAppDispatch, useAppSelector } from '../../../../redux/Store';
import { getCategoriesByLevel } from '../../../../redux/Admin/CategorySlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

interface CategoryStepProps {
  formik: FormikProps<ProductFormValues>;
  categories?: Category[];
  levelOneCategories?: Category[];
  levelTwoCategories?: Category[];
  levelThreeCategories?: Category[];
  attributesLoading?: boolean;
  isCatalogProduct?: boolean;
  selectedCatalog?: any | null;
}

export const CategoryStep: React.FC<CategoryStepProps> = ({
  formik,
  categories = [],
  levelOneCategories = [],
  levelTwoCategories = [],
  levelThreeCategories = [],
  attributesLoading = false,
  isCatalogProduct = false,
  selectedCatalog = null,
}) => {
  const dispatch = useAppDispatch();
  const categoryState = useAppSelector((state: any) => state.category);
  
  // ? Load categories from Redux if not passed as props
  useEffect(() => {
    if (categoryState.categories?.length === 0) {
      dispatch(getCategoriesByLevel(1));
      dispatch(getCategoriesByLevel(2));
      dispatch(getCategoriesByLevel(3));
    }
  }, [dispatch, categoryState.categories?.length]);

  // ? Merge passed props with Redux state
  const allCategories = useMemo(() => 
    categoryState.categories?.length > 0 ? categoryState.categories : categories,
  [categoryState.categories, categories]);

  // ? Filter categories by level
  const allLevelOne = useMemo(() => 
    allCategories.filter((c: Category) => c.level === 1), 
  [allCategories]);
  
  const allLevelTwo = useMemo(() => 
    allCategories.filter((c: Category) => c.level === 2), 
  [allCategories]);
  
  const allLevelThree = useMemo(() => 
    allCategories.filter((c: Category) => c.level === 3), 
  [allCategories]);

  // ??? CRITICAL FIX: Filter Level 2 by selected Level 1 parent
  const filteredLevelTwo = useMemo(() => {
    if (!formik.values.category) return [];
    return allLevelTwo.filter((cat: Category) => {
      const parent = cat.parentCategory;
      if (typeof parent === 'string') return parent === formik.values.category;
      if (parent && typeof parent === 'object' && '_id' in parent) return (parent as any)._id === formik.values.category;
      return false;
    });
  }, [allLevelTwo, formik.values.category]);

  // ??? SAFE: Filter Level 3 by selected Level 2 parent
  const filteredLevelThree = useMemo(() => {
    if (!formik.values.category2) return [];
    return allLevelThree.filter((cat: Category) => {
      const parent = cat.parentCategory;
      if (typeof parent === 'string') return parent === formik.values.category2;
      if (parent && typeof parent === 'object' && '_id' in parent) return (parent as any)._id === formik.values.category2;
      return false;
    });
  }, [allLevelThree, formik.values.category2]);

  const isCatalogWithCategories = isCatalogProduct && selectedCatalog?.category;

  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return '';
    const cat = allCategories.find((c: Category) => c._id === categoryId);
    return cat?.name || '';
  };

  if (isCatalogWithCategories) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="success" variant="outlined" icon={<CheckCircleIcon />}>
            <Typography variant="body1" fontWeight="500">
              ? Catalog Product: "{selectedCatalog.title}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category is inherited from catalog. Click "Continue" to proceed.
            </Typography>
          </Alert>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ?? Inherited Category Path
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={getCategoryName(formik.values.category) || 'Loading...'} size="small" variant="outlined" />
              <Typography>?</Typography>
              <Chip label={getCategoryName(formik.values.category2) || 'Loading...'} size="small" variant="outlined" />
              <Typography>?</Typography>
              <Chip label={getCategoryName(formik.values.category3) || 'Loading...'} size="small" color="primary" icon={<LockIcon fontSize="small" />} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              ?? Categories cannot be changed for catalog products
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  if (isCatalogProduct && selectedCatalog && !formik.values.category3) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
            <CustomLoader size={24} />
            <Typography>Loading category information from catalog...</Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Select Product Category
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Choose the appropriate categories for your product to help customers find it easily.
        </Typography>
      </Grid>

      {/* Level 1 Category */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, height: '100%', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
          <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
            <InputLabel id="category-label">Main Category *</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formik.values.category}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue('category2', '');
                formik.setFieldValue('category3', '');
              }}
              label="Main Category *"
              sx={{ borderRadius: 2 }}
            >
              {allLevelOne.map((cat: Category) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {formik.touched.category && formik.errors.category && (
              <FormHelperText>{String(formik.errors.category)}</FormHelperText>
            )}
          </FormControl>
        </Paper>
      </Grid>

      {/* Level 2 Category */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, height: '100%', transition: 'all 0.2s', opacity: !formik.values.category ? 0.6 : 1, '&:hover': { borderColor: formik.values.category ? 'primary.main' : 'grey.200', boxShadow: formik.values.category ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' } }}>
          <FormControl fullWidth disabled={!formik.values.category} error={formik.touched.category2 && Boolean(formik.errors.category2)}>
            <InputLabel id="category2-label">Sub Category *</InputLabel>
            <Select
              labelId="category2-label"
              id="category2"
              name="category2"
              value={formik.values.category2}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue('category3', '');
              }}
              label="Sub Category *"
              sx={{ borderRadius: 2 }}
            >
              {filteredLevelTwo.map((cat: Category) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {formik.touched.category2 && formik.errors.category2 && (
              <FormHelperText>{String(formik.errors.category2)}</FormHelperText>
            )}
          </FormControl>
        </Paper>
      </Grid>

      {/* Level 3 Category */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, height: '100%', transition: 'all 0.2s', opacity: !formik.values.category2 ? 0.6 : 1, '&:hover': { borderColor: formik.values.category2 ? 'primary.main' : 'grey.200', boxShadow: formik.values.category2 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' } }}>
          <FormControl fullWidth disabled={!formik.values.category2} error={formik.touched.category3 && Boolean(formik.errors.category3)}>
            <InputLabel id="category3-label">Product Type *</InputLabel>
            <Select
              labelId="category3-label"
              id="category3"
              name="category3"
              value={formik.values.category3}
              onChange={formik.handleChange}
              label="Product Type *"
              sx={{ borderRadius: 2 }}
            >
              {filteredLevelThree.map((cat: Category) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {formik.touched.category3 && formik.errors.category3 && (
              <FormHelperText>{String(formik.errors.category3)}</FormHelperText>
            )}
          </FormControl>
        </Paper>
      </Grid>
      
      {/* Loading Indicator */}
      {attributesLoading && (
        <Grid size={{ xs: 12 }}>
          <Box className="flex items-center gap-2 text-amber-600">
            <CustomLoader size={20} />
            <Typography variant="body2">Loading product specifications...</Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};
