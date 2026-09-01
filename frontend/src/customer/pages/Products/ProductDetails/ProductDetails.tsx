import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Products\ProductDetails\ProductDetails.tsx
import { Box, Snackbar, Alert, Chip, Typography, Grid, Paper, Card, CardContent, Drawer, IconButton } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { CheckCircle } from '@mui/icons-material';

import MemoryIcon from '@mui/icons-material/Memory';
import StoreIcon from '@mui/icons-material/Store';
const SmilarProduct = React.lazy(() => import('../SimilarProduct/SmilarProduct'));
const ProductReviewCard = React.lazy(() => import('../../Review/ProductReviewCard'));
const RatingCard = React.lazy(() => import('../../Review/RatingCard'));
const ProductReviewsTab = React.lazy(() => import('./components/ProductReviewsTab'));

import { useAppDispatch, useAppSelector } from '../../../../redux/Store';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchProductById } from '../../../../redux/Customer/ProductSlice';
import { addProductToWishlist, removeProductFromWishlist } from '../../../../redux/Customer/WishlistSlice';
import { addItemToCart, fetchUserCart } from '../../../../redux/Customer/CartSlice';
import { fetchReviewsByProductId } from '../../../../redux/Customer/ReviewSlice';
import { fetchSellerReviews } from '../../../../redux/Customer/SellerReviewSlice';
import './ProductDetails.css';
import { secureUrl } from '../../../../util/secureUrl';


import type { ProductVariant } from '../../../../types/productTypes';
import type { Category } from '../../../../types/categoryTypes';
import type { CategoryAttribute } from '../../../../types/categoryAttributeTypes';
import {
  fetchCategoryAttributes,
  selectCategoryAttributes,
  selectCategoryAttributesLoading,
} from '../../../../redux/Admin/CategoryAttributeSlice';
import { api } from '../../../../Config/Api';
import { selectLocationFilter } from '../../../../redux/Customer/ProductSlice';
import ProductImageGallery from './components/ProductImageGallery';
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuGitCompareArrows } from "react-icons/lu";
import { FaUndoAlt, FaMoneyBillWave, FaTruck, FaStar, FaLock } from "react-icons/fa";
import { FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";
import { Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Rating } from "@mui/material";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import CustomLoader from "../../../../components/CustomLoader";


// ─── Constants ────────────────────────────────────────────────────────────────

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  height: '100%',
  boxShadow: 24,
  outline: 'none',
};

const PLACEHOLDER_50 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
const PLACEHOLDER_600 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3ENo Image Available%3C/text%3E%3C/svg%3E";

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDetails = () => {
  // ── Modal (image zoom) ──
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // ── Redux ──
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products);
  const review = useAppSelector((state) => state.review);
  const attributeState = useAppSelector(selectCategoryAttributes);
  const attributesLoading = useAppSelector(selectCategoryAttributesLoading);

  const hasColorAttribute = useMemo(() => {
    return attributeState?.some((a: any) => a.isColorVariantField);
  }, [attributeState]);

  const colorVariantLabel = useMemo(() => {
    const attr = attributeState?.find((a: any) => a.isColorVariantField);
    return attr?.label || "Selected Variant";
  }, [attributeState]);

  const subVariantLabel = useMemo(() => {
    const attrs = attributeState?.filter((a: any) => a.isVariantField && !a.isColorVariantField);
    if (attrs && attrs.length > 0) {
      return attrs.map((a: any) => a.label).join(' + ');
    }
    return "Subvariant";
  }, [attributeState]);
  const categoryState = useAppSelector((state: any) => state.category);
  const sellerReviewState = useAppSelector((state) => state.sellerReview);
  const locationFilter = useAppSelector(selectLocationFilter);

  const navigate = useNavigate();
  const { productId, categoryId } = useParams();

  // ✅ Read sellerId from URL query param (set when navigating from seller profile)
  const [searchParams] = useSearchParams();
  const sellerIdFromProfile = searchParams.get('sellerId');

  // ✅ Scroll to top whenever the product ID changes (entering the page)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // ── Product / variant state ──
  const product = products.product;
  const { wishlist } = useAppSelector((state: any) => state.wishlist);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<string>('');

  // ── Seller offers ──
  const [sellerOffers, setSellerOffers] = useState<any[]>([]);
  const [selectedSellerOffer, setSelectedSellerOffer] = useState<any>(null);
  const [isCatalogProduct, setIsCatalogProduct] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // ── Snackbar ──
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const isWishlisted = useMemo(() => {
    if (!wishlist?.products || !productId) return false;
    return wishlist.products.some((p: any) => p._id === productId || p.product?._id === productId || p === productId);
  }, [wishlist, productId]);

  const handleToggleWishlist = () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      setSnackbarMessage("Please login to add to wishlist");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (isWishlisted) {
      dispatch(removeProductFromWishlist({ productId: productId || '' }));
      setSnackbarMessage("Removed from wishlist");
    } else {
      dispatch(addProductToWishlist({ productId: productId || '' }));
      setSnackbarMessage("Added to wishlist");
    }
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // ── Seller Review Drawer ──
  const [openSellerDrawer, setOpenSellerDrawer] = useState(false);
  const [selectedSellerReviews, setSelectedSellerReviews] = useState<any[]>([]);
  const [selectedSellerName, setSelectedSellerName] = useState('');

  // ── Review scroll ──
  const reviewScrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  // ── Track whether seller-profile variant has been auto-selected ──
  // This prevents re-selecting on every re-render once user has manually changed selection
  const sellerProfileVariantSelectedRef = useRef(false);

  const scrollReviews = (dir: 'left' | 'right') => {
    if (!reviewScrollRef.current) return;
    const amount = 300;
    reviewScrollRef.current.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
    setTimeout(() => {
      const el = reviewScrollRef.current;
      if (!el) return;
      setShowLeftBtn(el.scrollLeft > 0);
      setShowRightBtn(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, 300);
  };

  const handleNavigateToSeller = useCallback(
    (offer: any, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const sid =
        typeof offer?.seller === 'string' ? offer.seller : offer?.seller?._id;
      if (sid) navigate(`/seller-profile/${sid}`);
    },
    [navigate]
  );

  const handleOpenReviewDrawer = useCallback(
    (offer: any, sellerReviews: any[], sellerName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedSellerReviews(sellerReviews);
      setSelectedSellerName(sellerName);
      setOpenSellerDrawer(true);
    },
    []
  );

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const checkIsInOtherColors = (
    currentVariant: ProductVariant,
    currentColor: string
  ): boolean => {
    if (!product?.variants) return false;
    return product.variants.some(
      (v: any) =>
        v.color?.toLowerCase() !== currentColor.toLowerCase() &&
        variantAttributes.every(
          (attr) =>
            v.specifications?.[attr.name] ===
            currentVariant.specifications?.[attr.name]
        ) &&
        v.isActive !== false &&
        (v.offers?.some(
          (o: any) => o.isActive !== false && (o.stock ?? 0) > 0
        ) ||
          (v.stock ?? 0) > 0)
    );
  };

  const calculateDiscount = (mrp: number, selling: number): number => {
    if (!mrp || !selling || mrp <= selling) return 0;
    return Math.round(((mrp - selling) / mrp) * 100);
  };

  const formatDistance = (distance?: number | null): string => {
    if (distance === null || distance === undefined || isNaN(distance)) return '';
    if (distance < 1) return '<1 km';
    return `${distance.toFixed(1)} km`;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    fallbackSize: '50' | '600'
  ) => {
    const placeholder = fallbackSize === '50' ? PLACEHOLDER_50 : PLACEHOLDER_600;
    (e.target as HTMLImageElement).src = placeholder;
  };

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    sellerOffers.forEach((offer: any) => {
      const sellerId =
        typeof offer?.seller === 'string' ? offer.seller : offer?.seller?._id;
      if (sellerId && !sellerReviewState.reviewsBySeller[sellerId]) {
        dispatch(fetchSellerReviews({ sellerId }));
      }
    });
  }, [sellerOffers, dispatch]);

  useEffect(() => {
    const fetchSellerOffersData = async () => {
      if (!selectedVariantId || !product?._id) {
        setSellerOffers([]);
        setSelectedSellerOffer(null);
        setIsCatalogProduct(false);
        return;
      }

      const isCatalog = !!(product?.catalog && product.catalog._id);
      setIsCatalogProduct(isCatalog);

      try {
        if (isCatalog && product.catalog?._id) {
          const params: any = {};
          if (locationFilter?.type === 'current' && locationFilter.coordinates) {
            params.userLat = locationFilter.coordinates.lat;
            params.userLng = locationFilter.coordinates.lng;
            params.radiusKm = locationFilter.radiusKm || 50;
          } else if (locationFilter?.type === 'district' && locationFilter.district) {
            params.district = locationFilter.district;
          }

          const response = await api.get(
            `/api/catalog/${product.catalog._id}/offers`,
            { params }
          );

          if (response.data.success && response.data.data.offers?.length > 0) {
            let offersWithVariant = response.data.data.offers.filter(
              (offer: any) =>
                offer.variants?.some(
                  (v: any) =>
                    v._id === selectedVariantId &&
                    v.isActive !== false
                )
            );

            if (locationFilter?.type === 'district' && locationFilter.district) {
              offersWithVariant = offersWithVariant.filter(
                (offer: any) => offer.seller?.district === locationFilter.district
              );
            }

            // ✅ If coming from seller profile, filter to only that seller's offer
            if (sellerIdFromProfile) {
              offersWithVariant = offersWithVariant.filter(
                (offer: any) =>
                  String(offer.seller?._id || offer.seller) === String(sellerIdFromProfile)
              );
            }

            setSellerOffers(offersWithVariant);

            if (offersWithVariant.length > 0) {
              // ✅ Always select the first seller by default
              setSelectedSellerOffer(offersWithVariant[0]);
            }
          }
        } else {
          const variant = product?.variants?.find(
            (v: any) => v._id === selectedVariantId
          );

          if (variant?.offers && variant.offers.length > 0) {
            let activeOffers = variant.offers.filter(
              (o: any) => o.isActive !== false
            );

            if (locationFilter?.type === 'district' && locationFilter.district) {
              activeOffers = activeOffers.filter(
                (o: any) => o.seller?.district === locationFilter.district
              );
            }

            // ✅ If coming from seller profile, filter to only that seller's offer
            if (sellerIdFromProfile) {
              activeOffers = activeOffers.filter(
                (o: any) =>
                  String(o.seller?._id || o.seller) === String(sellerIdFromProfile)
              );
            }

            const formattedOffers = activeOffers.map((offer: any) => {
              const sellerId =
                typeof offer.seller === 'string'
                  ? offer.seller
                  : offer.seller?._id;
              return {
                _id: offer._id,
                seller: {
                  _id: sellerId,
                  businessDetails: offer.seller?.businessDetails,
                  sellerName: offer.seller?.sellerName,
                  district: offer.seller?.district,
                },
                variants: [
                  {
                    _id: selectedVariantId,
                    ...variant,
                    sellingPrice: offer.sellingPrice,
                    mrpPrice: offer.mrpPrice,
                    stock: offer.stock,
                  },
                ],
                minPrice: offer.sellingPrice,
                maxPrice: offer.sellingPrice,
                distance: offer.distance ?? null,
                isReturnable: offer.isReturnable,
                returnTAT: offer.returnTAT,
                isReplaceable: offer.isReplaceable,
                replacementTAT: offer.replacementTAT,
                hasDeliveryCharge: offer.hasDeliveryCharge,
                deliveryChargePrice: offer.deliveryChargePrice,
                freeDeliveryRadiusKM: offer.freeDeliveryRadiusKM,
              };
            });

            setSellerOffers(formattedOffers);

            if (formattedOffers.length > 0) {
              // ✅ Always select the first seller by default
              setSelectedSellerOffer(formattedOffers[0]);
            }
          }
        }
      } catch (error) {
        console.error('❌ [Seller Offers] Failed to fetch:', error);
        setSellerOffers([]);
      }
    };

    fetchSellerOffersData();
  }, [
    selectedVariantId,
    product?._id,
    product?.catalog?._id,
    product?.variants,
    locationFilter,
    sellerIdFromProfile,
  ]);

  useEffect(() => {
    let checkCategoriesInterval: ReturnType<typeof setTimeout> | undefined;
    let isMounted = true;

    if (productId) {
      const currentProduct = products.product;
      if (!currentProduct || currentProduct._id !== productId) {
        dispatch(fetchProductById({ productId, locationFilter }));
      }
      dispatch(fetchReviewsByProductId({ productId }));
    }

    if (categoryId && attributeState.length === 0 && !attributesLoading) {
      const fetchAttributesIfSlugExists = (cats: Category[]) => {
        const foundCategory = cats.find((cat: Category) => cat._id === categoryId);
        // ✅ Use _id since categoryId (slug) is removed from Category model
        if (foundCategory?._id) {
          dispatch(
            fetchCategoryAttributes({
              categoryId: foundCategory._id,
              includeInactive: false,
            })
          );
          return true;
        }
        return false;
      };

      const cats = categoryState?.categories || [];
      const handled = fetchAttributesIfSlugExists(cats);

      if (!handled && isMounted) {
        checkCategoriesInterval = setInterval(() => {
          if (!isMounted) {
            clearInterval(checkCategoriesInterval);
            return;
          }
          const updatedCats = categoryState?.categories || [];
          if (fetchAttributesIfSlugExists(updatedCats) && checkCategoriesInterval) {
            clearInterval(checkCategoriesInterval);
            checkCategoriesInterval = undefined;
          }
        }, 500);
      }
    }

    return () => {
      isMounted = false;
      if (checkCategoriesInterval) clearInterval(checkCategoriesInterval);
    };
  }, [
    productId,
    categoryId,
    dispatch,
    products.product?._id,
    attributeState.length,
    attributesLoading,
    categoryState?.categories,
    locationFilter,
  ]);

  // ─── Memos ───────────────────────────────────────────────────────────────────

  const { variantAttributes, highlightAttributes } = useMemo(() => {
    if (!attributeState || attributeState.length === 0)
      return { variantAttributes: [], highlightAttributes: [] };

    const variantAttrs: CategoryAttribute[] = attributeState.filter(
      (attr: CategoryAttribute) =>
        (attr.isVariantField === true ||
          attr.name.toLowerCase() === 'ram' ||
          attr.name.toLowerCase() === 'storage') &&
        attr.isActive === true
    );

    const highlightAttrs: CategoryAttribute[] = attributeState.filter(
      (attr: CategoryAttribute) =>
        (attr.displayInHighlights === true ||
          [
            'brand',
            'networktype',
            'esimsupport',
            'processorbrand',
            'processorseries',
          ].includes(attr.name.toLowerCase())) &&
        attr.isVariantField !== true &&
        attr.isActive === true
    );

    variantAttrs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    highlightAttrs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return { variantAttributes: variantAttrs, highlightAttributes: highlightAttrs };
  }, [attributeState]);

  const currentVariant = useMemo(() => {
    if (isCatalogProduct && selectedSellerOffer && selectedVariantId) {
      const variant = selectedSellerOffer.variants?.find(
        (v: any) => v._id === selectedVariantId && v.isActive !== false
      );
      if (!variant) return null;
      const activeOffer = variant.offers?.find((o: any) => o.isActive !== false);
      if (activeOffer) {
        return {
          ...variant,
          sellingPrice: activeOffer.sellingPrice,
          mrpPrice: activeOffer.mrpPrice,
          stock: activeOffer.stock,
          sku: activeOffer.sku,
          offerId: activeOffer._id,
          offerSeller: activeOffer.seller,
          _id: variant._id,
        };
      }
      return variant;
    }

    if (!product?.variants || !selectedVariantId) return null;
    const variant = product.variants.find(
      (v) => v._id === selectedVariantId && v.isActive !== false
    );
    if (!variant) return null;

    const activeOffer = variant.offers?.find((o: any) => o.isActive !== false);
    if (activeOffer) {
      return {
        ...variant,
        sellingPrice: activeOffer.sellingPrice,
        mrpPrice: activeOffer.mrpPrice,
        stock: activeOffer.stock,
        sku: activeOffer.sku,
        offerId: activeOffer._id,
        offerSeller: activeOffer.seller,
        _id: variant._id,
      };
    }
    return variant;
  }, [isCatalogProduct, selectedSellerOffer, product?.variants, selectedVariantId]);

  const colorsWithImages = useMemo(() => {
    const sourceProduct =
      isCatalogProduct && selectedSellerOffer ? selectedSellerOffer : product;
    if (!sourceProduct?.variants || !sourceProduct.variants.length) return [];

    const colorMap = new Map<
      string,
      { color: string; images: string[]; variants: any[] }
    >();

    sourceProduct.variants
      .filter((v: any) => v.isActive !== false && v.color)
      .forEach((v: any) => {
        if (!colorMap.has(v.color)) {
          colorMap.set(v.color, { color: v.color, images: [], variants: [] });
        }
        colorMap.get(v.color)!.variants.push(v);
        if (v.images && Array.isArray(v.images)) {
          v.images.forEach((img: string) => {
            const securedImg = secureUrl(img, 800);
            if (securedImg && securedImg.trim() !== '' && !colorMap.get(v.color)!.images.includes(securedImg)) {
              colorMap.get(v.color)!.images.push(securedImg);
            }
          });
        }
      });

    let colorsArray = Array.from(colorMap.values());

    // ✅ If coming from seller profile, only show colors that seller has in stock
    if (sellerIdFromProfile) {
      colorsArray = colorsArray.filter((colorData) =>
        colorData.variants.some((variant: any) =>
          variant.offers?.some(
            (o: any) =>
              String(o.seller?._id || o.seller) === String(sellerIdFromProfile) &&
              o.isActive !== false &&
              (o.stock ?? 0) > 0
          )
        )
      );
    } else if (locationFilter?.type === 'district' && locationFilter.district) {
      const targetDistrict = locationFilter.district;
      colorsArray = colorsArray.filter((colorData) =>
        colorData.variants.some((variant) => {
          const hasOwnOffer = variant.offers?.some(
            (offer: any) =>
              offer.seller?.district === targetDistrict &&
              offer.isActive !== false &&
              (offer.stock ?? 0) > 0
          );
          const hasSellerOffer = sellerOffers.some((offer: any) => {
            const variantInOffer = offer.variants?.find(
              (v: any) => v._id === variant._id
            );
            return (
              variantInOffer &&
              offer.seller?.district === targetDistrict &&
              (variantInOffer.stock ?? 0) > 0
            );
          });
          return hasOwnOffer || hasSellerOffer;
        })
      );
    } else {
      // ✅ Show colors even if out of stock, so users can still see product images & details
      colorsArray = colorsArray.filter((colorData) =>
        colorData.variants.some((variant) => variant.isActive !== false)
      );
    }

    return colorsArray;
  }, [
    isCatalogProduct,
    selectedSellerOffer,
    product?.variants,
    sellerOffers,
    locationFilter,
    sellerIdFromProfile,
  ]);

  // ✅ FIX: Reset the ref whenever the product changes so a fresh auto-select can run
  useEffect(() => {
    sellerProfileVariantSelectedRef.current = false;
    setSelectedColor('');
    setSelectedVariantId('');
    setSelectedSpecs({});
    setSelectedSize('');
    setSelectedImage(0);
  }, [product?._id]);

  // ✅ FIX: Auto-select first color whenever colorsWithImages populates and no color is chosen yet
  useEffect(() => {
    if (
      colorsWithImages &&
      Array.isArray(colorsWithImages) &&
      colorsWithImages.length > 0 &&
      !selectedColor
    ) {
      const firstColor = colorsWithImages[0].color;
      if (firstColor) setSelectedColor(firstColor);
    }
  }, [colorsWithImages, selectedColor]);

  const availableVariantsForColor = useMemo(() => {
    if (!selectedColor) return [];

    const baseVariants = product?.variants || [];
    let colorFiltered = baseVariants.filter(
      (v: any) =>
        v.color?.toLowerCase() === selectedColor.toLowerCase() &&
        v.isActive !== false
    );

    // ✅ If coming from seller profile, only show variants that seller has in stock
    if (sellerIdFromProfile) {
      colorFiltered = colorFiltered.filter((variant: any) =>
        variant.offers?.some(
          (o: any) =>
            String(o.seller?._id || o.seller) === String(sellerIdFromProfile) &&
            o.isActive !== false &&
            (o.stock ?? 0) > 0
        )
      );
    } else if (locationFilter?.type === 'district' && locationFilter.district) {
      colorFiltered = colorFiltered.filter((variant: any) => {
        const hasOfferInDistrict = variant.offers?.some(
          (offer: any) =>
            offer.seller?.district === locationFilter.district &&
            offer.isActive !== false &&
            (offer.stock ?? 0) > 0
        );
        const hasSellerOfferInDistrict = sellerOffers.some((offer: any) => {
          const variantInOffer = offer.variants?.find(
            (v: any) => v._id === variant._id
          );
          return (
            variantInOffer &&
            offer.seller?.district === locationFilter.district &&
            (variantInOffer.stock ?? 0) > 0
          );
        });
        return hasOfferInDistrict || hasSellerOfferInDistrict;
      });
    }

    if (!isCatalogProduct && sellerOffers.length > 0 && !sellerIdFromProfile) {
      const offerVariants = sellerOffers
        .flatMap((offer: any) => offer.variants || [])
        .filter(
          (v: any) =>
            v.color?.toLowerCase() === selectedColor.toLowerCase() &&
            v.isActive !== false
        );

      let filteredOfferVariants = offerVariants;
      if (locationFilter?.type === 'district' && locationFilter.district) {
        filteredOfferVariants = offerVariants.filter((v: any) => {
          const matchingOffer = sellerOffers.find(
            (offer: any) =>
              offer.variants?.some((ov: any) => ov._id === v._id) &&
              offer.seller?.district === locationFilter.district
          );
          return !!matchingOffer;
        });
      }

      const allVariants = [...colorFiltered, ...filteredOfferVariants];
      return allVariants.filter(
        (v, index, self) => index === self.findIndex((t) => t._id === v._id)
      );
    }

    return colorFiltered;
  }, [
    selectedColor,
    isCatalogProduct,
    sellerOffers,
    product?.variants,
    locationFilter,
    sellerIdFromProfile,
  ]);

  // ✅ FIX: Main variant auto-selection effect
  // When coming from seller profile: always select first available variant once
  //   availableVariantsForColor is ready (don't gate on !selectedVariantId so
  //   it reliably fires even on re-renders before offers load).
  // Normal flow: keep the existing !selectedVariantId guard.
  useEffect(() => {
    const variants = product?.variants;
    if (
      !variants ||
      !Array.isArray(variants) ||
      variants.length === 0 ||
      !selectedColor ||
      availableVariantsForColor.length === 0
    ) {
      return;
    }

    if (sellerIdFromProfile) {
      // ── Seller-profile path ──────────────────────────────────────────────────
      // We want to auto-select the first variant that this specific seller has
      // in stock. We run this whenever availableVariantsForColor changes AND
      // we haven't already locked in a selection for this product+seller combo.
      if (sellerProfileVariantSelectedRef.current) return;

      let firstAvailable = availableVariantsForColor.find((v: any) =>
        v.isActive !== false &&
        v.offers?.some(
          (o: any) =>
            String(o.seller?._id || o.seller) === String(sellerIdFromProfile) &&
            o.isActive !== false &&
            (o.stock ?? 0) > 0
        )
      );

      if (!firstAvailable) {
        firstAvailable = availableVariantsForColor.find((v: any) =>
          v.isActive !== false &&
          v.offers?.some(
            (o: any) =>
              String(o.seller?._id || o.seller) === String(sellerIdFromProfile) &&
              o.isActive !== false
          )
        );
      }

      if (firstAvailable) {
        sellerProfileVariantSelectedRef.current = true; // lock so user can change freely after
        setSelectedVariantId(firstAvailable._id || '');
        if (firstAvailable.specifications) {
          setSelectedSpecs(firstAvailable.specifications as Record<string, string>);
          const variantLabels = variantAttributes
            .map((attr) => firstAvailable.specifications?.[attr.name])
            .filter(Boolean);
          const fallbackSpecs = [firstAvailable.specifications?.ram || firstAvailable.specifications?.RAM, firstAvailable.specifications?.storage || firstAvailable.specifications?.Storage].filter(Boolean).join(' + ');
          const combinedLabel =
            variantLabels.length > 0
              ? variantLabels.join(' + ')
              : fallbackSpecs || Object.values(firstAvailable.specifications || {}).filter(Boolean).join(' + ') || 'Standard';
          setSelectedSize(combinedLabel);
        }
        setSelectedImage(0);
      }
    } else {
      // ── Normal path (no seller filter) ──────────────────────────────────────
      // Only auto-select when no variant is chosen yet (preserve manual selection)
      if (selectedVariantId) return;

      let firstAvailable = availableVariantsForColor.find(
        (v: any) =>
          v.isActive !== false &&
          v.offers?.some(
            (o: any) => o.isActive !== false && (o.stock ?? 0) > 0
          )
      );

      if (!firstAvailable) {
        firstAvailable = availableVariantsForColor.find(
          (v: any) => v.isActive !== false
        );
      }

      if (firstAvailable) {
        setSelectedVariantId(firstAvailable._id || '');
        if (firstAvailable.specifications) {
          setSelectedSpecs(firstAvailable.specifications as Record<string, string>);
          const variantLabels = variantAttributes
            .map((attr) => firstAvailable.specifications?.[attr.name])
            .filter(Boolean);
          const fallbackSpecs = [firstAvailable.specifications?.ram || firstAvailable.specifications?.RAM, firstAvailable.specifications?.storage || firstAvailable.specifications?.Storage].filter(Boolean).join(' + ');
          const combinedLabel =
            variantLabels.length > 0
              ? variantLabels.join(' + ')
              : fallbackSpecs || Object.values(firstAvailable.specifications || {}).filter(Boolean).join(' + ') || 'Standard';
          setSelectedSize(combinedLabel);
        }
        setSelectedImage(0);
      }
    }
  }, [
    product?.variants,
    selectedColor,
    availableVariantsForColor,
    variantAttributes,
    sellerIdFromProfile,
    selectedVariantId,
  ]);

  const displayImages = useMemo(() => {
    const sourceProduct =
      isCatalogProduct && selectedSellerOffer
        ? selectedSellerOffer
        : product;

    if (!sourceProduct) return [];

    // ✅ FIRST PRIORITY: show currently selected variant images
    if (
      currentVariant?.images &&
      currentVariant.images.length > 0 &&
      selectedVariantId
    ) {
      return currentVariant.images
        .filter((img: string) => img && img.trim() !== "")
        .map((img: string) => secureUrl(img, 800));
    }

    // ✅ SECOND PRIORITY: show seller-specific variant images
    if (selectedColor && sourceProduct.variants) {
      const matchingVariant = availableVariantsForColor.find(
        (v: any) => v._id === selectedVariantId
      );

      if (matchingVariant?.images && matchingVariant.images.length > 0) {
        return matchingVariant.images
          .filter((img: string) => img && img.trim() !== "")
          .map((img: string) => secureUrl(img, 800));
      }

      const colorData = colorsWithImages.find(
        (c) => c.color === selectedColor
      );

      if (colorData?.images && colorData.images.length > 0) {
        return colorData.images
          .filter((img: string) => img && img.trim() !== "")
          .map((img: string) => secureUrl(img, 800));
      }
    }

    // ✅ LAST FALLBACK: product images
    const rawImages = (sourceProduct.images || []).filter(
      (img: string) => img && img.trim() !== ""
    );

    return rawImages.map((img: string) => secureUrl(img, 800));
  }, [

    isCatalogProduct,
    selectedSellerOffer,
    product,
    currentVariant,
    selectedColor,
    selectedVariantId,
    colorsWithImages,
    availableVariantsForColor,
  ]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleColorSelect = useCallback(
    (color: string, variantId?: string) => {
      setSelectedColor(color);
      setSelectedSpecs({});
      setSelectedVariantId('');
      setSelectedSize('');
      setSelectedImage(0);
      // ✅ FIX: Allow re-auto-selection when user manually switches color
      // (only relevant for seller-profile path)
      sellerProfileVariantSelectedRef.current = false;
      if (variantId) setSelectedVariantId(variantId);
    },
    []
  );

  const handleVariantSelect = useCallback(
    (variant: ProductVariant) => {
      if (variant._id === selectedVariantId) return; // Prevent deselecting seller on double click
      
      setSelectedVariantId(variant._id || '');
      if (variant.specifications) {
        setSelectedSpecs(variant.specifications as Record<string, string>);
        const variantLabels = variantAttributes
          .map((attr) => variant.specifications?.[attr.name])
          .filter(Boolean);
        const combinedLabel =
          variantLabels.length > 0
            ? variantLabels.join(' + ')
            : `${variant.specifications?.storage || ''} + ${variant.specifications?.ram || ''}`.trim() ||
            'Default';
        setSelectedSize(combinedLabel);
      }
      setSelectedSellerOffer(null);
      // ✅ FIX: Once user manually picks a variant, lock the ref so auto-select
      // doesn't override their choice on the next render cycle
      sellerProfileVariantSelectedRef.current = true;
    },
    [variantAttributes, selectedVariantId]
  );

  const handleAddCart = useCallback(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      setSnackbarMessage('Please login to add items to cart');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!productId || !currentVariant) {
      setSnackbarMessage('Please select a variant');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (currentVariant.stock !== undefined && currentVariant.stock < quantity) {
      setSnackbarMessage(`Only ${currentVariant.stock} items in stock`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const sellerId =
      selectedSellerOffer?.seller?._id ||
      selectedSellerOffer?.seller ||
      currentVariant.offerSeller?._id ||
      currentVariant.offerSeller ||
      (isCatalogProduct ? undefined : product?.seller?._id);

    const offerId = selectedSellerOffer?._id || currentVariant.offerId;

    const cartRequest = {
      productId,
      quantity,
      variantId: currentVariant._id,
      sellerId,
      size: selectedSize || currentVariant.color || 'Default',
      color: selectedColor,
      specifications:
        Object.keys(selectedSpecs).length > 0 ? selectedSpecs : undefined,
      ...(offerId && { offerId }),
    };

    dispatch(addItemToCart({ jwt, request: cartRequest })).then((result) => {
      if (addItemToCart.fulfilled.match(result)) {
        dispatch(fetchUserCart(jwt));
        setSnackbarMessage('Item added to cart successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(
          (result.payload as string) || 'Failed to add item to cart'
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    });
  }, [
    productId,
    currentVariant,
    selectedColor,
    selectedSpecs,
    selectedSize,
    quantity,
    isCatalogProduct,
    selectedSellerOffer,
    product?.seller?._id,
    dispatch,
  ]);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const renderVariantAttributeSelectors = () => {
    if (!product || variantAttributes.length === 0 || !selectedColor) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <MemoryIcon fontSize="small" color="primary" />
          Subvariant:{' '}
          {currentVariant
            ? `${currentVariant.specifications?.[variantAttributes[0]?.name]} + ${currentVariant.specifications?.[variantAttributes[1]?.name]}`
            : 'Select subvariant'}
        </Typography>

        <Grid container spacing={2}>
          {availableVariantsForColor.map((variant: ProductVariant) => {
            const isSelected = selectedVariantId === variant._id;
            const variantLabels = variantAttributes
              .map((attr) => variant.specifications?.[attr.name])
              .filter(Boolean);
            const combinedLabel = variantLabels.join(' + ');
            const isInOtherColors = checkIsInOtherColors(variant, selectedColor);
            const hasActiveOffer = variant.offers?.some(
              (o: any) => o.isActive !== false && (o.stock ?? 0) > 0
            );

            return (
              <Grid key={variant._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  onClick={() => {
                    if (hasActiveOffer || isInOtherColors)
                      handleVariantSelect(variant);
                  }}
                  sx={{
                    cursor:
                      hasActiveOffer || isInOtherColors
                        ? 'pointer'
                        : 'not-allowed',
                    border: isSelected
                      ? '2px solid #ff9f00'
                      : '1px solid #e0e0e0',
                    '&:hover': hasActiveOffer
                      ? { borderColor: '#ff9f00', boxShadow: 2 }
                      : {},
                    transition: 'all 0.2s',
                    opacity: !hasActiveOffer && !isInOtherColors ? 0.6 : 1,
                    borderRadius: 2,
                    position: 'relative',
                    bgcolor: isSelected ? '#fff8e1' : 'white',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body1"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {combinedLabel}
                    </Typography>
                    {!hasActiveOffer && (
                      <Typography
                        variant="caption"
                        color={isInOtherColors ? 'text.secondary' : 'error'}
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {isInOtherColors
                          ? 'Available in other colours'
                          : 'Out of Stock'}
                      </Typography>
                    )}
                    {isSelected && (
                      <CheckCircle
                        sx={{
                          color: '#ff9f00',
                          fontSize: 20,
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderProductHighlights = () => {
    if (!product || highlightAttributes.length === 0 || !currentVariant) return null;
    const productHighlights = product.highlights || {};
    const highlightValues = { ...productHighlights, ...currentVariant.specifications };

    return (
      <Paper
        sx={{
          p: 3,
          mt: 3,
          bgcolor: 'success.50',
          border: '1px solid',
          borderColor: 'success.light',
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}
        >
          <CheckCircle color="success" fontSize="small" />
          🔸 Product Highlights
        </Typography>
        <Grid container spacing={2}>
          {highlightAttributes.map((attr: CategoryAttribute) => {
            const value =
              highlightValues[attr.name] ||
              highlightValues[attr.name?.toLowerCase()] ||
              currentVariant.specifications?.[attr.name] ||
              currentVariant.specifications?.[attr.name?.toLowerCase()];
            if (!value) return null;
            return (
              <Grid key={attr.name} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 18, mt: 0.2 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {attr.label}:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {typeof value === 'boolean'
                        ? value
                          ? 'Yes'
                          : 'No'
                        : String(value)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  const renderSellerOffers = () => {
    if (!isCatalogProduct || sellerOffers.length === 0 || !selectedVariantId)
      return null;

    return (
      <Paper
        sx={{
          p: 3,
          mt: 3,
          bgcolor: 'warning.50',
          border: '1px solid',
          borderColor: 'warning.light',
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <StoreIcon color="warning" />
          🏪 Select Seller ({sellerOffers.length} offers)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Compare prices and choose the best offer from different sellers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sellerOffers.map((offer) => {
            const variant = offer.variants.find(
              (v: any) => v._id === selectedVariantId
            );
            if (!variant) return null;
            const isSelected = selectedSellerOffer?._id === offer._id;
            const sellerName =
              offer.seller?.businessDetails?.businessName ||
              offer.seller?.sellerName ||
              (typeof offer.seller === 'string' ? 'Loading...' : 'Seller');

            return (
              <Box
                key={offer._id}
                onClick={() => setSelectedSellerOffer(offer)}
                sx={{
                  p: 2,
                  border: isSelected ? '2px solid #ff9f00' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#fff8e1' : 'white',
                  '&:hover': { borderColor: '#ff9f00', boxShadow: 1 },
                  transition: 'all 0.2s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={(e) => handleNavigateToSeller(offer, e)}
                    >
                      {sellerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ✓{' '}
                      {variant.stock > 0
                        ? `${variant.stock} in stock`
                        : 'Out of stock'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {variant.mrpPrice && variant.mrpPrice > variant.sellingPrice && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          ₹{variant.mrpPrice.toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ₹{variant.sellingPrice.toLocaleString()}
                      </Typography>
                    </Box>
                    {variant.mrpPrice && variant.mrpPrice > variant.sellingPrice && (
                      <Chip
                        label={`${Math.round(((variant.mrpPrice - variant.sellingPrice) / variant.mrpPrice) * 100)}% off`}
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                    {isSelected && (
                      <Chip label="Selected" size="small" color="success" sx={{ mt: 1 }} />
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    );
  };


  const [activeTab, setActiveTab] = useState(0);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [discriptionOpen, setdiscriptionOpen] = useState(false);
  const [reviewsOpen, setreviewsOpen] = useState(false);
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);

  let productBenefits = [];
  if (selectedSellerOffer) {
    if (selectedSellerOffer.isReturnable) {
      productBenefits.push({ id: 'return', icon: FaUndoAlt, label: `${selectedSellerOffer.returnTAT || '7'} Days Return` });
    }
    
    if (selectedSellerOffer.isReplaceable) {
      productBenefits.push({ id: 'replace', icon: LuGitCompareArrows, label: `${selectedSellerOffer.replacementTAT || '7'} Days Replacement` });
    }

    productBenefits.push({ id: 'pod', icon: FaMoneyBillWave, label: "Pay on Delivery" });

    if (selectedSellerOffer.hasDeliveryCharge && selectedSellerOffer.deliveryChargePrice > 0) {
      productBenefits.push({ id: 'delivery', icon: FaTruck, label: `₹${selectedSellerOffer.deliveryChargePrice} Delivery` });
      if (selectedSellerOffer.freeDeliveryRadiusKM) {
        productBenefits.push({ id: 'free-del-radius', icon: FaTruck, label: `Free under ${selectedSellerOffer.freeDeliveryRadiusKM}km` });
      }
    } else {
      productBenefits.push({ id: 'delivery', icon: FaTruck, label: "Free Delivery" });
    }
    
    productBenefits.push({ id: 'brand', icon: FaStar, label: "Top Brand" });
    productBenefits.push({ id: 'secure', icon: FaLock, label: "Secure Transaction" });
  } else {
    productBenefits = [
      { id: 1, icon: FaUndoAlt, label: "7 Days Return" },
      { id: 2, icon: FaMoneyBillWave, label: "Pay on Delivery" },
      { id: 3, icon: FaTruck, label: "Free Delivery" },
      { id: 4, icon: FaStar, label: "Top Brand" },
      { id: 5, icon: FaLock, label: "Secure Transaction" },
    ];
  }

  const renderProductDetailsContent = () => (
    <div className="flex flex-col gap-8 w-full">
      {currentVariant?.specifications && Object.keys(currentVariant.specifications).length > 0 && (
        <div className="w-full">
          <h4 className="text-[16px] sm:text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MemoryIcon className="text-orange-500" fontSize="small" /> Specifications
          </h4>
          <div className="bg-gray-50/50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="flex flex-col divide-y divide-gray-200">
                {Object.entries(currentVariant.specifications).filter((_, i) => i % 2 === 0).map(([key, value]) => (
                  <div className="flex justify-between p-4 hover:bg-white transition-colors" key={key}>
                    <span className="text-gray-500 font-medium capitalize text-sm">{key}</span>
                    <span className="text-gray-900 font-semibold text-right text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col divide-y divide-gray-200">
                {Object.entries(currentVariant.specifications).filter((_, i) => i % 2 !== 0).map(([key, value]) => (
                  <div className="flex justify-between p-4 hover:bg-white transition-colors" key={key}>
                    <span className="text-gray-500 font-medium capitalize text-sm">{key}</span>
                    <span className="text-gray-900 font-semibold text-right text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {product?.highlights && Object.keys(product.highlights).length > 0 && (
        <div className="w-full mt-2">
          <h4 className="text-[16px] sm:text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <WorkspacePremiumIcon className="text-orange-500" fontSize="small" /> Highlights
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(product.highlights).map(([key, value]) => (
              <div className="bg-white border border-orange-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300 flex items-start gap-3 group" key={key}>
                <CheckCircle className="text-orange-400 group-hover:text-orange-600 transition-colors shrink-0 mt-0.5" fontSize="small" />
                <div>
                  <span className="block text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">{key}</span>
                  <span className="text-sm text-gray-800 font-medium leading-snug">{String(value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleBuyNow = () => {
    handleAddCart();
    navigate('/cart');
  };

  const context = { windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200 };
  return (
    <>
      <div className="!py-2">
        <div className="container mx-auto px-4 sm:px-10 lg:px-20 pt-4">
          <Breadcrumbs aria-label="breadcrumb">
            <Link to="/" className="link transition !text-[14px]">
              Home
            </Link>
            {(() => {
              const cat: any = product?.category;
              const crumbs = [];
              if (cat?.parentCategory?.parentCategory) {
                crumbs.push(
                  <Link key="grandparent" to={`/${cat.parentCategory.parentCategory.categoryId}`} className="link transition !text-[14px]">
                    {cat.parentCategory.parentCategory.name}
                  </Link>
                );
              }
              if (cat?.parentCategory) {
                crumbs.push(
                  <Link key="parent" to={`/${cat.parentCategory.parentCategory?.categoryId || ''}/${cat.parentCategory.categoryId}`} className="link transition !text-[14px]">
                    {cat.parentCategory.name}
                  </Link>
                );
              }
              return crumbs;
            })()}
            <span className="text-gray-700 !text-[14px]">{product?.title}</span>
          </Breadcrumbs>
        </div>
      </div>

      <section className="bg-white !py-5">
        <div className="container mx-auto px-4 sm:px-10 lg:px-20">
          {products.loading || catalogLoading ? (
            <Box sx={{ textAlign: 'center', py: 10, minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CustomLoader />
            </Box>
          ) : !product ? (
            <Alert severity="error">Product not found</Alert>
          ) : (
            <>
              {/* ✅ PRODUCT ROW - Image Gallery + Content */}
              <div className="flex !gap-1 flex-col lg:flex-row">
                <ProductImageGallery
                  displayImages={displayImages}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  productTitle={product.title}
                  open={open}
                  handleOpen={handleOpen}
                  handleClose={handleClose}
                  handleImageError={handleImageError}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={handleToggleWishlist}
                />

                <div className="productContent w-full lg:w-[60%] md:pr-10 md:pl-10">
                  <h1 className="text-[18px] sm:text-[22px] font-[600] mb-2">
                    {product.title}
                  </h1>
                  {(review?.reviews?.length || 0) > 0 && (
                    <div className="flex items-start sm:items-center flex-col sm:flex-row md:flex-row lg:flex-row gap-3 justify-start">

                      {(() => {
                        const totalReviews = review?.reviews?.length || 0;
                        const totalStars = review?.reviews?.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) || 0;
                        const averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;
                        return <Rating value={averageRating} size="small" readOnly precision={0.5} />;
                      })()}
                      <span className="text-[13px] cursor-pointer text-orange-600" onClick={() => setActiveTab(2)}>
                        Review({review?.reviews?.length})
                      </span>
                    </div>
                  )}

                  {/* COLOR VARIANTS */}
                  {colorsWithImages.length > 0 && (hasColorAttribute || colorsWithImages.length > 1) && (
                    <div className="mt-5">
                      <h2 className="text-sm font-bold mb-3 flex items-center gap-1 text-[#212121]">
                        {colorVariantLabel}: <span className="font-normal text-[#5c5c5c]">{selectedColor}</span>
                      </h2>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {colorsWithImages.map((colorObj: any, index: number) => {
                          const isSelected = selectedColor === colorObj.color;
                          return (
                            <div key={index} className="flex flex-col items-center gap-1.5">
                              <div
                                className={`group relative w-[70px] h-[70px] lg:h-[90px] lg:w-[90px] border rounded-xl p-1 cursor-pointer flex-shrink-0 ${isSelected ? "border-orange-600 border-2" : "border-gray-200 hover:border-gray-400"}`}
                                onClick={() => handleColorSelect(colorObj.color)}
                              >
                                <img
                                  src={colorObj.images[0] || PLACEHOLDER_50}
                                  alt={colorObj.color}
                                  width="70"
                                  height="70"
                                  className="w-full h-full object-contain rounded-lg"
                                  onError={(e) => handleImageError(e, '50')}
                                />
                              </div>
                              <span className={`text-[10px] sm:text-xs text-center leading-tight w-[70px] lg:w-[90px] truncate ${isSelected ? "font-bold text-gray-900" : "font-medium text-gray-500"}`} title={colorObj.color}>
                                {colorObj.color}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SIZE VARIANTS */}
                  {(() => {
                    const isSubvariantSectionRedundant = selectedColor && availableVariantsForColor.length > 0 && availableVariantsForColor.every((v: any) => {
                      const variantLabels = variantAttributes.map((attr: any) => v.specifications?.[attr.name]).filter(Boolean);
                      const fallbackSpecs = [v.specifications?.ram || v.specifications?.RAM, v.specifications?.storage || v.specifications?.Storage].filter(Boolean).join(' + ');
                      const sizeLabel = variantLabels.length > 0
                        ? variantLabels.join(' + ')
                        : (fallbackSpecs || Object.values(v.specifications || {}).filter(Boolean).join(' + ') || 'Standard');
                        
                      if (!sizeLabel || sizeLabel === 'Standard') return false;
                      
                      const cleanVariantColor = selectedColor.toLowerCase().replace(/\s/g, '');
                      const cleanSizeLabel = sizeLabel.toLowerCase().replace(/\s/g, '');
                      
                      return cleanVariantColor.includes(cleanSizeLabel) || cleanSizeLabel.includes(cleanVariantColor);
                    });

                    if (isSubvariantSectionRedundant || availableVariantsForColor.length === 0) return null;

                    return (
                      <div className="mt-5">
                        <div className="flex items-center gap-3 mb-3">
                          <h2 className="text-sm font-bold flex items-center gap-1 text-[#212121]">
                            {subVariantLabel}: <span className="font-normal text-[#5c5c5c]">{selectedSize || `Select ${subVariantLabel}`}</span>
                          </h2>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {availableVariantsForColor.map((v: any) => {
                            const isSelected = selectedVariantId === v._id;
                            const variantLabels = variantAttributes.map((attr: any) => v.specifications?.[attr.name]).filter(Boolean);
                            const fallbackSpecs = [v.specifications?.ram || v.specifications?.RAM, v.specifications?.storage || v.specifications?.Storage].filter(Boolean).join(' + ');
                            const sizeLabel = variantLabels.length > 0
                              ? variantLabels.join(' + ')
                              : (fallbackSpecs || Object.values(v.specifications || {}).filter(Boolean).join(' + ') || 'Standard');
                            
                            const activeOffer = v.offers?.find(
                              (o: any) => o.isActive !== false && (o.stock ?? 0) > 0
                            );
                            const hasActiveOffer = !!activeOffer || ((v.stock ?? 0) > 0);

                            // We want to still render the subvariant button even if there's no active offer with stock,
                            // so the user can select it and see that it is out of stock.
                            // if (!hasActiveOffer) return null;

                            return (
                              <button
                                key={v._id}
                                onClick={() => handleVariantSelect(v)}
                                className={`p-3 text-center border rounded-xl transition-all min-w-[120px] ${isSelected ? "border-orange-600 border-2 bg-orange-50" : "border-gray-200 text-[#5c5c5c] hover:border-gray-400 bg-white"}`}
                              >
                                <div className={`text-sm ${isSelected ? 'font-bold text-[#c24100]' : 'font-medium text-[#5c5c5c]'}`}>
                                  {sizeLabel}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* PRICE */}
                  {(() => {
                    if (!currentVariant) return null;

                    const sellingPrice = selectedSellerOffer ?
                      selectedSellerOffer.variants.find((v: any) => v._id === selectedVariantId)?.sellingPrice :
                      currentVariant.sellingPrice;

                    const mrpPrice = selectedSellerOffer ?
                      selectedSellerOffer.variants.find((v: any) => v._id === selectedVariantId)?.mrpPrice :
                      currentVariant.mrpPrice;

                    const stock = selectedSellerOffer ?
                      selectedSellerOffer.variants.find((v: any) => v._id === selectedVariantId)?.stock :
                      currentVariant.stock;

                    return (
                      <div className="price mt-4 flex flex-col sm:flex-row md:flex-row lg:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          {mrpPrice > sellingPrice && (
                            <span className="oldPrice text-sm text-gray-500 line-through">
                              ₹{mrpPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[20px] font-[600] text-[#c24100]">
                            ₹{sellingPrice?.toLocaleString()}
                          </span>
                          {mrpPrice > sellingPrice && (
                            <span className="text-green-700 text-sm font-medium ml-2">
                              {calculateDiscount(mrpPrice, sellingPrice)}% off
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px]">
                            Available In Stock:
                            <span className="text-green-700 text-[14px] ml-1 font-bold">
                              {stock}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SELLER INFO */}
                  {sellerOffers.length > 0 && (
                    <div className="my-8 text-sm space-y-3">
                      <h3 className="font-semibold mb-2">Select Seller ({sellerOffers.length} offers)</h3>
                      {sellerOffers.map((offer: any) => {
                        const isSelected = selectedSellerOffer?._id === offer._id;
                        const isExpanded = expandedSellerId === offer._id;
                        const sellerName = offer.seller?.businessDetails?.businessName || offer.seller?.sellerName || 'Seller';
                        const variant = offer.variants.find((v: any) => v._id === selectedVariantId);
                        if (!variant) return null;

                        return (
                          <div
                            key={offer._id}
                            className={`border rounded-lg p-3 transition-all duration-300 ease-out hover:shadow-md ${isSelected ? "border-orange-500 bg-orange-50 shadow-lg scale-[1.01]" : "border-gray-200 bg-white"}`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setSelectedSellerOffer(offer)}
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  readOnly
                                  aria-label={`Select seller ${sellerName}`}
                                  className="accent-orange-600 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800 hover:underline" onClick={(e) => handleNavigateToSeller(offer, e)}>
                                      {sellerName}
                                    </span>
                                    {(() => {
                                      const sellerReviews = offer.seller?._id ? sellerReviewState.reviewsBySeller[offer.seller._id] || [] : [];
                                      const reviewCount = sellerReviews.length;
                                      if (reviewCount === 0) return null;
                                      const avg = sellerReviews.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / reviewCount;
                                      return (
                                        <div
                                          className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-1 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSellerReviews(sellerReviews);
                                            setOpenSellerDrawer(true);
                                          }}
                                        >
                                          <Rating value={avg} size="small" readOnly precision={0.5} />
                                          <span className="text-[10px] text-gray-500">({reviewCount})</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  className="flex items-center gap-1 text-gray-500 text-xs hover:text-orange-600 transition"
                                  onClick={() => setExpandedSellerId(isExpanded ? null : offer._id)}
                                >
                                  <span>{isExpanded ? "Hide details" : "View details"}</span>
                                  <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`} size={14} />
                                </button>
                              </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100 mt-3 pt-3 border-t" : "max-h-0 opacity-0"}`}>
                              <div className="text-gray-700 space-y-1.5 text-xs">
                                <p>
                                  <span className="font-medium">Price:</span> ₹{variant.sellingPrice.toLocaleString()}
                                  {variant.mrpPrice > variant.sellingPrice && (
                                    <>
                                      <del className="text-gray-400 ml-1">₹{variant.mrpPrice.toLocaleString()}</del>
                                      <span className="text-green-600 ml-1 font-medium">Save {calculateDiscount(variant.mrpPrice, variant.sellingPrice)}%</span>
                                    </>
                                  )}
                                </p>
                                <p>
                                  <span className="font-medium">Stock:</span> {variant.stock} units available
                                </p>
                                {offer.seller?.district && (
                                  <p>
                                    <span className="font-medium">Location:</span> {offer.seller.district}
                                    {typeof offer.distance === 'number' && !isNaN(offer.distance) && (
                                      <span className="text-blue-600 font-medium ml-1">~{formatDistance(offer.distance)} away</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PRODUCT BENEFITS */}
                  <div className="mt-4 py-3">
                    <Swiper
                      speed={5000}
                      direction="horizontal"
                      loop={true}
                      freeMode={true}
                      autoplay={{ delay: 0, disableOnInteraction: false }}
                      modules={[Autoplay, FreeMode]}
                      className="w-full product-benefits-swiper swiper-free-mode"
                      breakpoints={{
                        0: { slidesPerView: 3, spaceBetween: 5 },
                        400: { slidesPerView: 4, spaceBetween: 10 },
                        765: { slidesPerView: 3, spaceBetween: 20 },
                        1000: { slidesPerView: 4, spaceBetween: 20 },
                        1200: { slidesPerView: 5, spaceBetween: 24 }
                      }}
                    >
                      {[...productBenefits, ...productBenefits].map((item, index) => (
                        <SwiperSlide key={`${item.id}-${index}`} style={{ width: 'auto' }}>
                          <div className="flex flex-col items-center justify-center text-center px-2">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-50 border border-orange-100 mb-2">
                              <item.icon className="text-orange-600 text-xl" />
                            </div>
                            <p className="text-xs text-orange-700 font-medium whitespace-nowrap">
                              {item.label}
                            </p>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* QUANTITY + ADD TO CART */}
                  <div className="flex flex-wrap items-center gap-3 py-4 w-full">
                    <div className="flex items-center justify-between px-3 h-[48px] w-[120px] rounded-[18px] bg-[#f0f3f8] border border-[#e2e8f0] text-[#1e293b]">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[#e2e8f0] rounded-full transition-colors text-lg font-medium">&minus;</button>
                      <span className="text-base font-bold select-none">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#e2e8f0] rounded-full transition-colors text-lg font-medium">&#43;</button>
                    </div>

                    <button
                      className="flex items-center justify-center gap-2 h-[48px] px-8 rounded-[18px] bg-orange-700 border border-orange-800 text-white hover:bg-orange-800 hover:shadow-sm transition-all shadow-orange-600/30 font-bold text-base whitespace-nowrap"
                      onClick={handleAddCart}
                    >
                      <MdOutlineShoppingCart className="text-[20px]" />
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ TABS SECTION */}
              <div className="mt-10 w-full border-t border-gray-200 pt-5">
                {context.windowWidth < 992 && (
                  <div className="flex flex-col gap-3 px-2 sm:px-0">
                    <Accordion
                      expanded={productDetailsOpen}
                      onChange={() => setProductDetailsOpen(!productDetailsOpen)}
                      elevation={0}
                      className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm overflow-hidden before:!hidden transition-all duration-300"
                    >
                      <AccordionSummary 
                        expandIcon={productDetailsOpen ? <FiMinus className="text-orange-500 text-xl" /> : <FiPlus className="text-gray-500 text-xl" />}
                        className="hover:bg-orange-50/30 transition-colors data-[expanded=true]:border-b data-[expanded=true]:border-gray-100"
                      >
                        <h3 className={`font-bold text-base py-1 ${productDetailsOpen ? 'text-orange-600' : 'text-gray-800'}`}>Product Details</h3>
                      </AccordionSummary>
                      <AccordionDetails className="bg-gray-50/30 p-4">
                        <div className="bg-white rounded-[16px] p-4 sm:p-5 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-4 px-1">
                            <MemoryIcon className="text-orange-500 text-xl" />
                            <h4 className="text-lg font-bold text-gray-900">Specifications</h4>
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {currentVariant?.specifications && Object.entries(currentVariant.specifications).map(([key, value]) => (
                              <div className="flex justify-between items-center bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-orange-50/30 transition-colors" key={key}>
                                <span className="text-gray-500 font-medium text-sm">{key}</span>
                                <span className="text-gray-900 font-bold text-sm text-right max-w-[60%]">{String(value)}</span>
                              </div>
                            ))}
                            {product?.highlights && Object.entries(product.highlights).map(([key, value]) => (
                              <div className="flex justify-between items-center bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-orange-50/30 transition-colors" key={`hl-${key}`}>
                                <span className="text-gray-500 font-medium text-sm">{key}</span>
                                <span className="text-gray-900 font-bold text-sm text-right max-w-[60%]">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      expanded={discriptionOpen}
                      onChange={() => setdiscriptionOpen(!discriptionOpen)}
                      elevation={0}
                      className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm overflow-hidden before:!hidden transition-all duration-300"
                    >
                      <AccordionSummary 
                        expandIcon={discriptionOpen ? <FiMinus className="text-orange-500 text-xl" /> : <FiPlus className="text-gray-500 text-xl" />}
                        className="hover:bg-orange-50/30 transition-colors data-[expanded=true]:border-b data-[expanded=true]:border-gray-100"
                      >
                        <h3 className={`font-bold text-base py-1 ${discriptionOpen ? 'text-orange-600' : 'text-gray-800'}`}>Description</h3>
                      </AccordionSummary>
                      <AccordionDetails className="bg-gray-50/30 p-4">
                        <div className="w-full p-4 rounded-xl text-sm text-gray-700 whitespace-pre-line bg-white border border-gray-100 shadow-sm leading-relaxed">
                          {product?.description || "No description available."}
                        </div>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      expanded={reviewsOpen}
                      onChange={() => setreviewsOpen(!reviewsOpen)}
                      elevation={0}
                      className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm overflow-hidden before:!hidden transition-all duration-300"
                    >
                      <AccordionSummary 
                        expandIcon={reviewsOpen ? <FiMinus className="text-orange-500 text-xl" /> : <FiPlus className="text-gray-500 text-xl" />}
                        className="hover:bg-orange-50/30 transition-colors data-[expanded=true]:border-b data-[expanded=true]:border-gray-100"
                      >
                        <h3 className={`font-bold text-base py-1 ${reviewsOpen ? 'text-orange-600' : 'text-gray-800'}`}>Reviews</h3>
                      </AccordionSummary>
                      <AccordionDetails className="bg-gray-50/30 !p-2 sm:!p-4 overflow-hidden box-border">
                        <div className="rounded-xl bg-white sm:border sm:border-gray-100 sm:shadow-sm overflow-hidden box-border p-2 sm:p-4">
                          <React.Suspense fallback={<div>Loading Reviews...</div>}>
                            <ProductReviewsTab review={review} productId={productId} />
                          </React.Suspense>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                )}

                {context.windowWidth > 992 && (
                  <div className="pt-10">
                    <div className="pill-radio-container mb-8 mt-2">
                      <input
                        type="radio"
                        id="tab-0"
                        name="tab-radio"
                        value="0"
                        checked={activeTab === 0}
                        onChange={() => setActiveTab(0)}
                      />
                      <label htmlFor="tab-0">Description</label>

                      <input
                        type="radio"
                        id="tab-1"
                        name="tab-radio"
                        value="1"
                        checked={activeTab === 1}
                        onChange={() => setActiveTab(1)}
                      />
                      <label htmlFor="tab-1">Product Details</label>

                      <input
                        type="radio"
                        id="tab-2"
                        name="tab-radio"
                        value="2"
                        checked={activeTab === 2}
                        onChange={() => setActiveTab(2)}
                      />
                      <label htmlFor="tab-2">Reviews ({review?.reviews?.length || 0})</label>


                    </div>

                    {activeTab === 0 && (
                      <div className="shadow-sm border border-gray-100 w-full py-5 px-8 rounded-2xl bg-white">
                        <div className="bg-[#f8fafc] rounded-[24px] p-5 sm:p-8 border border-[#e2e8f0]">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                              <span className="text-xl">📝</span>
                            </div>
                            <h4 className="text-xl font-bold text-[#1e293b]">Product Overview</h4>
                          </div>
                          <div className="text-[15px] leading-relaxed text-[#475569] whitespace-pre-line">
                            {product?.description || "No description available for this product."}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="shadow-sm border border-gray-100 w-full py-5 px-8 rounded-md">
                        <div className="bg-[#f0f4f8] rounded-[24px] p-4 sm:p-6 border border-[#e2e8f0]">
                          <div className="flex items-center gap-2 mb-4 px-1">
                            <MemoryIcon className="text-teal-500 text-xl" />
                            <h4 className="text-lg font-bold text-[#1e293b]">Specifications</h4>
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {currentVariant?.specifications && Object.entries(currentVariant.specifications).map(([key, value]) => (
                              <div className="flex justify-between items-center bg-white/40 border border-[#cbd5e1] rounded-[16px] px-5 py-3" key={key}>
                                <span className="text-[#64748b] text-sm">{key}</span>
                                <span className="text-[#0f172a] font-bold text-sm text-right max-w-[60%]">{String(value)}</span>
                              </div>
                            ))}
                            {product?.highlights && Object.entries(product.highlights).map(([key, value]) => (
                              <div className="flex justify-between items-center bg-white/40 border border-[#cbd5e1] rounded-[16px] px-5 py-3" key={`hl-${key}`}>
                                <span className="text-[#64748b] text-sm">{key}</span>
                                <span className="text-[#0f172a] font-bold text-sm text-right max-w-[60%]">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="w-full py-5 rounded-md">
                        <React.Suspense fallback={<div>Loading Reviews...</div>}>
                          <ProductReviewsTab review={review} productId={productId} />
                        </React.Suspense>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SIMILAR PRODUCTS */}
      {!catalogLoading && (
        <section className="container mx-auto pt-10 px-4 sm:px-10 lg:px-20 mb-10">
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <React.Suspense fallback={<div className="h-40">Loading Similar Products...</div>}>
            <SmilarProduct />
          </React.Suspense>
        </section>
      )}

      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity as any} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Drawer
        anchor="right"
        open={openSellerDrawer}
        onClose={() => setOpenSellerDrawer(false)}
      >
        <Box sx={{ width: { xs: 320, sm: 450, md: 550 }, p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Seller Reviews</h2>
            <IconButton onClick={() => setOpenSellerDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          {selectedSellerReviews.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="mb-2">
                <React.Suspense fallback={<div>Loading Ratings...</div>}>
                  <RatingCard reviews={selectedSellerReviews} />
                </React.Suspense>
              </div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-2">Detailed Reviews</h3>
              <div className="flex flex-col gap-4">
                {selectedSellerReviews.map((rev: any, index: number) => (
                  <React.Suspense fallback={<div>Loading Review...</div>} key={index}>
                    <ProductReviewCard item={rev} />
                  </React.Suspense>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <p className="text-gray-500 font-medium">No reviews found for this seller.</p>
            </div>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ProductDetails;
