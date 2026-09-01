// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Products\UpdateProductForm.tsx
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText, Grid, IconButton, Snackbar, Alert, Typography, Paper, Box, Tabs, Tab, Chip, Autocomplete, Divider, Switch, FormControlLabel, Tooltip, Accordion, AccordionSummary, AccordionDetails, Checkbox } from '@mui/material';
import "tailwindcss/tailwind.css";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import StyleIcon from "@mui/icons-material/Style";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StorageIcon from "@mui/icons-material/Storage";
import Lock from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { updateProduct } from "../../../redux/Seller/sellerProductSlice";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";
import { validateImageSize } from "../../../util/fileValidator";
import { fetchCategories } from "../../../redux/Admin/CategorySlice";
import CustomLoader from "../../../components/CustomLoader";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../../types/categoryTypes";
import type { CategoryAttribute } from "../../../types/categoryAttributeTypes";
import { separateAttributesByType } from '../../../types/categoryAttributeTypes';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  fetchCategoryAttributes,
  selectCategoryAttributes,
  selectCategoryAttributesLoading,
} from "../../../redux/Admin/CategoryAttributeSlice";

import type {
  ProductFormValues,
  ProductVariantForm,
  ProductSubVariantForm,
  ProductOfferForm,
  ProductOfferPayload,
  ProductVariantPayload,
  ProductUpdatePayload,
} from './types/productFormTypes';

// ============================================
// ✅ NORMALIZATION: Backend → Formik InitialValues
// ============================================
const normalizeProductForFormik = (product: ProductFormValues): ProductFormValues => {
  if (!product) return {} as ProductFormValues;

  const getCurrentSellerId = () => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return '';
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload._id || payload.userId || payload.id || payload.sellerId || '';
    } catch (e) {
      console.warn('⚠️ Could not decode JWT:', e);
      return '';
    }
  };

  const currentSellerId = getCurrentSellerId();

  const extractCategoryId = (cat: any): string => {
    if (typeof cat === 'string') return cat;
    if (cat && typeof cat === 'object') {
      if (cat.$oid) return cat.$oid;
      if (cat._id) return cat._id;
    }
    return '';
  };

  const category3Id = extractCategoryId(product.category);

  return {
    ...product,
    category: category3Id,
    category2: category3Id,
    category3: category3Id,

    // ✅ Copy approval status and reject reason
    approvalStatus: product.approvalStatus,
    rejectReason: product.rejectReason,

    // ✅ FILTER: Only include variants where current seller is the owner OR has offers
    variants: (product.variants || [])
      .filter((colorVariant: any) => {
        const variantOwnerId = typeof colorVariant.variantOwner === 'string'
          ? colorVariant.variantOwner
          : (colorVariant.variantOwner as any)?._id || (colorVariant.variantOwner as any)?.$oid || '';

        const isVariantOwner = variantOwnerId === currentSellerId;

        const hasSellerOffer = (colorVariant.offers || []).some((offer: any) => {
          const offerSellerId = typeof offer.seller === 'string'
            ? offer.seller
            : offer.seller?._id || offer.seller?.$oid || '';
          return offerSellerId === currentSellerId && offer.isActive !== false;
        });

        return isVariantOwner || hasSellerOffer;
      })
      .map((colorVariant: any) => {
        const normalizedVariantOwner = typeof colorVariant.variantOwner === 'string'
          ? colorVariant.variantOwner
          : (colorVariant.variantOwner as any)?._id || (colorVariant.variantOwner as any)?.$oid || '';

        const variantSpecs = colorVariant.specifications
          ? (colorVariant.specifications instanceof Map
            ? Object.fromEntries(colorVariant.specifications)
            : { ...colorVariant.specifications })
          : {};

        return {
          ...colorVariant,
          variantOwner: normalizedVariantOwner,
          specifications: variantSpecs,

          subVariants: (() => {
            if (colorVariant.subVariants && Array.isArray(colorVariant.subVariants)) {
              return colorVariant.subVariants.map((subVariant: any) => {
                const specs = subVariant.specifications
                  ? (subVariant.specifications instanceof Map
                    ? Object.fromEntries(subVariant.specifications)
                    : { ...subVariant.specifications })
                  : {};

return {
  ...subVariant,
  specifications: specs,
  // ✅ ADD THIS: Store the parent variant's unique ID from backend
  variantId: colorVariant._id,  // ✅ This is the unique variant ID from backend
  hasOtherSellerOffers: (subVariant.offers || []).some((offer: any) => {
    const offerSellerId = typeof offer.seller === 'string' ? offer.seller : offer.seller?._id || offer.seller?.$oid || '';
    return offerSellerId && offerSellerId !== currentSellerId && offer.isActive !== false;
  }),
  offers: (subVariant.offers || [])
  .filter((offer: any) => {
    const offerSellerId = typeof offer.seller === 'string'
      ? offer.seller
      : offer.seller?._id || offer.seller?.$oid || '';
    // ✅ Show ALL offers (active AND inactive) for current seller
    return offerSellerId === currentSellerId;
  })
                    .map((offer: any) => {
                      let sellerId = '';
                      if (typeof offer.seller === 'string') sellerId = offer.seller;
                      else if (offer.seller?._id) sellerId = offer.seller._id;
                      else if (offer.seller?.$oid) sellerId = offer.seller.$oid;

                      return {
                        sellerId,
                        mrpPrice: offer.mrpPrice !== undefined && offer.mrpPrice !== null ? String(offer.mrpPrice) : '',
                        sellingPrice: offer.sellingPrice !== undefined && offer.sellingPrice !== null ? String(offer.sellingPrice) : '',
                        stock: offer.stock !== undefined && offer.stock !== null ? String(offer.stock) : '0',
                        sku: offer.sku || '',
                        isReturnable: Boolean(offer.isReturnable),
                        returnTAT: offer.returnTAT || '7 Days',
                        isReplaceable: Boolean(offer.isReplaceable),
                        replacementTAT: offer.replacementTAT || 'N/A',
                        hasDeliveryCharge: Boolean(offer.hasDeliveryCharge),
                        deliveryChargePrice: offer.deliveryChargePrice !== undefined && offer.deliveryChargePrice !== null ? String(offer.deliveryChargePrice) : '0',
                        freeDeliveryRadiusKM: offer.freeDeliveryRadiusKM !== undefined && offer.freeDeliveryRadiusKM !== null ? String(offer.freeDeliveryRadiusKM) : '0',
                        isActive: offer.isActive !== false,
                        _id: typeof offer._id === 'string' ? offer._id : (offer._id as any)?.$oid || (offer._id as any)?._id || '',
                        toBeDeleted: false,
                      };
                    }),
                };
              });
            }

            const backendOffers = colorVariant.offers || [];
            
            const hasOtherSellerOffersLegacy = backendOffers.some((offer: any) => {
              const offerSellerId = typeof offer.seller === 'string' ? offer.seller : offer.seller?._id || offer.seller?.$oid || '';
              return offerSellerId && offerSellerId !== currentSellerId && offer.isActive !== false;
            });
            if (backendOffers.length > 0) {
              const sellerOffers = backendOffers.filter((offer: any) => {
  const offerSellerId = typeof offer.seller === 'string'
    ? offer.seller
    : offer.seller?._id || offer.seller?.$oid || '';
  // ✅ Show ALL offers (active AND inactive)
  return offerSellerId === currentSellerId;
});

              if (sellerOffers.length === 0) return [];

              return sellerOffers.map((offer: any) => {
                let sellerId = '';
                if (typeof offer.seller === 'string') sellerId = offer.seller;
                else if (offer.seller?._id) sellerId = offer.seller._id;
                else if (offer.seller?.$oid) sellerId = offer.seller.$oid;

                return {
                  _id: offer._id || colorVariant._id,
                  specifications: variantSpecs,
                  offers: [{
                    sellerId,
                    mrpPrice: offer.mrpPrice !== undefined && offer.mrpPrice !== null ? String(offer.mrpPrice) : '',
                    sellingPrice: offer.sellingPrice !== undefined && offer.sellingPrice !== null ? String(offer.sellingPrice) : '',
                    stock: offer.stock !== undefined && offer.stock !== null ? String(offer.stock) : '0',
                    sku: offer.sku || '',
                    isReturnable: Boolean(offer.isReturnable),
                    returnTAT: offer.returnTAT || '7 Days',
                    isReplaceable: Boolean(offer.isReplaceable),
                    replacementTAT: offer.replacementTAT || 'N/A',
                    hasDeliveryCharge: Boolean(offer.hasDeliveryCharge),
                    deliveryChargePrice: offer.deliveryChargePrice !== undefined && offer.deliveryChargePrice !== null ? String(offer.deliveryChargePrice) : '0',
                    freeDeliveryRadiusKM: offer.freeDeliveryRadiusKM !== undefined && offer.freeDeliveryRadiusKM !== null ? String(offer.freeDeliveryRadiusKM) : '0',
                    isActive: offer.isActive !== false,
                    _id: typeof offer._id === 'string' ? offer._id : (offer._id as any)?.$oid || (offer._id as any)?._id || '',
                    toBeDeleted: false,
                    approvalStatus: offer.approvalStatus,
                    rejectReason: offer.rejectReason,
                  }],
                  isActive: colorVariant?.isActive !== false,
                  isFromCatalog: colorVariant?.isFromCatalog || false,
                  hasOtherSellerOffers: hasOtherSellerOffersLegacy,
                };
              });
            }

            return [{
              _id: colorVariant._id,
              specifications: variantSpecs,
              offers: [{
                sellerId: normalizedVariantOwner || '',
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
                isActive: true,
                toBeDeleted: false,
              }],
              isActive: colorVariant?.isActive !== false,
              isFromCatalog: colorVariant?.isFromCatalog || false,
              hasOtherSellerOffers: hasOtherSellerOffersLegacy,
            }];
          })(),

          images: colorVariant.images || [],
        } as ProductVariantForm;
      })
      .map((cv: ProductVariantForm) => ({
        ...cv,
        hasOtherSellerOffers: cv.subVariants?.some((sv) => sv.hasOtherSellerOffers) || false,
      }))
      .filter((v: ProductVariantForm) => v.subVariants && v.subVariants.length > 0),
  };
};

const groupVariantsByColor = (variants: ProductVariantForm[]): ProductVariantForm[] => {
  const colorMap = new Map<string, ProductVariantForm>();
  variants.forEach(variant => {
    const color = variant.color || 'Unknown';
    if (!colorMap.has(color)) {
      colorMap.set(color, { ...variant, subVariants: [...variant.subVariants] });
    } else {
      const existing = colorMap.get(color)!;
      existing.subVariants = [...existing.subVariants, ...variant.subVariants];
    }
  });
  return Array.from(colorMap.values());
};

const renderAttributeField = (
  attr: CategoryAttribute,
  value: any,
  onChange: (val: any) => void,
  disabled: boolean = false
) => {
  const label = `${attr.label}${attr.required ? ' *' : ''}`;
  switch (attr.type) {
    case 'select':
      const stringValue = value == null || value === '' ? '' : String(value);
      const isCustomValue = stringValue && !attr.options?.includes(stringValue);
      return (
        <FormControl fullWidth required={attr.required}>
          <InputLabel>{label}</InputLabel>
          <Select value={stringValue} label={label} onChange={(e) => { if (!disabled) onChange(e.target.value); }} disabled={disabled}>
            <MenuItem value=""><em>Select {attr.label}</em></MenuItem>
            {[...(attr.options || [])].sort((a, b) => a.localeCompare(b)).map((opt: string) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            {isCustomValue && <MenuItem key={stringValue} value={stringValue}>{stringValue} (Custom)</MenuItem>}
          </Select>
        </FormControl>
      );
    case 'boolean':
      return (
        <FormControlLabel control={<Checkbox checked={!!value} onChange={(e) => { if (!disabled) onChange(e.target.checked); }} disabled={disabled} />} label={label} />
      );
    case 'textarea':
      return <TextField fullWidth multiline rows={2} label={label} value={value ?? ''} onChange={(e) => { if (!disabled) onChange(e.target.value); }} disabled={disabled} />;
    default:
      return (
        <TextField fullWidth label={label} type={attr.type === 'number' ? 'number' : 'text'} value={value == null ? '' : value} onChange={(e) => { if (!disabled) { const newValue = attr.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value; onChange(newValue); } }} disabled={disabled} />
      );
  }
};

// ✅ Move this helper OUTSIDE the component (top of file)
const createValidationSchema = (currentSellerId: string) => Yup.object({
  title: Yup.string().required("Title is required").min(3).max(200),
  description: Yup.string().required("Description is required").min(10).max(5000),
  variants: Yup.array()
    .of(
      Yup.object().test(
        'variant-ownership',
        'Invalid variant',
        function (variant: any) {
          // ✅ Skip validation for variants you don't own
          const isOwner = variant.variantOwner === currentSellerId;
          if (!isOwner) return true; // ✅ Skip validation for read-only variants

          // Validate owner's variants
          return Yup.object({
            color: Yup.string().required("Color is required").min(2).max(50),
            images: Yup.array()
              .of(Yup.string().url("Invalid image URL"))
              .min(1, "At least one image required per color")
              .required("Images are required"),
            subVariants: Yup.array()
              .of(
                Yup.object({
                  specifications: Yup.object().optional().default({}),
                  offers: Yup.array()
                    .of(
                      Yup.object({
                        sellerId: Yup.string().required("Seller ID is required"),
                        mrpPrice: Yup.string()
                          .required("MRP Price is required")
                          .test("is-number", "Must be a valid number", (val) => val ? !isNaN(Number(val)) : false)
                          .test("positive", "Price must be greater than 0", (val) => Number(val) > 0),
                        sellingPrice: Yup.string()
                          .required("Selling Price is required")
                          .test("is-number", "Must be a valid number", (val) => val ? !isNaN(Number(val)) : false)
                          .test("positive", "Price must be greater than 0", (val) => Number(val) > 0),
                        stock: Yup.string()
                          .optional()
                          .test("is-number", "Must be a valid number", (val) => !val || !isNaN(Number(val)))
                          .test("non-negative", "Stock cannot be negative", (val) => !val || Number(val) >= 0),
                        sku: Yup.string().optional().max(100),
                        isActive: Yup.boolean().default(true),
                      })
                    )
                    .min(1, "At least one offer required")
                    .required("Offers are required"),
                  isActive: Yup.boolean().default(true),
                })
              )
              .min(1, "Each color must have at least one storage variant")
              .required("Sub-variants are required"),
            isActive: Yup.boolean().default(true),
          }).isValidSync(variant, { strict: true });
        }
      )
    )
    .min(1, "At least one color variant is required")
    .required("Product variants are required"),
});

const UpdateProductForm: React.FC<{
  initialValues: ProductFormValues;
  onSubmit?: (values: ProductFormValues) => void;
  onClose?: () => void;
}> = ({ initialValues, onSubmit, onClose }) => {

  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState(0);
  const [expandedSubVariant, setExpandedSubVariant] = useState<number | null>(0);
  const [snackbarOpen, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");
  const [colorSuggestions] = useState(['Black', 'White', 'Blue', 'Red', 'Gold', 'Silver']);
  const [specDefinitions, setSpecDefinitions] = useState<Record<string, string[]>>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sellerProduct = useAppSelector((state: any) => state.sellerProduct);
  const categoryState = useAppSelector((state: any) => state.category);
  const attributeState = useAppSelector(selectCategoryAttributes);
  const attributesLoading = useAppSelector(selectCategoryAttributesLoading);

  const { variantAttributes, highlightAttributes, otherAttributes } = useMemo(() => {
    if (!attributeState || !Array.isArray(attributeState) || attributeState.length === 0) return { variantAttributes: [], highlightAttributes: [], otherAttributes: [] };
    try { return separateAttributesByType(attributeState); } catch (e) { return { variantAttributes: [], highlightAttributes: [], otherAttributes: [] }; }
  }, [attributeState]);

const normalizedInitialValues = useMemo(() => normalizeProductForFormik(initialValues), [initialValues]);

// ✅ For updates, use normalizedInitialValues.variants directly (NO grouping)
// Grouping is only for display, not for form submission
const formVariants = useMemo(() => {
  return normalizedInitialValues.variants;
}, [normalizedInitialValues.variants]);

  const getCurrentSellerFromJWT = () => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return null;
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return { _id: payload._id || payload.userId || payload.id || payload.sellerId, sellerName: payload.sellerName, businessDetails: payload.businessDetails, email: payload.email, role: payload.role };
    } catch (e) { return null; }
  };

  const isProductOwner = useMemo(() => {
    const currentSeller = getCurrentSellerFromJWT();
    const initialValuesAny = initialValues as any;
    const productOwnerId = typeof initialValuesAny.seller === 'string' ? initialValuesAny.seller : initialValuesAny.seller?._id || initialValuesAny.seller?.$oid || '';
    return currentSeller?._id === productOwnerId;
  }, [initialValues]);

  useEffect(() => {
    if (sellerProduct.productUpdated && !sellerProduct.loading) {
      setSnackbarMessage("✅ Product updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      const timer = setTimeout(() => { if (onClose) onClose(); }, 1500);
      return () => clearTimeout(timer);
    }
    if (sellerProduct.error && !sellerProduct.loading) {
      const errorMsg = typeof sellerProduct.error === 'string' ? sellerProduct.error : (sellerProduct.error as any)?.message || 'Update failed';
      setSnackbarMessage(`❌ ${errorMsg}`);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  }, [sellerProduct.productUpdated, sellerProduct.error, sellerProduct.loading, onClose]);

  useEffect(() => { if (categoryState.categories.length === 0) dispatch(fetchCategories()); }, [dispatch, categoryState.categories.length]);

  useEffect(() => {
    const category3Id = normalizedInitialValues.category3;
    if (category3Id && categoryState.categories.length > 0) {
      const level3Category = categoryState.categories.find((cat: Category) => cat._id === category3Id);
      if (level3Category?._id || level3Category?.categoryId) {
        dispatch(fetchCategoryAttributes({ categoryId: level3Category._id || level3Category.categoryId, includeInactive: false }));
      }
    }
  }, [normalizedInitialValues.category3, dispatch, categoryState.categories]);


  useEffect(() => {
    if (attributeState && Array.isArray(attributeState) && attributeState.length > 0) {
      const specs: Record<string, string[]> = {};
      attributeState.forEach((attr: CategoryAttribute) => { if (attr.type === 'select' && attr.options?.length) specs[attr.name] = attr.options; });
      setSpecDefinitions(specs);
    }
  }, [attributeState]);


  const currentSellerId = useMemo(() => {
    const seller = getCurrentSellerFromJWT();
    return seller?._id || '';
  }, []);

  // ✅ Create validation schema with seller ID
  const validationSchema = createValidationSchema(currentSellerId);

  const formik = useFormik<ProductFormValues>({
  initialValues: { ...normalizedInitialValues, variants: formVariants }, 
    enableReinitialize: true,
    validationSchema, // ✅ Now uses seller-aware schema
    validateOnMount: false,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (onSubmit) {
        onSubmit(values);
        setSubmitting(false);
        return;
      }

      try {
        setUploadingImage(true);
        for (let vIdx = 0; vIdx < values.variants.length; vIdx++) {
          const variant = values.variants[vIdx];
          const uploadedUrls: string[] = [];
          for (let i = 0; i < variant.images.length; i++) {
            const img = variant.images[i];
            if (img instanceof File) {
              const result = await uploadToCloudinary(img);
              if (result.url) uploadedUrls.push(result.url);
            } else {
              uploadedUrls.push(img as string);
            }
          }
          variant.images = uploadedUrls;
        }
        setUploadingImage(false);

        const currentSeller = getCurrentSellerFromJWT();
        const currentSellerId = currentSeller?._id || '';

        // ✅ Get variant attribute names from attributeState
        const variantAttributeNames = (Array.isArray(attributeState) ? attributeState : [])
          .filter((attr: CategoryAttribute) => (attr?.isVariantField || attr?.isColorVariantField) && attr?.isActive)
          .map((attr: CategoryAttribute) => attr?.name?.toLowerCase());

        const payload: ProductUpdatePayload = {
          title: values.title?.trim() || '',
          description: values.description?.trim() || '',
          variants: values.variants.flatMap(colorVariant =>
            colorVariant.subVariants
              .filter((subVar: any) => !subVar.toBeDeleted)
              .map(subVar => {
                const offersPayload: ProductOfferPayload[] = subVar.offers
                  .filter((offer: any) => !offer.toBeDeleted && offer.sellerId === currentSellerId)
                  .map(offer => ({
                    _id: offer._id,
                    seller: offer.sellerId,
                    mrpPrice: Number(offer.mrpPrice) || 0,
                    sellingPrice: Number(offer.sellingPrice) || 0,
                    stock: Number(offer.stock) || 0,
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

                if (offersPayload.length === 0) return null;

                // ✅ Build specifications with variant fields
                const allSpecs = {
                  ...(subVar.specifications || {})
                };

                // ✅ CRITICAL: Filter to ONLY variant-specific fields
                const variantSpecs: Record<string, string> = {};
                Object.entries(allSpecs).forEach(([key, value]) => {
                  if (variantAttributeNames.includes(key.toLowerCase())) {
                    variantSpecs[key] = String(value);
                  }
                });

                return {
                  _id: subVar.variantId || colorVariant._id, 
                  color: colorVariant.color.trim(),
                  specifications: variantSpecs,
                  images: colorVariant.images,
                  offers: offersPayload,
                  isActive: subVar.isActive !== false,
                } as ProductVariantPayload;
              })
              .filter((v): v is ProductVariantPayload => v !== null)
          ),
          isActive: values.isActive !== false,
          highlights: values.highlights || {},
        };

        if (!payload.variants || payload.variants.length === 0) {
          setSnackbarMessage('⚠️ No valid offers to update. Please ensure you have active offers.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);
          setSubmitting(false);
          return;
        }

        if (initialValues._id) {
          dispatch(updateProduct({ productId: initialValues._id, product: payload }));
        } else {
          setSnackbarMessage('❌ Product ID is missing');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('❌ Submit Error:', error);
        setSnackbarMessage('❌ Failed to submit form. Check console for details.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
      setSubmitting(false);
    },
  });

  const levelOneCategories = useMemo(() => categoryState.categories.filter((cat: Category) => cat.level === 1).sort((a: Category, b: Category) => (a.order ?? 999999) - (b.order ?? 999999) || (a.name || "").localeCompare(b.name || "")), [categoryState.categories]);
  const levelTwoCategories = useMemo(() => { if (!initialValues.category) return []; return categoryState.categories.filter((cat: Category) => cat.level === 2 && cat.parentCategory === initialValues.category).sort((a: Category, b: Category) => (a.order ?? 999999) - (b.order ?? 999999) || (a.name || "").localeCompare(b.name || "")); }, [categoryState.categories, initialValues.category]);
  const levelThreeCategories = useMemo(() => { if (!initialValues.category2) return []; return categoryState.categories.filter((cat: Category) => cat.level === 3 && cat.parentCategory === initialValues.category2).sort((a: Category, b: Category) => (a.name || "").localeCompare(b.name || "")); }, [categoryState.categories, initialValues.category2]);

  const handleAddColorVariant = useCallback(() => {
    const currentSeller = getCurrentSellerFromJWT();
    const newColorVariant: ProductVariantForm = {
      color: '', images: [], highlights: {},
      subVariants: [{ specifications: {}, offers: [{ sellerId: currentSeller?._id || '', mrpPrice: '', sellingPrice: '', stock: '0', sku: '', isReturnable: false, returnTAT: '7 Days', isReplaceable: false, replacementTAT: 'N/A', hasDeliveryCharge: false, deliveryChargePrice: '0', freeDeliveryRadiusKM: '0', isActive: true }], isActive: true }],
      isActive: true
    };
    formik.setFieldValue('variants', [...formik.values.variants, newColorVariant]);
    setActiveColorTab(formik.values.variants.length);
    setExpandedSubVariant(0);
  }, [formik.values.variants, formik]);

  const handleRemoveColorVariant = useCallback((index: number) => {
    if (formik.values.variants.length <= 1) {
      formik.setFieldValue('variants', [{ color: '', images: [], highlights: {}, subVariants: [{ specifications: {}, offers: [{ sellerId: '', mrpPrice: '', sellingPrice: '', stock: '0', sku: '', isReturnable: false, returnTAT: '7 Days', isReplaceable: false, replacementTAT: 'N/A', hasDeliveryCharge: false, deliveryChargePrice: '0', freeDeliveryRadiusKM: '0', isActive: true }], isActive: true }], isActive: true }]);
      setActiveColorTab(0); setExpandedSubVariant(0); return;
    }
    const newVariants = formik.values.variants.filter((_, i) => i !== index);
    formik.setFieldValue('variants', newVariants);
    if (activeColorTab >= newVariants.length) setActiveColorTab(Math.max(0, newVariants.length - 1));
  }, [formik.values.variants, activeColorTab, formik]);

  const handleColorVariantChange = useCallback((colorIndex: number, field: keyof ProductVariantForm, value: any) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex] = { ...newVariants[colorIndex], [field]: value };
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleAddSubVariant = useCallback((colorIndex: number) => {
    const currentSeller = getCurrentSellerFromJWT();
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants.push({ specifications: {}, offers: [{ sellerId: currentSeller?._id || '', mrpPrice: '', sellingPrice: '', stock: '0', sku: '', isReturnable: false, returnTAT: '', isReplaceable: false, replacementTAT: '', hasDeliveryCharge: false, deliveryChargePrice: '', freeDeliveryRadiusKM: '', isActive: true }], isActive: true });
    formik.setFieldValue('variants', newVariants);
    setExpandedSubVariant(newVariants[colorIndex].subVariants.length - 1);
  }, [formik.values.variants, formik]);

  const handleRemoveSubVariant = useCallback((colorIndex: number, subVariantIndex: number) => {
    const newVariants = [...formik.values.variants];
    const subVariant = newVariants[colorIndex].subVariants[subVariantIndex];
    if (subVariant._id) { newVariants[colorIndex].subVariants[subVariantIndex] = { ...subVariant, toBeDeleted: true } as ProductSubVariantForm; }
    else {
      if (newVariants[colorIndex].subVariants.length <= 1) { 
        setSnackbarMessage('Each color must have at least one storage variant');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return; 
      }
      newVariants[colorIndex].subVariants.splice(subVariantIndex, 1);
    }
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleSubVariantSpecChange = useCallback((colorIndex: number, subVariantIndex: number, attributeName: string, value: any) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants[subVariantIndex] = { ...newVariants[colorIndex].subVariants[subVariantIndex], specifications: { ...newVariants[colorIndex].subVariants[subVariantIndex].specifications, [attributeName]: value } } as ProductSubVariantForm;
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleAddOffer = useCallback((colorIndex: number, subVariantIndex: number) => {
    const currentSeller = getCurrentSellerFromJWT();
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants[subVariantIndex].offers.push({ sellerId: currentSeller?._id || '', mrpPrice: '', sellingPrice: '', stock: '0', sku: '', isActive: true, isReturnable: false, returnTAT: '0', isReplaceable: false, replacementTAT: '0', hasDeliveryCharge: false, deliveryChargePrice: '0', freeDeliveryRadiusKM: '0' });
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleRemoveOffer = useCallback((colorIndex: number, subVariantIndex: number, offerIndex: number) => {
    const newVariants = [...formik.values.variants];
    const offer = newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex];
    if (offer._id) { newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex] = { ...offer, toBeDeleted: true }; }
    else { newVariants[colorIndex].subVariants[subVariantIndex].offers.splice(offerIndex, 1); }
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleOfferChange = useCallback((colorIndex: number, subVariantIndex: number, offerIndex: number, field: string, value: any) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex] = { ...newVariants[colorIndex].subVariants[subVariantIndex].offers[offerIndex], [field]: value };
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleColorVariantImageUpload = useCallback((colorIndex: number, files: FileList | null) => {
    let validFiles = validateImageSize(files, 5, (msg) => {
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    });
    if (validFiles.length === 0) return;
    const newVariants = [...formik.values.variants];
    const existingImages = newVariants[colorIndex].images || [];

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
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const handleRemoveColorVariantImage = useCallback((colorIndex: number, imageIndex: number) => {
    const newVariants = [...formik.values.variants];
    newVariants[colorIndex].images?.splice(imageIndex, 1);
    formik.setFieldValue('variants', newVariants);
  }, [formik.values.variants, formik]);

  const isFormValid = useMemo(() => {
    if (!formik.values.title?.trim()) return false;
    if (!formik.values.description?.trim()) return false;
    if (!formik.values.variants?.length) return false;

    return formik.values.variants.every(cv =>
      cv.color?.trim() &&
      (isProductOwner ? cv.images?.length > 0 : true) &&
      cv.subVariants?.length > 0 &&
      cv.subVariants.every(sv =>
        sv.offers?.length > 0 &&
        sv.offers.some(offer => {
          const mrp = String(offer.mrpPrice || '').trim();
          const selling = String(offer.sellingPrice || '').trim();
          return mrp && selling && !isNaN(Number(mrp)) && !isNaN(Number(selling)) && Number(mrp) > 0 && Number(selling) > 0;
        })
      )
    );
  }, [formik.values.title, formik.values.description, formik.values.variants, isProductOwner]);


  const renderVariantsSection = () => {
    const currentSeller = getCurrentSellerFromJWT();
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StyleIcon color="primary" />
            <Typography variant="h6">Product Variants</Typography>
          </Box>
          <Button startIcon={<AddCircleIcon />} onClick={handleAddColorVariant} variant="outlined" size="small">Add Variant</Button>
        </Box>

        {formik.values.variants.length === 0 ? (
          <Paper sx={{ p: { xs: 1.5, sm: 3 }, textAlign: 'center', bgcolor: 'amber.50' }}><Typography>No product variants found.</Typography></Paper>
        ) : (
          <>
            <Tabs value={activeColorTab} onChange={(_, val) => setActiveColorTab(val)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, boxShadow: { xs: 'none', sm: 1 }, border: { xs: 'none', sm: 'auto' }, '&:before': { display: 'none' } }}>
              {formik.values.variants.map((colorVariant, colorIndex) => (
                <Tab key={colorIndex} label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyleIcon fontSize="small" /><Typography variant="body2">{colorVariant.color || `Variant ${colorIndex + 1}`}</Typography>
                    {colorVariant.variantOwner && colorVariant.variantOwner !== currentSeller?._id && <Tooltip title="This variant is managed by another seller"><Lock fontSize="small" sx={{ color: 'text.disabled' }} /></Tooltip>}
                  </Box>}
                  icon={formik.values.variants.length > 1 && !colorVariant.hasOtherSellerOffers ? <Tooltip title="Remove product variant"><Box component="span" onClick={(e) => { e.stopPropagation(); handleRemoveColorVariant(colorIndex); }} sx={{ ml: 1, cursor: 'pointer', color: 'error.main' }}><RemoveCircleIcon fontSize="small" /></Box></Tooltip> : undefined}
                  iconPosition="end" />
              ))}
            </Tabs>

            {formik.values.variants[activeColorTab] && (
              <Paper sx={{ p: { xs: 1.5, sm: 3 }, boxShadow: { xs: 'none', sm: 1 } }}>
                {(() => {
                  const currentVariant = formik.values.variants[activeColorTab];
                  const isVariantOwner = currentVariant.variantOwner === currentSeller?._id;
                  return (
                    <>
                      {isVariantOwner ? (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete freeSolo options={colorSuggestions} value={formik.values.variants[activeColorTab].color} onChange={(_, val) => handleColorVariantChange(activeColorTab, 'color', val || '')} onInputChange={(_, val) => handleColorVariantChange(activeColorTab, 'color', val || '')} renderInput={(params) => <TextField {...params} label="Variant Name" error={Boolean(formik.touched.variants?.[activeColorTab]?.color && (formik.errors.variants as any)?.[activeColorTab]?.color)} helperText={formik.touched.variants?.[activeColorTab]?.color && ((formik.errors.variants as any)?.[activeColorTab]?.color as string)} required />} />
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Color" value={formik.values.variants[activeColorTab].color} disabled InputProps={{ endAdornment: <Chip label="Read-Only" size="small" color="info" variant="outlined" /> }} />
                          </Grid>
                        </Grid>
                      )}

                      {isVariantOwner && (
                        <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Images for {formik.values.variants[activeColorTab].color || 'this variant'} *{' '}
                            <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.8rem' }}>(Supported: JPEG, JPG, PNG, WebP. Max: 5MB)</span>
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="file" accept="image/*" multiple id={`color-images-${activeColorTab}`} style={{ display: 'none' }} onChange={(e) => handleColorVariantImageUpload(activeColorTab, e.target.files)} />
                            <label htmlFor={`color-images-${activeColorTab}`}><Button component="span" variant="outlined" startIcon={<AddPhotoAlternateIcon />} disabled={uploadingImage}>{uploadingImage ? <CustomLoader size={20} /> : 'Upload Images'}</Button></label>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {formik.values.variants[activeColorTab].images?.map((img, idx) => (
                              <Box key={idx} sx={{ position: 'relative' }}>
                                <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Color ${activeColorTab + 1} - ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                <IconButton size="small" onClick={() => handleRemoveColorVariantImage(activeColorTab, idx)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}><CloseIcon fontSize="small" /></IconButton>
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}

                      {!isVariantOwner && formik.values.variants[activeColorTab].images?.length > 0 && (
                        <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>Variant Images (Read-Only)</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {formik.values.variants[activeColorTab].images.map((img, idx) => (
                              <Box key={idx} sx={{ position: 'relative', opacity: 0.7 }}>
                                <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Color ${activeColorTab + 1} - ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock fontSize="small" sx={{ color: 'text.secondary' }} /></Box>
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}

                      <Divider sx={{ mb: 3 }} />

                      {formik.values.variants[activeColorTab].subVariants.filter((subVariant) => !(subVariant as any).toBeDeleted).map((subVariant, subIndex) => (
                        <Accordion key={subIndex} expanded={expandedSubVariant === subIndex} onChange={() => setExpandedSubVariant(expandedSubVariant === subIndex ? null : subIndex)} sx={{ mb: 2, boxShadow: { xs: 'none', sm: 1 }, border: { xs: 'none', sm: 'auto' }, '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                              <StorageIcon color="primary" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                {subVariant.specifications && Object.values(subVariant.specifications).filter(Boolean).length > 0 
                                  ? Object.values(subVariant.specifications).filter(Boolean).join(' • ') 
                                  : `Subvariant ${subIndex + 1}`}
                              </Typography>
                              {subVariant.offers?.length > 0 && <Chip label={`₹${Math.min(...subVariant.offers.filter(o => o.sellingPrice).map(o => Number(o.sellingPrice))) || '0'}`} size="small" color="success" variant="outlined" />}
                              {!subVariant.isActive && <Chip label="Inactive" size="small" color="default" />}
                              {!isVariantOwner && <Chip label="Read-Only" size="small" color="info" variant="outlined" />}
                            </Box>
                            {formik.values.variants[activeColorTab].subVariants.length > 1 && isVariantOwner && !subVariant.hasOtherSellerOffers && <Box component="span" onClick={(e) => { e.stopPropagation(); handleRemoveSubVariant(activeColorTab, subIndex); }} sx={{ cursor: 'pointer', color: 'error.main', ml: 1 }}><RemoveCircleIcon fontSize="small" /></Box>}
                          </AccordionSummary>

                          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
                            <Grid container spacing={2}>
                              {isVariantOwner && attributesLoading ? (
                                <Grid size={{ xs: 12 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CustomLoader size={20} /><Typography variant="body2">Loading specifications...</Typography></Box></Grid>
                              ) : isVariantOwner && attributeState?.length > 0 ? (
                                <>
                                  {variantAttributes?.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                      <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'primary.50', borderRadius: 2, border: { xs: 'none', sm: '1px solid' }, borderColor: 'primary.light', mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>🔹 Variant Selector Fields ({variantAttributes.length})</Typography>
                                        <Grid container spacing={2}>
                                          {variantAttributes.map((attr: CategoryAttribute) => {
                                            const specValue = subVariant.specifications?.[attr.name];
                                            return (
                                              <Grid key={attr._id || attr.name} size={{ xs: 12, sm: 6 }}>
                                                {attr.type === 'select' ? (
                                                  <FormControl fullWidth required={attr.required} disabled>  {/* ✅ ADD disabled */}
                                                    <InputLabel>{attr.label}{attr.required && ' *'}</InputLabel>
                                                    <Select
                                                      value={specValue || ''}
                                                      label={`${attr.label}${attr.required ? ' *' : ''}`}
                                                      disabled
                                                    >
                                                      <MenuItem value=""><em>Select {attr.label}</em></MenuItem>
                                                      {[...(attr.options || [])].sort((a, b) => a.localeCompare(b)).map((opt: string) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                                    </Select>
                                                  </FormControl>
                                                ) : (
                                                  <TextField
                                                    fullWidth
                                                    label={`${attr.label}${attr.required ? ' *' : ''}`}
                                                    value={specValue || ''}
                                                    type={attr.type === 'number' ? 'number' : 'text'}
                                                    required={attr.required}
                                                    disabled
                                                    InputProps={{ readOnly: true }}
                                                  />
                                                )}
                                              </Grid>
                                            );
                                          })}
                                        </Grid>
                                      </Box>
                                    </Grid>
                                  )}
                                  {/* otherAttributes moved to Product Highlights */}
                                </>
                              ) : !isVariantOwner ? (
                                <Grid size={{ xs: 12 }}>
                                  <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'grey.50', borderRadius: 2, border: { xs: 'none', sm: '1px dashed' }, borderColor: 'grey.300', mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>🔹 Variant Specifications (Read-Only)</Typography>
                                    <Grid container spacing={2}>
                                      {variantAttributes.map((attr: CategoryAttribute) => { const specValue = subVariant.specifications?.[attr.name]; return <Grid key={attr._id || attr.name} size={{ xs: 12, sm: 6 }}><TextField fullWidth label={attr.label} value={specValue || ''} disabled InputProps={{ endAdornment: <Lock fontSize="small" sx={{ color: 'text.disabled' }} /> }} /></Grid>; })}
                                    </Grid>
                                  </Box>
                                </Grid>
                              ) : null}

                              <Grid size={{ xs: 12 }}>
                                <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'info.50', borderRadius: 2, border: { xs: 'none', sm: '1px solid' }, borderColor: 'info.light', mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="info.main">🏪 Seller Offers ({(subVariant.offers || []).filter(o => !o.toBeDeleted).length || 0})</Typography>
                                  </Box>

                                  {(subVariant.offers || []).filter(o => !o.toBeDeleted).length === 0 ? (
                                    <Alert severity="info">No offers found.</Alert>
                                  ) : (
                                    (subVariant.offers || []).filter(o => !o.toBeDeleted).map((offer, offerIndex) => {
                                      const isCurrentSellerOffer = offer.sellerId === (currentSeller?._id || '');
                                      return (
                                        <Box key={offerIndex} sx={{ pt: 0 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                      {isCurrentSellerOffer && (subVariant.offers || []).filter(o => !o.toBeDeleted).length > 1 && <IconButton size="small" color="error" onClick={() => handleRemoveOffer(activeColorTab, subIndex, offerIndex)}><RemoveCircleIcon fontSize="small" /></IconButton>}
                                    </Box>
                                          <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <TextField fullWidth label="MRP Price (₹) *" type="number" value={String(offer.mrpPrice ?? '')} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'mrpPrice', e.target.value)} error={Boolean(formik.touched.variants?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.mrpPrice && (formik.errors.variants as any)?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.mrpPrice)} helperText={formik.touched.variants?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.mrpPrice && ((formik.errors.variants as any)?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.mrpPrice as string)} InputProps={{ inputProps: { min: 0, step: "0.01" }, readOnly: !isCurrentSellerOffer }} required />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <TextField fullWidth label="Selling Price (₹) *" type="number" value={String(offer.sellingPrice ?? '')} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'sellingPrice', e.target.value)} error={Boolean(formik.touched.variants?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.sellingPrice && (formik.errors.variants as any)?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.sellingPrice)} helperText={formik.touched.variants?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.sellingPrice && ((formik.errors.variants as any)?.[activeColorTab]?.subVariants?.[subIndex]?.offers?.[offerIndex]?.sellingPrice as string)} InputProps={{ inputProps: { min: 0, step: "0.01" }, readOnly: !isCurrentSellerOffer }} required />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <TextField fullWidth label="Stock Quantity" type="number" value={String(offer.stock ?? '0')} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'stock', e.target.value)} InputProps={{ inputProps: { min: 0 }, readOnly: !isCurrentSellerOffer }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <TextField fullWidth label="SKU (Optional)" value={offer.sku || ''} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'sku', e.target.value)} placeholder="Auto-generated if empty" InputProps={{ readOnly: !isCurrentSellerOffer }} />
                                            </Grid>

                                            {/* ✅ Return & Replace Policies */}
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <FormControlLabel control={<Switch checked={offer.isReturnable} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'isReturnable', e.target.checked)} disabled={!isCurrentSellerOffer} />} label="Returnable" />
                                              {offer.isReturnable && (
                                                <TextField fullWidth sx={{ mt: 1 }} label="Return TAT (Days)" type="number" value={offer.returnTAT} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'returnTAT', e.target.value)} InputProps={{ inputProps: { min: 1 }, readOnly: !isCurrentSellerOffer }} required />
                                              )}
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <FormControlLabel control={<Switch checked={offer.isReplaceable} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'isReplaceable', e.target.checked)} disabled={!isCurrentSellerOffer} />} label="Replaceable" />
                                              {offer.isReplaceable && (
                                                <TextField fullWidth sx={{ mt: 1 }} label="Replacement TAT (Days)" type="number" value={offer.replacementTAT} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'replacementTAT', e.target.value)} InputProps={{ inputProps: { min: 1 }, readOnly: !isCurrentSellerOffer }} required />
                                              )}
                                            </Grid>

                                            {/* ✅ Delivery Rules */}
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <FormControlLabel control={<Switch checked={offer.hasDeliveryCharge} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'hasDeliveryCharge', e.target.checked)} disabled={!isCurrentSellerOffer} />} label="Has Delivery Charge" />
                                              {offer.hasDeliveryCharge && (
                                                <TextField fullWidth sx={{ mt: 1 }} label="Delivery Charge (₹)" type="number" value={offer.deliveryChargePrice} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'deliveryChargePrice', e.target.value)} InputProps={{ inputProps: { min: 0 }, readOnly: !isCurrentSellerOffer }} required />
                                              )}
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <TextField fullWidth label="Free Delivery Radius (KM)" type="number" value={offer.freeDeliveryRadiusKM} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'freeDeliveryRadiusKM', e.target.value)} helperText="Set 0 for global charge, or specify KM for free local delivery" InputProps={{ inputProps: { min: 0 }, readOnly: !isCurrentSellerOffer }} />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                              <FormControlLabel control={<Switch checked={offer.isActive !== false} onChange={(e) => isCurrentSellerOffer && handleOfferChange(activeColorTab, subIndex, offerIndex, 'isActive', e.target.checked)} disabled={!isCurrentSellerOffer} />} label="Active (visible to customers)" />
                                            </Grid>
                                          </Grid>
                                        </Box>
                                      );
                                    })
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </>
                  );
                })()}
              </Paper>
            )}
          </>
        )}
      </Box>
    );
  };

  const rejectedMessages: string[] = [];
  if (formik.values.approvalStatus === 'REJECTED' && formik.values.rejectReason) {
    rejectedMessages.push(`Product: ${formik.values.rejectReason}`);
  }
  formik.values.variants.forEach(variant => {
    variant.subVariants?.forEach(sub => {
      sub.offers?.forEach(offer => {
        if (offer.approvalStatus === 'REJECTED' && offer.rejectReason) {
          rejectedMessages.push(`Offer (SKU ${offer.sku || 'Unknown'}): ${offer.rejectReason}`);
        }
      });
    });
  });

  return (
    <Box sx={{ p: 0, bgcolor: 'grey.50', borderRadius: 3, overflowY: 'auto', overflowX: 'hidden' }}>
      {/* 🌟 Premium Header */}
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circle */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <Typography variant="h5" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditIcon color="primary" sx={{ bgcolor: 'white', borderRadius: 1, p: 0.5, fontSize: '1.8rem' }} />
          Edit Product: {formik.values.title || 'Loading...'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.300', opacity: 0.9 }}>
          Update variant details, prices, and stock. Categories are locked.
        </Typography>
      </Box>

      {/* 🚨 Rejection Alert Banner */}
      {rejectedMessages.length > 0 && (
        <Box sx={{ p: { xs: 1, md: 4 }, pb: 0 }}>
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Action Required: Rejection Corrections</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Please make the following corrections and save to automatically reapply for approval:</Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {rejectedMessages.map((msg, i) => <li key={i}><Typography variant="body2">{msg}</Typography></li>)}
            </ul>
          </Alert>
        </Box>
      )}

      {/* 📄 Form Container */}
      <Box sx={{ p: { xs: 1, md: 4 } }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* 📝 Product Info Section */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: { xs: 'none', sm: '1px solid' }, borderColor: 'grey.200', boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.03)' }, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Typography variant="h6" fontWeight="700" color="primary.main">📝 Product Information</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Product Title" variant="outlined" value={formik.values.title} onChange={(e) => formik.setFieldValue('title', e.target.value)} onBlur={formik.handleBlur} error={formik.touched.title && Boolean(formik.errors.title)} helperText={formik.touched.title && formik.errors.title ? String(formik.errors.title) : ""} required disabled={!isProductOwner} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField multiline rows={4} fullWidth label="Description" variant="outlined" value={formik.values.description} onChange={(e) => formik.setFieldValue('description', e.target.value)} onBlur={formik.handleBlur} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description ? String(formik.errors.description) : ""} required disabled={!isProductOwner} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* ✨ Highlights Section */}
            {isProductOwner && (highlightAttributes.length > 0 || otherAttributes.length > 0) && (
              <Grid size={{ xs: 12 }}>
                <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: { xs: 'none', sm: '1px solid' }, borderColor: 'grey.200', boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.03)' }, bgcolor: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="700" color="success.main">✨ Product Highlights & Additional Specs</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    {highlightAttributes.map((attr: CategoryAttribute) => {
                      const highlightValue = formik.values.highlights?.[attr.name] || '';
                      return <Grid key={attr._id || attr.name} size={{ xs: 12, sm: 6 }}>{renderAttributeField(attr, highlightValue, (newValue: any) => formik.setFieldValue(`highlights.${attr.name}`, newValue), false)}</Grid>;
                    })}
                    {otherAttributes.map((attr: CategoryAttribute) => {
                      const specValue = formik.values.highlights?.[attr.name] || '';
                      return <Grid key={attr._id || attr.name} size={{ xs: 12, sm: 6 }}>{renderAttributeField(attr, specValue, (newValue: any) => formik.setFieldValue(`highlights.${attr.name}`, newValue), false)}</Grid>;
                    })}
                  </Grid>
                </Paper>
              </Grid>
            )}

          {!isProductOwner && highlightAttributes.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" variant="outlined" icon={<Lock />}>
                <Typography variant="body2"><strong>Product Highlights</strong> are managed by the product owner. Contact them if you need to update shared product details.</Typography>
              </Alert>
            </Grid>
          )}

            {/* 📁 Locked Category Notice */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: 'info.50', border: { xs: 'none', sm: '1px dashed' }, borderColor: 'info.300', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2, display: 'flex', border: { xs: 'none', sm: '1px solid' }, borderColor: 'info.100' }}>
                  <Lock color="info" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="info.900" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {categoryState.categories.find((c: Category) => c._id === normalizedInitialValues.category)?.name} →{" "}
                    {categoryState.categories.find((c: Category) => c._id === normalizedInitialValues.category2)?.name} →{" "}
                    {categoryState.categories.find((c: Category) => c._id === normalizedInitialValues.category3)?.name}
                  </Typography>
                  <Typography variant="caption" color="info.700">Category structure cannot be changed once product is created.</Typography>
                </Box>
              </Paper>
            </Grid>

            {/* 🎨 Variants Section */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: { xs: 'none', sm: '1px solid' }, borderColor: 'grey.200', boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.03)' }, bgcolor: 'white' }}>
                {renderVariantsSection()}
              </Paper>
            </Grid>

            {/* ✅ Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            {onClose && (<Button type="button" onClick={onClose} variant="outlined" color="secondary">Cancel</Button>)}
              <Button
                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                color="primary"
                variant="contained"
                type="submit"
                disabled={
                  sellerProduct.loading ||
                  uploadingImage ||
                  !isFormValid ||
                  (isProductOwner && highlightAttributes.length > 0 && attributesLoading) ||
                  (!isProductOwner && formik.values.variants.length === 0)
                }
              >
                {sellerProduct.loading || uploadingImage ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CustomLoader size={20} color="inherit" />
                    <span>{uploadingImage ? "Uploading Images..." : "Saving Changes..."}</span>
                  </Box>
                ) : "Save Changes"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>

      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} variant="filled" sx={{ width: "100%" }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateProductForm;
