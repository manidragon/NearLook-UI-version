import React from 'react';
import Alert from "../../../../components/CustomAlert";
import { Grid, Paper, Typography, Box, Chip, Divider } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StoreIcon from '@mui/icons-material/Store';
import type { FormikProps } from 'formik';
import type { ProductFormValues, ProductVariantForm, ProductSubVariantForm } from '../types/productFormTypes';
import type { Category } from '../../../../types/categoryTypes';

interface ReviewStepProps {
  formik: FormikProps<ProductFormValues>;
  categories?: Category[];
  isCatalogProduct?: boolean;
  isOwner?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formik,
  categories = [],
  isCatalogProduct = false,
  isOwner = false,
}) => {

  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return 'N/A';
    const cat = categories.find((c: Category) => c._id === categoryId);
    return cat?.name || categoryId;
  };

  const getOfferSummary = (subVar: ProductSubVariantForm) => {
    const firstOffer = subVar.offers?.[0];
    return {
      mrpPrice: firstOffer?.mrpPrice || '-',
      sellingPrice: firstOffer?.sellingPrice || '-',
      stock: firstOffer?.stock || '0',
      sku: firstOffer?.sku || '-'
    };
  };

  const categoryPath = React.useMemo(() => {
    const level1 = getCategoryName(formik.values.category);
    const level2 = getCategoryName(formik.values.category2);
    const level3 = getCategoryName(formik.values.category3);

    if (level1 === 'N/A' && level2 === 'N/A' && level3 === 'N/A') {
      return 'No category selected';
    }

    const parts = [level1, level2, level3].filter(p => p !== 'N/A');
    return parts.join(' → ');
  }, [formik.values.category, formik.values.category2, formik.values.category3, categories]);

  const formatPrice = (value: string | number | undefined): string => {
    if (!value) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'N/A' : `₹${num.toLocaleString()}`;
  };

  return (
    <Grid container spacing={2}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3, 
          background: isCatalogProduct
            ? (isOwner ? 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)')
            : 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: isCatalogProduct
            ? (isOwner ? 'success.200' : 'warning.200')
            : 'info.200',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <Typography variant="h5" fontWeight="700" color={isCatalogProduct ? (isOwner ? 'success.main' : 'warning.main') : 'info.main'} gutterBottom>
            {isCatalogProduct ? (isOwner ? '👑' : '📦') : '✅'}
            {isCatalogProduct
              ? isOwner
                ? ' Review & Submit Catalog Product'
                : ' Review & Submit Catalog Offer'
              : ' Review & Submit Product'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isCatalogProduct
              ? isOwner
                ? "Review your catalog product details before submitting. Changes will affect all sellers."
                : "Review your offer details. Shared product info is managed by the catalog owner."
              : "Review your product details below. Ensure everything looks perfect before publishing!"}
          </Typography>
        </Paper>
      </Grid>

      {/* Catalog Badge */}
      {isCatalogProduct && (
        <Grid size={{ xs: 12 }}>
          <Chip
            label={isOwner ? "👑 Catalog Owner" : "📦 Shared Catalog Offer"}
            color={isOwner ? "success" : "warning"}
            icon={isOwner ? undefined : <StoreIcon />}
            sx={{ mb: 2 }}
          />
        </Grid>
      )}

      {/* Product Summary */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📦 Product Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Title:</Typography>
              <Typography variant="body1" fontWeight="500">
                {formik.values.title?.trim() || 'N/A'}
              </Typography>
              {isCatalogProduct && !isOwner && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  ℹ️ Inherited from catalog (read-only)
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">Description:</Typography>
              <Typography variant="body1" sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {formik.values.description?.trim() || 'N/A'}
              </Typography>
              {isCatalogProduct && !isOwner && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  ℹ️ Inherited from catalog (read-only)
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Category Summary */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📁 Category Path
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={getCategoryName(formik.values.category)}
              size="small"
              variant="outlined"
            />
            <Typography color="text.secondary">→</Typography>
            <Chip
              label={getCategoryName(formik.values.category2)}
              size="small"
              variant="outlined"
            />
            <Typography color="text.secondary">→</Typography>
            <Chip
              label={getCategoryName(formik.values.category3)}
              size="small"
              color="primary"
              variant="filled"
            />
          </Box>
        </Paper>
      </Grid>

      {/* Product Highlights Summary */}
      {!(isCatalogProduct && !isOwner) && formik.values.highlights && Object.keys(formik.values.highlights).filter(k => formik.values.highlights[k] !== undefined && formik.values.highlights[k] !== null && String(formik.values.highlights[k]).trim() !== '').length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ✨ Product Highlights
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {Object.entries(formik.values.highlights)
                .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '')
                .map(([key, value]) => (
                  <Box key={key} sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'grey.200', minWidth: '150px' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {key}
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Color Variants Summary */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              📦 {isCatalogProduct ? 'Your Offer Details' : 'Variants'} ({formik.values.variants.length})
            </Typography>
            {isCatalogProduct && !isOwner && (
              <Chip
                label="Price/Stock Editable"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>

          {formik.values.variants.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No variants added yet
            </Typography>
          ) : (
            formik.values.variants.map((colorVariant: ProductVariantForm, colorIndex: number) => (
              <Box
                key={colorIndex}
                sx={{
                  mb: 3,
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {colorVariant.color || `Variant ${colorIndex + 1}`}
                  </Typography>
                  {isCatalogProduct && !colorVariant.isFromCatalog && (
                    <Chip label="NEW VARIANT" size="small" color="success" variant="outlined" />
                  )}
                  {isCatalogProduct && colorVariant.isFromCatalog && (
                    <Chip label="CATALOG VARIANT" size="small" color="info" variant="outlined" />
                  )}
                  <Chip
                    label={`${colorVariant.images?.length || 0} Images`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${colorVariant.subVariants?.length || 0} Sub-variants`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  {colorVariant.subVariants?.map((subVar: ProductSubVariantForm, subIndex: number) => {
                    const offerSummary = getOfferSummary(subVar);
                    const isSharedReadOnly = isCatalogProduct && !isOwner && subVar.isFromCatalog;

                    return (
                      <Grid size={{ xs: 12 }} key={subIndex}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            alignItems: { xs: 'flex-start', md: 'center' },
                            border: '1px solid #e0e0e0',
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="500">
                              Variant {subIndex + 1}
                              {isSharedReadOnly && (
                                <Chip label="Shared Specs" size="small" sx={{ ml: 1, height: 20 }} />
                              )}
                            </Typography>
                            {Object.entries(subVar.specifications || {}).map(([key, val]) => (
                              <Typography key={key} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                {key}: {String(val)}
                              </Typography>
                            ))}
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            gap: 3,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            border: '1px dashed #bdbdbd',
                            minWidth: { xs: '100%', md: 'auto' }
                          }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">MRP Price</Typography>
                              <Typography variant="body2" fontWeight="500">{formatPrice(offerSummary.mrpPrice)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Selling Price</Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary">{formatPrice(offerSummary.sellingPrice)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Stock</Typography>
                              <Typography variant="body2">{offerSummary.stock}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
