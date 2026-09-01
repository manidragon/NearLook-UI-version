// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Products\AddProductForm.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper, Step, StepLabel, Grid, Button, Snackbar, Alert, Box, Typography, Chip, TextField, Paper
} from '@mui/material';
import CustomLoader from '../../../components/CustomLoader';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { useProductForm } from './hooks/useProductForm';
import { useCatalogSearch } from './hooks/useCatalogSearch';
import { CatalogSearchStep } from './components/CatalogSearchStep';
import { CategoryStep } from './components/CategoryStep';
import { BasicInfoStep } from './components/BasicInfoStep';
import { VariantsSection } from './components/VariantsSection';
import { ReviewStep } from './components/ReviewStep';
import { createProduct, updateProduct, resetCreateFlag, resetUpdateFlag } from '../../../redux/Seller/sellerProductSlice';
import { fetchCategories } from '../../../redux/Admin/CategorySlice';
import type { ProductFormValues, ProductVariantPayload, ProductCreatePayload, ProductUpdatePayload, ProductVariantForm, ProductSubVariantForm, ProductOfferForm } from './types/productFormTypes';
import type { Category } from '../../../types/categoryTypes';
import { uploadToCloudinary } from '../../../util/uploadToCloudnary';
import { validateImageSize } from '../../../util/fileValidator';


import type { CategoryAttribute } from './types/productFormTypes';
import { createValidationSchema } from './validation/productValidation';
import { fetchCategoryAttributes, resetCategoryAttributes } from '../../../redux/Admin/CategoryAttributeSlice';

const AddProductForm: React.FC<{
  initialValues?: ProductFormValues;
  mode?: "add" | "edit";
  onSubmit?: (values: ProductFormValues) => void;
  onClose?: () => void;
}> = ({ initialValues, mode = "add", onSubmit, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const attributeState = useAppSelector((state: any) => state.categoryAttribute);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setOpenSnackbar] = useState(false);
  const isSubmittingRef = useRef(false);
  const [activeColorTab, setActiveColorTab] = useState(0);
  const [expandedSubVariant, setExpandedSubVariant] = useState<number | null>(0);
  const [colorHighlights, setColorHighlights] = useState<Record<number, Record<string, string>>>({});
  const fetchedCategoryRef = useRef<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");
  const isUserSubmittedRef = useRef(false);

  const categoryState = useAppSelector((state: any) => state.category);
  const sellerProduct = useAppSelector((state: any) => state.sellerProduct);

  // ✅ Fetch categories on mount (if not already loaded)
  useEffect(() => {
    if (mode === "add" && (!categoryState.categories || categoryState.categories.length === 0)) {
      dispatch(fetchCategories());
    }
  }, [mode, dispatch, categoryState.categories]);

  const getCurrentSellerFromJWT = () => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return null;

      // JWT format: header.payload.signature
      // We need the payload (second part)
      const payload = jwt.split('.')[1];

      // Decode base64url to JSON
      const decoded = JSON.parse(atob(payload));

      // Return seller details (adjust field names based on your JWT payload)
      return {
        _id: decoded._id || decoded.userId || decoded.id || decoded.sellerId,
        sellerName: decoded.sellerName,
        businessDetails: decoded.businessDetails,
        email: decoded.email,
        role: decoded.role
      };
    } catch (e) {
      console.warn('⚠️ Could not decode JWT for current seller:', e);
      return null;
    }
  };

  const currentSeller = getCurrentSellerFromJWT();

  // ✅ Filter categories by level for dropdowns
  const levelOneCategories = useMemo(() =>
    categoryState.categories?.filter((c: Category) => c.level === 1) || [],
    [categoryState.categories]);

  const levelTwoCategories = useMemo(() =>
    categoryState.categories?.filter((c: Category) => c.level === 2) || [],
    [categoryState.categories]);

  const levelThreeCategories = useMemo(() =>
    categoryState.categories?.filter((c: Category) => c.level === 3) || [],
    [categoryState.categories]);

  // ✅ Ref to prevent infinite loop when auto-filling catalog categories
  const hasProcessedCatalogRef = useRef(false);



  // ✅ Custom hook for formik - MUST be before validationSchema
  const formik = useProductForm({
    initialValues,
    mode,
    // ✅ Pass context with catalog mode for Yup validation
    context: {
      isCatalogProduct: initialValues?.catalogMode?.isCatalogProduct ?? false,
      category3: initialValues?.category3 ?? '',
    },
    onSubmit: async (values) => {
      // ✅ Guard: Only process user-initiated submits
      if (!isUserSubmittedRef.current) {
        return;
      }
      isUserSubmittedRef.current = false;

      // ✅ Guard: Only allow submission on final step
      const isFinalStep = mode === "edit" ? activeStep === 1 : activeStep === 2;
      if (!isFinalStep) {
        return;
      }

      // ✅ Guard: Prevent duplicate submissions
      if (isSubmittingRef.current) {
        return;
      }

      // ✅ Guard: Don't submit if already created/updated
      if (sellerProduct.productCreated || sellerProduct.productUpdated) {
        return;
      }

      isSubmittingRef.current = true;

      try {
        // ✅ BULK UPLOAD IMAGES BEFORE SUBMITTING
        setUploadingImage(true);
        try {
          for (let vIdx = 0; vIdx < values.variants.length; vIdx++) {
            const variant = values.variants[vIdx];
            const uploadedUrls: string[] = [];
            for (let i = 0; i < variant.images.length; i++) {
              const img = variant.images[i];
              if (img instanceof File) {
                const result = await uploadToCloudinary(img);
                if (result.success && result.url) uploadedUrls.push(result.url);
              } else {
                uploadedUrls.push(img as string); // keep existing URL
              }
            }
            variant.images = uploadedUrls; // replace Files with URLs
          }
        } catch (error) {
          console.error('❌ [Bulk Image Upload Failed]', error);
          setSnackbarMessage("Failed to upload some images. Please check your connection and try again.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setUploadingImage(false);
          isSubmittingRef.current = false;
          return;
        }
        setUploadingImage(false);

        // ✅ Transform variants to payload format (string → number for prices/stock)

        // ✅ Get variant attribute names from attributeState
        const variantAttributeNames = (attributeState.attributes || [])
          .filter((attr: CategoryAttribute) => (attr?.isVariantField || attr?.isColorVariantField) && attr?.isActive)
          .map((attr: CategoryAttribute) => attr?.name?.toLowerCase());

        const variantsPayload: ProductVariantPayload[] = values.variants.flatMap((colorVariant) => {
          return colorVariant.subVariants
            .filter((subVar) => !(subVar as any).toBeDeleted)
            .map(subVar => {
              // ✅ ONLY include offers from current seller WITH valid price/stock
              const offersPayload = subVar.offers
                .filter((offer) => {
                  if (offer.toBeDeleted) return false;
                  if (offer.sellerId !== currentSeller?._id) return false;

                  const mrpPrice = Number(offer.mrpPrice);
                  const sellingPrice = Number(offer.sellingPrice);
                  const stock = Number(offer.stock);

                  return mrpPrice > 0 && sellingPrice > 0 && stock >= 0;
                })
                .map(offer => ({
                  seller: offer.sellerId,
                  mrpPrice: Number(offer.mrpPrice),
                  sellingPrice: Number(offer.sellingPrice),
                  stock: Number(offer.stock),
                  sku: offer.sku?.trim() || undefined,
                  isReturnable: Boolean(offer.isReturnable),
                  returnTAT: String(offer.returnTAT || 'N/A'),
                  isReplaceable: Boolean(offer.isReplaceable),
                  replacementTAT: String(offer.replacementTAT || 'N/A'),
                  hasDeliveryCharge: Boolean(offer.hasDeliveryCharge),
                  deliveryChargePrice: Number(offer.deliveryChargePrice || 0),
                  freeDeliveryRadiusKM: Number(offer.freeDeliveryRadiusKM || 0),
                  isActive: offer.isActive !== false
                }));

              // ✅ Skip this sub-variant if no valid offers
              if (offersPayload.length === 0) {
                return null;
              }

              // ✅ Build specifications with ALL fields first
              const allSpecs = {
                ...(values.highlights || {}),
                ...(colorVariant.highlights || {}),
                ...(subVar.specifications || {})
              };

              // ✅✅✅ CRITICAL: Filter to ONLY variant-specific fields
              const variantSpecs: Record<string, string> = {};
              Object.entries(allSpecs).forEach(([key, value]) => {
                if (variantAttributeNames.includes(key.toLowerCase())) {
                  variantSpecs[key] = String(value);
                }
              });

              // ✅ Debug: Verify specifications filtering
              console.log('🔍 [Submit] Variant specs filtering:', {
                allSpecsKeys: Object.keys(allSpecs),
                variantAttributeNames,
                filteredSpecsKeys: Object.keys(variantSpecs),
                color: colorVariant.color
              });

              return {
                color: colorVariant.color.trim(),
                specifications: variantSpecs,  // ✅ ONLY variant-specific fields
                images: colorVariant.images as string[],
                offers: offersPayload,
                isActive: subVar.isActive !== false,
                ...(colorVariant.variantOwner && { variantOwner: colorVariant.variantOwner })
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
        });

        // ✅ Ensure at least one variant has seller's valid offers
        if (variantsPayload.length === 0) {
          throw new Error('Please add at least one variant with valid price and stock');
        }

        console.log('✅ [Submit] Valid variants payload:', {
          count: variantsPayload.length,
          variants: variantsPayload.map(v => ({
            color: v.color,
            specs: v.specifications,
            offersCount: v.offers.length,
            offers: v.offers.map(o => ({
              seller: o.seller,
              mrpPrice: o.mrpPrice,
              sellingPrice: o.sellingPrice,
              stock: o.stock
            }))
          }))
        });


        // ✅ INDEPENDENT PRODUCT: Create or Update
        const isCatalogOffer = mode === "add" && catalogSearch.selectedCatalog?._id;

        // ✅ Build product data
        const productData: ProductCreatePayload = {
          // ✅ For independent products only (catalog offers skip these)
          title: isCatalogOffer ? undefined : values.title.trim(),
          description: isCatalogOffer ? undefined : values.description.trim(),
          category: isCatalogOffer ? undefined : values.category3,

          // ✅ Required for ALL products: variants array with offers
          variants: variantsPayload,

          // ✅ NEW: If this is a catalog offer, include catalogId
          catalogId: isCatalogOffer ? catalogSearch.selectedCatalog?._id : undefined,

          // ✅ Optional metadata (only used for independent products)
          highlights: isCatalogOffer ? undefined : (values.highlights || {}),
          isActive: values.isActive !== false,
        };

        let result;

        if (mode === "edit" && initialValues?._id) {
          // ✅ Update existing product
          result = await dispatch(updateProduct({
            productId: initialValues._id,
            product: productData
          }));

          if (updateProduct.rejected.match(result)) {
            throw new Error(result.payload as string || 'Failed to update product');
          }
          if (result.payload?.success === false) {
            throw new Error(result.payload?.message || 'Failed to update product');
          }

          setSnackbarMessage('Product updated successfully!');
          setSnackbarSeverity("success");
          setOpenSnackbar(true);

        } else {
          // ✅ Create new product
          const jwt = localStorage.getItem("jwt");
          result = await dispatch(createProduct({
            request: productData,
            jwt: jwt || ""
          }));

          if (createProduct.rejected.match(result)) {
            throw new Error(result.payload as string || 'Failed to create product');
          }
          if (result.payload?.success === false) {
            throw new Error(result.payload?.message || 'Failed to create product');
          }

          setSnackbarMessage('Product created successfully!');
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
        }

        // ✅ Redirect after successful independent product operation
        setTimeout(() => {
          navigate('/seller/products');
        }, 1500);

      } catch (error: any) {
        // ✅ Extract error message from Redux thunk or plain error
        let errorMsg = 'Failed to save product';

        if (error?.payload?.errors && Array.isArray(error.payload.errors)) {
          errorMsg = error.payload.errors.join('; ');
        }
        else if (error?.payload?.message) {
          errorMsg = error.payload.message;
        }
        else if (error?.payload && typeof error.payload === 'string') {
          errorMsg = error.payload;
        }
        else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join('; ');
        }
        else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        else if (typeof error === 'string') {
          errorMsg = error;
        }
        else if (error?.message && error.message !== '[object Object]') {
          errorMsg = error.message;
        }

        console.error('🚨 Submit error:', errorMsg);

        // ✅ Show error in snackbar
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);

      } finally {
        // ✅ Always reset submitting flag
        isSubmittingRef.current = false;
      }
    },
  });

  const catalogSearch = useCatalogSearch(formik, (msg) => { setSnackbarMessage(msg); setSnackbarSeverity('error'); setOpenSnackbar(true); });

  // ✅ FIX: validationSchema AFTER catalogSearch declaration
  const validationSchema = useMemo(() => {
    return createValidationSchema(
      attributeState.attributes || [],
      catalogSearch.isCatalogProduct || false
    );
  }, [
    attributeState.attributes?.length,
    catalogSearch.isCatalogProduct,
  ]);

  // ✅ Step validation - skip title/desc validation for catalog products
  const isStepValid = useCallback((step: number) => {

    const isValidOffer = (offer: any): boolean => {
      // ✅ Must be from current seller
      if (offer?.sellerId !== currentSeller?._id) return false;

      const isValidPrice = (value: any): boolean => {
        const strValue = String(value).trim();
        if (!strValue) return false;
        const numValue = Number(strValue);
        return !isNaN(numValue) && numValue > 0;
      };

      const isValidStock = (value: any): boolean => {
        const strValue = String(value).trim();
        if (strValue === '') return false;
        const numValue = Number(strValue);
        return !isNaN(numValue) && numValue >= 0;
      };

      return isValidPrice(offer?.mrpPrice) &&
        isValidPrice(offer?.sellingPrice) &&
        isValidStock(offer?.stock);
    };

    const isCatalogMode = catalogSearch.isCatalogProduct;

    if (mode === "edit") {
      if (step === 0) {
        // ✅ For edit: require at least ONE variant with seller's valid offer
        return !!(formik.values.variants?.length > 0 &&
          formik.values.variants.some(cv =>
            cv?.color?.trim() &&
            cv?.images?.length > 0 &&
            cv?.subVariants?.some(sv =>
              sv?.offers?.some(offer => isValidOffer(offer))
            )
          ));
      }
      return true;
    }

    if (step === 0) return !!(formik.values.category && formik.values.category2 && formik.values.category3);

    if (step === 1) {
      if (isCatalogMode) {
        // ✅ Catalog mode: require at least ONE variant with seller's valid offer
        return !!(formik.values.variants?.length > 0 &&
          formik.values.variants.some(cv =>
            cv?.color?.trim() &&
            cv?.subVariants?.some(sv =>
              sv?.offers?.some(offer => isValidOffer(offer))
            )
          ));
      }
      // ✅ Independent product: require title, description, and at least one variant with offer
      return !!(formik.values.title?.trim() && formik.values.description?.trim() &&
        formik.values.variants?.length > 0 &&
        formik.values.variants.some(cv =>
          cv?.color?.trim() && cv?.images?.length > 0 &&
          cv?.subVariants?.some(sv =>
            sv?.offers?.some(offer => isValidOffer(offer))
          )
        ));
    }
    return true;
  }, [formik.values, mode, catalogSearch.isCatalogProduct]);
  // ✅ Navigation with catalog mode handling
  const handleNext = async () => {
    // Handle catalog search step
    if (mode === "add" && catalogSearch.showSearch && activeStep === 0) {
      if (catalogSearch.selectedCatalog) {
        // ✅ Catalog already selected - attributes fetched in handleSelectCatalog
        catalogSearch.handleSkipCatalogSearch();
        setActiveStep(1);  // ✅ Go to Step 1
        return;
      }
      if (catalogSearch.results.length > 0 && !catalogSearch.selectedCatalog) {
        const confirmSkip = window.confirm(
          '⚠️ You searched but didn\'t select a catalog. Create independent product instead?'
        );
        if (!confirmSkip) return;
      }
      catalogSearch.handleSkipCatalogSearch();
      return;
    }
    // Existing validation logic
    if (mode === "edit") {
      if (activeStep === 0) {
        const errors = await formik.validateForm();
        const step0Fields = ['variants'];
        const hasErrors = step0Fields.some(field => errors[field as keyof typeof errors]);
        if (!hasErrors && isStepValid(activeStep)) {
          setActiveStep((prev) => prev + 1);
        } else {
          formik.setTouched({
            variants: formik.values.variants.map(() => ({
              color: true,
              images: true,
              highlights: true,
              subVariants: [],
              isActive: false
            }))
          });
        }
      }
    } else {
      // ✅ INDEPENDENT PRODUCT FLOW
      if (activeStep === 0) {
        const errors = await formik.validateForm();
        const step0Fields = ['category', 'category2', 'category3'];
        const hasErrors = step0Fields.some(field => errors[field as keyof typeof errors]);
        if (!hasErrors && isStepValid(activeStep)) {
          // ✅ Fetch attributes for independent products only
          const categoryObj = categoryState.categories?.find(
            (cat: Category) => cat._id === formik.values.category3
          );
          const categoryIdSlug = categoryObj?._id || categoryObj?.categoryId;
          if (categoryIdSlug) {
            // ✅ Fetch and WAIT for completion
            const result = await dispatch(fetchCategoryAttributes({
              categoryId: categoryIdSlug,
              includeInactive: false
            }));
            // ✅ Type-safe check
            if (fetchCategoryAttributes.fulfilled.match(result)) {
              // ✅ ONLY increment step ONCE after fetch completes
              setActiveStep((prev) => {
                const newStep = prev + 1;
                return newStep;
              });
            } else {
              console.error('❌ Fetch failed:', fetchCategoryAttributes.rejected.match(result) ? result.error : 'Unknown');
              setSnackbarMessage('Failed to load product attributes. Please try again.');
              setSnackbarSeverity('error');
              setOpenSnackbar(true);
            }
          } else {
            // ✅ No slug found - just move to next step
            setActiveStep((prev) => prev + 1);
          }
        } else {
          console.warn('⚠️ Validation failed:', errors);
          formik.setTouched({ category: true, category2: true, category3: true });
        }
      }
      // ✅ Step 1 to Step 2
      else if (activeStep === 1) {
        const errors = await formik.validateForm();
        const isCatalogMode = catalogSearch.isCatalogProduct;
        const step1Fields = isCatalogMode ? ['variants'] : ['title', 'description', 'variants'];
        // ✅ Log variant errors in detail
        if (errors.variants && Array.isArray(errors.variants)) {
          errors.variants.forEach((variantError: any, index: number) => {
            if (variantError) {
              console.error(`❌ [Variant ${index} Errors]`, variantError);
              // ✅ Check each sub-variant
              if (variantError.subVariants && Array.isArray(variantError.subVariants)) {
                variantError.subVariants.forEach((subError: any, subIndex: number) => {
                  if (subError) {
                    console.error(`❌ [Variant ${index}, SubVariant ${subIndex}]`, subError);
                  }
                });
              }
            }
          });
        }
        const hasErrors = step1Fields.some(field => {
          const hasError = errors[field as keyof typeof errors];
          if (hasError) {
            console.log('❌ [Validation Failed] Field:', field, 'Error:', hasError);
          }
          return hasError;
        });
        if (!hasErrors && isStepValid(activeStep)) {
          setActiveStep((prev) => prev + 1);
        } else {
          console.warn('⚠️ [Validation Failed] Cannot proceed to Step 2');
          // ✅ Touch all fields to show errors
          formik.setTouched({
            title: !isCatalogMode,
            description: !isCatalogMode,
            variants: formik.values.variants.map((variant, vIdx) => ({
              color: true,
              images: !isCatalogMode,
              highlights: true,
              subVariants: variant.subVariants?.map((_, sIdx) => ({
                specifications: true,
                mrpPrice: true,
                sellingPrice: true,
                stock: true,
                sku: false,
                isActive: false,
                isFromCatalog: false,
                toBeDeleted: false,
                _id: false
              })) || [],
              isActive: false,
              isFromCatalog: false,
              _id: false,
              toBeDeleted: false
            }))
          } as any);  // ✅ Type assertion to bypass strict typing
        }
      }
    }
  };

  const handleBack = useCallback(() => {
    // ✅ Clear attributes when going back to category selection
    if (activeStep === 1) {
      dispatch(resetCategoryAttributes());  // ✅ Add this action to your slice
      // ✅ If this is a catalog product, ensure we go back to the catalog search view
      if (catalogSearch.isCatalogProduct) {
        catalogSearch.setShowSearch(true);
      }
    }
    setActiveStep((prev) => prev - 1);
  }, [activeStep, dispatch, catalogSearch]);

  const steps = mode === "edit"
    ? ["Product Details & Variants", "Review & Submit"]
    : ["Select Category", "Basic Information & Variants", "Review & Submit"];

  // ✅ Variant handlers - ALL wrapped with useCallback
  const handleAddColorVariant = useCallback((templateData?: { color?: string; specifications?: Record<string, any>; images?: string[] }) => {

    const newColorVariant: ProductVariantForm = {
      color: templateData?.color || '',  // ✅ Pre-fill color if provided
      images: templateData?.images || [],  // ✅ Pre-fill images if provided
      highlights: {},
      subVariants: [
        {
          specifications: templateData?.specifications || {},  // ✅ Pre-fill specs if provided
          offers: [
            {
              sellerId: currentSeller?._id || '',
              mrpPrice: '',
              sellingPrice: '',
              stock: '0',
              sku: '',
              isReturnable: false,
              returnTAT: "7 Days",
              isReplaceable: false,
              replacementTAT: "N/A",
              hasDeliveryCharge: false,
              deliveryChargePrice: "0",
              freeDeliveryRadiusKM: "0",
              isActive: true
            }
          ],
          isActive: true,
          isFromCatalog: false  // ✅ This is a NEW color variant
        }
      ],
      isActive: true,
      isFromCatalog: false
    };

    const newVariants = [...formik.values.variants, newColorVariant];
    formik.setFieldValue('variants', newVariants);
    setActiveColorTab(newVariants.length - 1);


  }, [formik.values.variants, formik.setFieldValue]);

  const handleRemoveColorVariant = useCallback((index: number) => {
    if (formik.values.variants.length <= 1) {
      formik.setFieldValue('variants', [{ color: '', images: [], highlights: {}, subVariants: [{ specifications: {}, mrpPrice: '', sellingPrice: '', stock: '0', isActive: true }], isActive: true }]);
      setColorHighlights({});
      setActiveColorTab(0);
      return;
    }
    const newVariants = formik.values.variants.filter((_, i) => i !== index);
    formik.setFieldValue('variants', newVariants);
    setColorHighlights(prev => {
      const reIndexed: Record<number, Record<string, string>> = {};
      Object.keys(prev).forEach(key => {
        const numKey = Number(key);
        if (numKey < index) reIndexed[numKey] = prev[numKey];
        else if (numKey > index) reIndexed[numKey - 1] = prev[numKey];
      });
      return reIndexed;
    });
    if (activeColorTab >= newVariants.length) setActiveColorTab(Math.max(0, newVariants.length - 1));
  }, [formik.values.variants, formik.setFieldValue, activeColorTab]);

  const handleColorVariantChange = useCallback(
    (colorIndex: number, field: string, value: string) => {
      const newVariants = [...formik.values.variants];

      newVariants[colorIndex] = {
        ...newVariants[colorIndex],
        [field]: value
      };

      formik.setFieldValue('variants', newVariants);
    },
    [formik.values.variants, formik.setFieldValue]
  );

  const handleAddSubVariant = useCallback((colorIndex: number, templateSpecs?: Record<string, any>) => {
    // ✅ NEW sub-variants start with offers array containing current seller's offer
    const newSubVariant = {
      // ✅ Pre-fill specs from catalog template if provided (for consistency)
      specifications: templateSpecs ? { ...templateSpecs } : {},
      offers: [
        {
          sellerId: currentSeller?._id || '',
          mrpPrice: '',
          sellingPrice: '',
          stock: '0',
          sku: '',
          isReturnable: false,
          returnTAT: '7 Days',
          isReplaceable: false,
          replacementTAT: 'N/A',
          hasDeliveryCharge: false,
          deliveryChargePrice: '0',
          freeDeliveryRadiusKM: '0',
          isActive: true
        }
      ],
      isActive: true,
      isFromCatalog: false  // ✅ This is a NEW variant, not from catalog
    };

    // ✅ Add to variants array
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants.push(newSubVariant);
    formik.setFieldValue('variants', newVariants);

    // ✅ Expand the newly added sub-variant for editing
    setExpandedSubVariant(newVariants[colorIndex].subVariants.length - 1);


  }, [formik.values.variants, formik.setFieldValue]);

  const handleRemoveSubVariant = useCallback((colorIndex: number, subVariantIndex: number) => {
    const newVariants = [...formik.values.variants];
    const subVariant = newVariants[colorIndex].subVariants[subVariantIndex];
    if (subVariant._id) {
      newVariants[colorIndex].subVariants[subVariantIndex] = { ...subVariant, toBeDeleted: true };
    } else {
      if (newVariants[colorIndex].subVariants.length <= 1) {
        setSnackbarMessage('Each color must have at least one storage variant');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return;
      }
      newVariants[colorIndex].subVariants.splice(subVariantIndex, 1);
    }
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  const handleSubVariantChange = useCallback(
    (colorIndex: number, subIndex: number, field: string, value: string | number) => {

      // ✅ Use functional update to always get latest formik state
      formik.setFieldValue('variants', (prevVariants: ProductVariantForm[]) => {
        return prevVariants.map((variant, vIdx) => {
          if (vIdx !== colorIndex) return variant;
          return {
            ...variant,
            subVariants: variant.subVariants.map((subVar, sIdx) => {
              if (sIdx !== subIndex) return subVar;
              return {
                ...subVar,
                [field]: value
              } as ProductSubVariantForm;
            })
          };
        });
      });

    },
    [formik.setFieldValue]  // ✅ Only depend on stable setFieldValue
  );

  const handleAddOffer = useCallback((colorIndex: number, subVariantIndex: number) => {
    const newOffer: ProductOfferForm = {
      sellerId: currentSeller?._id || '',
      mrpPrice: '',
      sellingPrice: '',
      stock: '0',
      sku: '',
      isReturnable: false,
      returnTAT: '7 Days',
      isReplaceable: false,
      replacementTAT: 'N/A',
      hasDeliveryCharge: false,
      deliveryChargePrice: '0',
      freeDeliveryRadiusKM: '0',
      isActive: true
    };
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants[subVariantIndex].offers.push(newOffer);
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  // ✅ Remove offer from sub-variant
  const handleRemoveOffer = useCallback((colorIndex: number, subVariantIndex: number, offerIndex: number) => {
    const newVariants = [...formik.values.variants];
    const offer = newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex];

    if (offer._id) {
      // Mark as toBeDeleted instead of removing (for existing offers)
      newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex] = {
        ...offer,
        toBeDeleted: true
      };
    } else {
      // Remove new offer that hasn't been saved
      newVariants[colorIndex].subVariants[subVariantIndex].offers.splice(offerIndex, 1);
    }
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  // ✅ Update offer field value
  const handleOfferChange = useCallback((
    colorIndex: number,
    subVariantIndex: number,
    offerIndex: number,
    field: string,
    value: string | number | boolean
  ) => {
    const newVariants = [...formik.values.variants];

    // ✅ Process value based on field type
    let processedValue: any = value;

    if (field === 'mrpPrice' || field === 'sellingPrice') {
      // Price fields: convert string to number, handle empty
      if (typeof value === 'string') {
        processedValue = value === '' ? '' : parseFloat(value);
        if (isNaN(processedValue)) processedValue = '';
      }
    }
    else if (field === 'stock') {
      // Stock field: convert string to integer, default to 0
      if (typeof value === 'string') {
        processedValue = value === '' ? 0 : parseInt(value, 10);
        if (isNaN(processedValue)) processedValue = 0;
      }
    }
    else if (field === 'isActive') {
      // Boolean field: ensure it's actually boolean
      processedValue = value === true || value === 'true' || value === 1;
    }
    // sku and other string fields: keep as-is

    // ✅ Update the offer
    newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex] = {
      ...newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex],
      [field]: processedValue
    };

    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  // ✅ FIX: Wrap with useCallback
  const handleSubVariantSpecChange = useCallback((colorIndex: number, subVariantIndex: number, attributeName: string, value: any) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants[subVariantIndex] = {
      ...newVariants[colorIndex].subVariants[subVariantIndex],
      specifications: { ...newVariants[colorIndex].subVariants[subVariantIndex].specifications, [attributeName]: value },
    };
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  // ✅ FIX: Wrap with useCallback
  const handleColorHighlightChange = useCallback((colorIndex: number, attrName: string, value: string) => {
    setColorHighlights(prev => ({
      ...prev,
      [colorIndex]: { ...prev[colorIndex], [attrName]: value }
    }));
  }, []);

  const handleColorVariantImageUpload = useCallback(
    (colorIndex: number, files: FileList | null) => {
      let validFiles = validateImageSize(files, 5, (msg) => {
        setSnackbarMessage(msg);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
      if (validFiles.length === 0) return;

      formik.setFieldValue('variants', (prevVariants: ProductVariantForm[]) => {
        const newVariants = [...prevVariants];
        const existingImages = newVariants[colorIndex]?.images || [];
        
        if (existingImages.length + validFiles.length > 7) {
          setSnackbarMessage('You can only upload a maximum of 7 images per variant. Extra images will be ignored.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);
          const remainingSlots = 7 - existingImages.length;
          validFiles = validFiles.slice(0, remainingSlots > 0 ? remainingSlots : 0);
        }

        newVariants[colorIndex] = {
          ...newVariants[colorIndex],
          images: [...existingImages, ...validFiles]
        };
        return newVariants;
      });
    },
    [formik.setFieldValue]  // ✅ Stable dependency
  );

  const handleRemoveColorVariantImage = useCallback((colorIndex: number, imageIndex: number) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].images.splice(imageIndex, 1);
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik.setFieldValue]);

  // ✅ Early fetch attributes for catalog products
  useEffect(() => {
    if (
      mode === "add" &&
      catalogSearch.isCatalogProduct &&
      catalogSearch.selectedCatalog?.category &&
      !attributeState.attributes?.length  // Only fetch if not already loaded
    ) {
      const catalogCategory = catalogSearch.selectedCatalog.category;
      const categoryIdSlug = typeof catalogCategory === 'string'
        ? catalogCategory
        : catalogCategory.categoryId || catalogCategory._id;
      if (categoryIdSlug) {
        dispatch(fetchCategoryAttributes({
          categoryId: categoryIdSlug,
          includeInactive: false
        }));
      }
    }
  }, [
    mode,
    catalogSearch.isCatalogProduct,
    catalogSearch.selectedCatalog?.category,
    attributeState.attributes?.length,
    dispatch
  ]);

  // ✅ Clear attributes when going back
  useEffect(() => {
    // Only clear if we're still on Step 0 (category selection)
    if (activeStep === 0) {
      dispatch(resetCategoryAttributes());
    }
  }, [formik.values.category3, activeStep, dispatch]);

  // ✅ Show snackbar messages only (navigation handled in button onClick)
  useEffect(() => {
    // ✅ Success: Show snackbar, reset flag, but DON'T navigate
    if (sellerProduct.productCreated && !sellerProduct.loading) {
      // Snackbar already shown in button onClick, but ensure it's visible
      if (!snackbarOpen) {
        setSnackbarMessage("🎉 Product created successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      }
      // ✅ Navigation is handled ONLY by button click - DO NOT navigate here
    }

    // ✅ Update success: Show snackbar, optionally close dialog
    if (sellerProduct.productUpdated && !sellerProduct.loading) {
      setSnackbarMessage("✅ Product updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      dispatch(resetUpdateFlag());
      if (mode === "edit" && onClose) {
        setTimeout(() => onClose(), 1000);
      }
    }

    // ✅ Error: Show snackbar, stay on form
    if (sellerProduct.error && !sellerProduct.loading) {
      let errorMsg = 'Failed to save product';
      if (typeof sellerProduct.error === 'string') {
        errorMsg = sellerProduct.error;
      } else if (sellerProduct.error?.message) {
        errorMsg = sellerProduct.error.message;
      } else if (sellerProduct.error?.data?.message) {
        errorMsg = sellerProduct.error.data.message;
      }
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      // ✅ Explicitly DO NOT navigate here - keep user on form to fix errors
    }
  }, [
    sellerProduct.productCreated,
    sellerProduct.productUpdated,
    sellerProduct.error,
    sellerProduct.loading,
    snackbarOpen,  // ✅ Add this dependency
    dispatch,
    onClose,
    mode
  ]);


  // ✅✅✅ CRITICAL: Auto-fill categories from catalog (RUNS ONCE)
  useEffect(() => {
    // ✅ Guard 1: Only run in "add" mode with catalog product selected
    if (mode !== "add" || !catalogSearch.isCatalogProduct || !catalogSearch.selectedCatalog) {
      return;
    }

    // ✅ Guard 2: Only run ONCE per catalog selection (prevents infinite loop)
    if (hasProcessedCatalogRef.current) {
      return;
    }

    const catalog = catalogSearch.selectedCatalog;

    // ✅ Handle category as ObjectId, slug string, or nested object
    let level3CategoryId: string | undefined;
    if (typeof catalog.category === 'string') {
      level3CategoryId = catalog.category;
    } else if (catalog.category?._id) {
      level3CategoryId = catalog.category._id;
    } else if (catalog.category?.categoryId) {
      level3CategoryId = catalog.category.categoryId;
    }

    // ✅ Guard 3: Only proceed if we have a valid category ID
    if (!level3CategoryId) {
      console.warn('⚠️ [Auto-fill] No valid category ID found in catalog');
      return;
    }

    // ✅ Guard 4: Wait for categories to be loaded before auto-filling
    if (!categoryState.categories || categoryState.categories.length === 0) {
      return;  // Will retry when categories are loaded (due to dependency)
    }

    // ✅ Mark as processed BEFORE setting values (prevents re-entry)
    hasProcessedCatalogRef.current = true;

    // ✅ Find the Level 3 category object
    const level3Category = categoryState.categories.find(
      (c: Category) => c._id === level3CategoryId || c.categoryId === level3CategoryId
    );

    if (!level3Category) {
      console.warn('⚠️ [Auto-fill] Level 3 category not found in loaded categories');
      // Fallback: just set the ID
      formik.setFieldValue('category3', level3CategoryId);
      setActiveStep(1);
      return;
    }

    // ✅ Set Level 3 category
    formik.setFieldValue('category3', level3Category._id);

    // ✅ Find and set Level 2 category (parent of Level 3)
    if (level3Category.parentCategory) {
      const level2CategoryId = typeof level3Category.parentCategory === 'object'
        ? level3Category.parentCategory._id
        : level3Category.parentCategory;

      const level2Category = categoryState.categories.find(
        (c: Category) => c._id === level2CategoryId
      );

      if (level2Category) {
        formik.setFieldValue('category2', level2Category._id);

        // ✅ Find and set Level 1 category (parent of Level 2)
        if (level2Category.parentCategory) {
          const level1CategoryId = typeof level2Category.parentCategory === 'object'
            ? level2Category.parentCategory._id
            : level2Category.parentCategory;

          const level1Category = categoryState.categories.find(
            (c: Category) => c._id === level1CategoryId
          );

          if (level1Category) {
            formik.setFieldValue('category', level1Category._id);
          }
        }
      }
    }

    // ✅ Auto-advance to Basic Info step (skip manual category selection)
    setActiveStep(1);

    return () => {
      // Only reset if we're unmounting or switching catalogs
      if (!catalogSearch.selectedCatalog || catalogSearch.selectedCatalog._id !== catalog._id) {
        hasProcessedCatalogRef.current = false;
      }
    };

    // ✅ STABLE dependencies only - includes categories to re-run when they load
  }, [
    mode,
    catalogSearch.isCatalogProduct,
    catalogSearch.selectedCatalog?._id,
    catalogSearch.selectedCatalog?.category,
    categoryState.categories,  // ✅ Re-run when categories load
    formik.setFieldValue,
    setActiveStep
  ]);

  // ✅ Add this ref at the top of your component (with other useRef declarations)
  const catalogPrefillExecuted = useRef(false);

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'grey.100' }}>
      {mode !== "edit" && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: { xs: 3, sm: 6 }, '& .MuiStepLabel-label': { mt: 1, fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.875rem' } } }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>
                {label}
                {activeStep === 1 && catalogSearch.isCatalogProduct && (
                  <Chip
                    label="📦 Shared Product"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ ml: 1, display: { xs: 'none', sm: 'inline-flex' } }}
                  />
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      <form onSubmit={formik.handleSubmit}
        noValidate
        onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
          if (e.key === 'Enter' && activeStep < 2) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }}
      >
        <Grid container spacing={2}>
          {/* Step 0: Catalog Search or Category Selection */}
          {activeStep === 0 && mode !== "edit" && catalogSearch.showSearch ? (
            <CatalogSearchStep
              searchQuery={catalogSearch.searchQuery}
              results={catalogSearch.results}
              isSearching={catalogSearch.isSearching}
              selectedCatalog={catalogSearch.selectedCatalog}
              onSearchQueryChange={catalogSearch.setSearchQuery}
              onSearch={catalogSearch.handleSearchCatalog}
              onSelectCatalog={catalogSearch.handleSelectCatalog}
              onPreviewCatalog={catalogSearch.setSelectedCatalog}
              onSkip={catalogSearch.handleSkipCatalogSearch}
              onNext={handleNext}
            />
          ) : activeStep === 0 && mode !== "edit" ? (
            <CategoryStep
              formik={formik}
              categories={categoryState.categories || []}
              levelOneCategories={levelOneCategories}
              levelTwoCategories={levelTwoCategories}
              levelThreeCategories={levelThreeCategories}
              isCatalogProduct={catalogSearch.isCatalogProduct}
              selectedCatalog={catalogSearch.selectedCatalog}
            />
          ) : (activeStep === 0 && mode === "edit") || (activeStep === 1 && mode !== "edit") ? (
            <BasicInfoStep
              formik={formik}
              catalogSearch={catalogSearch}
              isCatalogProduct={catalogSearch.isCatalogProduct}
              selectedCatalog={catalogSearch.selectedCatalog}
              categories={categoryState.categories || []}
              levelOneCategories={levelOneCategories}
              levelTwoCategories={levelTwoCategories}
              levelThreeCategories={levelThreeCategories}
            />
          ) : (
            <ReviewStep
              formik={formik}
              categories={categoryState.categories || []}
              isCatalogProduct={catalogSearch.isCatalogProduct}
            />
          )}
          {/* Variants Section - ALWAYS editable for price/stock */}
          {((activeStep === 0 && mode === "edit") || (activeStep === 1 && mode !== "edit")) && (
            <Grid size={{ xs: 12 }}>
              <VariantsSection
                formik={formik}
                variants={formik.values.variants}
                activeColorTab={activeColorTab}
                onAddColor={handleAddColorVariant}
                onRemoveColor={handleRemoveColorVariant}
                onColorTabChange={setActiveColorTab}
                onColorChange={(idx, val) => handleColorVariantChange(idx, 'color', val)}
                onImageUpload={handleColorVariantImageUpload}
                onRemoveImage={handleRemoveColorVariantImage}
                isCatalogProduct={catalogSearch.isCatalogProduct}
                onAddSubVariant={handleAddSubVariant}
                onRemoveSubVariant={handleRemoveSubVariant}
                onSubVariantChange={handleSubVariantChange}
                onSubVariantSpecChange={handleSubVariantSpecChange}
                // ✅ ADD THESE NEW PROPS for offers management:
                onAddOffer={handleAddOffer}
                onRemoveOffer={handleRemoveOffer}
                onOfferChange={handleOfferChange}
                // ✅ Pass current user for offer creation:
                expandedSubVariant={expandedSubVariant}
                onExpandedSubVariantChange={setExpandedSubVariant}
                colorHighlights={colorHighlights}
                onColorHighlightChange={handleColorHighlightChange}
              >
              </VariantsSection>
            </Grid>
          )}
          {/* Navigation Buttons */}
          {!(activeStep === 0 && mode !== "edit" && catalogSearch.showSearch) && (
            <Grid size={12} className="flex justify-between mt-6">
            <Button
              type="button"
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep === 2 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={sellerProduct.loading || !isStepValid(activeStep) || isSubmittingRef.current}
                // ✅✅✅ CRITICAL: Mark this as intentional user submit
                onClick={() => {
                  isUserSubmittedRef.current = true;

                  // ✅ Clear any existing navigation timer
                  if ((window as any).__navTimer) {
                    clearTimeout((window as any).__navTimer);
                    (window as any).__navTimer = null;
                  }

                  const checkAndNavigate = () => {
                    // ✅ ONLY navigate if product was created successfully AND no error
                    if (sellerProduct.productCreated && !sellerProduct.loading && !sellerProduct.error) {

                      // Show success message
                      setSnackbarMessage("🎉 Product created successfully!");
                      setSnackbarSeverity("success");
                      setOpenSnackbar(true);

                      // ✅ Reset flags AFTER navigation is triggered
                      dispatch(resetCreateFlag());

                      // ✅ Navigate with short delay
                      const navTimer = setTimeout(() => {
                        try {
                          // navigate('/products');

                          // // ✅ Fallback: force reload if navigate doesn't work
                          // setTimeout(() => {
                          //   if (!window.location.pathname.includes('/seller/products')) {
                          //     console.log('⚠️ Navigate didn\'t work, forcing redirect');
                          //     window.location.href = '/seller/products';
                          //   }
                          // }, 300);
                        } catch (navError) {
                          console.error('❌ Navigation failed:', navError);
                          // window.location.href = '/seller/products';
                        }
                      }, 100);

                      return () => clearTimeout(navTimer);
                    }
                  };

                  // ✅ Poll for productCreated status (check every 100ms for up to 3 seconds)
                  let attempts = 0;
                  const maxAttempts = 30; // 30 × 100ms = 3 seconds max wait
                  const pollInterval = setInterval(() => {
                    attempts++;

                    // ✅✅✅ CRITICAL: Check for error FIRST - if error exists, STOP and DON'T navigate
                    if (sellerProduct.error && !sellerProduct.loading) {
                      clearInterval(pollInterval);
                      console.log('❌ [NAVIGATION BLOCKED] Product creation failed with error:', sellerProduct.error);
                      // ✅ Keep user on form to fix errors - DO NOT navigate
                      return;
                    }

                    // ✅ Only navigate on explicit success
                    if (sellerProduct.productCreated && !sellerProduct.loading) {
                      clearInterval(pollInterval);
                      checkAndNavigate();
                      return;
                    }

                    // ✅ Timeout fallback: only force redirect if NO error AND no success
                    if (attempts >= maxAttempts) {
                      clearInterval(pollInterval);

                      if (sellerProduct.error) {
                        console.log('❌ [TIMEOUT] Failed with error - staying on form');
                        return; // ✅ Don't navigate on error
                      }

                      if (!sellerProduct.productCreated) {
                        // Only force redirect as last resort when no error but no success either
                        // window.location.href = '/seller/products';
                      }
                    }
                  }, 100);

                  // ✅ Cleanup on component unmount
                  return () => {
                    clearInterval(pollInterval);
                    if ((window as any).__navTimer) {
                      clearTimeout((window as any).__navTimer);
                    }
                  };
                }}
              >
                {sellerProduct.loading || uploadingImage ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CustomLoader size={20} color="inherit" />
                    <span>{uploadingImage ? "Uploading Images..." : "Creating Product..."}</span>
                  </Box>
                ) : sellerProduct.productCreated ? (
                  "✅ Redirecting..."
                ) : mode === "edit" ? "✅ Update Product" :
                  catalogSearch.isCatalogProduct ? "📦 List Offer" : "🚀 Add Product"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                Next
              </Button>
            )}
          </Grid>
          )}
          {onClose && activeStep === 0 && mode !== "edit" && (
            <Grid size={12}>
              <Button type="button" onClick={onClose} color="secondary" fullWidth variant="outlined">
                Cancel
              </Button>
            </Grid>
          )}
        </Grid>
      </form>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          severity={snackbarSeverity}  // ✅ Use local state
          onClose={() => setOpenSnackbar(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      </Paper>
    </Box>
  );
};

export default AddProductForm;