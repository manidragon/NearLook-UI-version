// frontend/src/customer/pages/Products/FilterSection.tsx

import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  Typography,
  Collapse,
  IconButton,
  InputBase,
} from "@mui/material";


import { discount } from "../../../data/Filter/discount";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { api } from "../../../Config/Api";
import {
  fetchCategoryAttributes,
  selectCategoryAttributes,
} from "../../../redux/Admin/CategoryAttributeSlice";

import type { CategoryAttribute } from "../../../types/categoryAttributeTypes";
import CustomCheckbox from "../../components/CustomCheckbox";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

interface FilterSectionProps {
  categoryId?: string;
}

interface ExpandedSections {
  [key: string]: boolean;
  color: boolean;
  price: boolean;
  discount: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ categoryId: propCategoryId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const categoryAttributes = useAppSelector(selectCategoryAttributes);
  const categoryState = useAppSelector((state: any) => state.category);
  const products = useAppSelector((state) => state.products.products);

  const [attributeSearches, setAttributeSearches] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    color: false,
    price: false,
    discount: false,
  });

  const urlCategoryId = searchParams.get("category");
  const reduxCategoryId =
    categoryState?.selectedCategory?.categoryId ||
    categoryState?.selectedCategory?._id;

  const categoryId = propCategoryId || urlCategoryId || reduxCategoryId;

  // ✅ NEW: Fetch base products to determine available options (ignoring current filters)
  const [baseProducts, setBaseProducts] = useState<any[]>([]);

  useEffect(() => {
    if (categoryId) {
      // Find category to check level
      const category = categoryState?.categories?.find((c: any) => c._id === categoryId || c.categoryId === categoryId);
      
      // Only fetch attributes for Level 3 categories to avoid API errors
      if (category && category.level === 3) {
        dispatch(fetchCategoryAttributes({ categoryId, includeInactive: false }));
      }
      
      // Fetch all products for this category to build available facets
      api.get(`/products?category=${categoryId}&limit=1000`)
        .then(res => {
          if (res.data && res.data.data) {
            setBaseProducts(res.data.data);
          }
        })
        .catch(console.error);
    }
  }, [categoryId, dispatch, categoryState?.categories]);

  const allAttributes = useMemo(() => {
    return categoryAttributes
      .filter((attr: CategoryAttribute) => {
        return (
          attr.isActive &&
          attr.type === "select" &&
          attr.isFilterable === true
        );
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categoryAttributes]);

  const hasColorAttribute = useMemo(() => {
    return categoryAttributes?.some((a: any) => a.isColorVariantField);
  }, [categoryAttributes]);

  // ✅ FIXED COLOR LOGIC
  const getAvailableColors = () => {
    const map = new Map<string, string>();

    // Use baseProducts instead of products to keep options stable
    baseProducts?.forEach((product: any) => {
      product?.variants?.forEach((variant: any) => {
        if (!variant?.color) return;

        // Verify the variant actually has at least one active, approved offer with a valid price
        const hasActiveOffer = variant?.offers?.some((o: any) => 
          o?.isActive !== false && 
          (o?.approvalStatus?.toUpperCase() === 'APPROVED' || !o?.approvalStatus) && 
          o?.sellingPrice > 0
        );

        if (variant?.isActive !== false && hasActiveOffer) {
          const normalized = variant.color.trim().toLowerCase(); // normalize
          const display = normalized.charAt(0).toUpperCase() + normalized.slice(1); // Title Case

          map.set(normalized, display);
        }
      });
    });

    return Array.from(map.values());
  };

  const handleToggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAttributeFilterChange = (attrName: string, value: string, checked: boolean) => {
    const currentValues = searchParams.get(attrName)?.split(",") || [];

    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    if (newValues.length > 0) {
      searchParams.set(attrName, newValues.join(","));
    } else {
      searchParams.delete(attrName);
    }

    setSearchParams(searchParams);
  };

  const getSelectedValues = (name: string) =>
    searchParams.get(name)?.split(",") || [];

  const filterOptions = (options: string[], search: string) => {
    if (!search) return options;
    return options.filter((o) =>
      o.toLowerCase().includes(search.toLowerCase())
    );
  };

  const renderHeader = (title: string, key: string) => (
    <Box
      onClick={() => handleToggleSection(key)}
      sx={{ display: "flex", justifyContent: "space-between", cursor: "pointer", py: 1.5 }}
      className="group"
    >
      <Typography sx={{ fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', color: '#212121' }}>
        {title}
      </Typography>
      <IconButton 
        size="small" 
        sx={{ color: '#878787', padding: 0, '&:hover': { bgcolor: 'transparent' } }}
        aria-label={`Toggle ${title} filter`}
      >
        {expandedSections[key] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </IconButton>
    </Box>
  );

// ✅ Dynamic price ranges from DB
const getAvailablePriceRanges = () => {
  return [
    { min: 0, max: 500 },
    { min: 500, max: 1000 },
    { min: 1000, max: 2000 },
    { min: 2000, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: 50000 },
  ];
};


// ✅ FILTER DISCOUNT BASED ON DB
const getAvailableDiscountRanges = () => {
  return discount;
};

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 m-0">
            Filters
          </h2>
          <p className="text-xs text-gray-500 m-0 mt-0.5">Results update instantly.</p>
        </div>
        <button 
          type="button"
          onClick={() => setSearchParams({})}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">

        {/* ✅ COLOR FILTER */}
        {hasColorAttribute && (
          <section className="border-b border-gray-100 py-3 mx-3">
            {renderHeader("Color", "color")}

          <Collapse in={expandedSections.color}>
            <Box sx={{ px: 1, pb: 1, pt: 1 }}>
              {getSelectedValues("color").length > 0 && (
                <Box 
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2, color: '#f97316', fontSize: '12px', fontWeight: 600, '&:hover': { color: '#ea580c' } }}
                  onClick={() => {
                    searchParams.delete("color");
                    setSearchParams(searchParams);
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, mr: 0.5 }} /> Clear selected
                </Box>
              )}
              
              <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 mb-3 border border-gray-100 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-300 transition-all">
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 18, mr: 1 }} />
                <InputBase 
                  placeholder="Search color..."
                  value={attributeSearches['color'] || ''}
                  onChange={(e) => setAttributeSearches(prev => ({...prev, color: e.target.value}))}
                  sx={{ fontSize: '13px', width: '100%', color: '#374151' }}
                />
              </div>
            </Box>

            <Box sx={{ maxHeight: 220, overflowY: "auto", display: 'flex', flexDirection: 'column', gap: 1, px: 1, pb: 2 }} className="custom-scrollbar">
              {filterOptions(getAvailableColors(), attributeSearches['color'] || '').map((color) => (
                <CustomCheckbox
                  key={color}
                  id={`color-${color}`}
                  label={color}
                  checked={getSelectedValues("color").includes(color.toLowerCase())}
                  onChange={(e) =>
                    handleAttributeFilterChange(
                      "color",
                      color.toLowerCase(),
                      e.target.checked
                    )
                  }
                />
              ))}
            </Box>
          </Collapse>
        </section>
        )}

        {/* ✅ ATTRIBUTE FILTERS */}
        {allAttributes.map((attr) => {
          const key = `attr_${attr.name}`;
          const selected = getSelectedValues(attr.name);

          // ✅ Show only options that exist in the base products
          const configuredOptions = attr.options || [];
          let options: string[] = [];

          const hasBaseProducts = baseProducts && baseProducts.length > 0;
          if (hasBaseProducts) {
            const productValues = new Set<string>();

            baseProducts.forEach((product: any) => {
              const value = product?.highlights?.[attr.name];

              if (value !== undefined && value !== null) {
                if (typeof value === "boolean") {
                  productValues.add(value ? "Yes" : "No");
                } else {
                  productValues.add(String(value).trim());
                }
              }

              product?.variants?.forEach((variant: any) => {
                const hasActiveOffer = variant?.offers?.some((o: any) => 
                  o?.isActive !== false && (o?.approvalStatus === 'APPROVED' || !o?.approvalStatus) && o?.sellingPrice > 0
                );
                if (variant?.isActive !== false && hasActiveOffer) {
                  const specValue =
                    variant?.specifications?.[attr.name] ||
                    variant?.[attr.name];

                  if (specValue) {
                    productValues.add(String(specValue).trim());
                  }
                }
              });
            });

            if (configuredOptions.length > 0) {
              const normalizedProductValues = new Set(Array.from(productValues).map(v => v.toLowerCase()));
              options = configuredOptions.filter(opt => normalizedProductValues.has(opt.toLowerCase()));
            } else {
              options = Array.from(productValues);
            }
          }

          options = filterOptions(options, attributeSearches[attr.name] || "");

          if (options.length === 0) return null;

          return (
            <section key={attr.name} className="border-b border-gray-100 py-3 mx-3">
              {renderHeader(attr.label, key)}

              <Collapse in={expandedSections[key]}>
                <Box sx={{ px: 1, pb: 1, pt: 1 }}>
                  {selected.length > 0 && (
                    <Box 
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2, color: '#f97316', fontSize: '12px', fontWeight: 600, '&:hover': { color: '#ea580c' } }}
                      onClick={() => {
                        searchParams.delete(attr.name);
                        setSearchParams(searchParams);
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14, mr: 0.5 }} /> Clear selected
                    </Box>
                  )}
                  
                  <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 mb-3 border border-gray-100 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-300 transition-all">
                    <SearchIcon sx={{ color: '#9ca3af', fontSize: 18, mr: 1 }} />
                    <InputBase 
                      placeholder={`Search ${attr.label}...`}
                      value={attributeSearches[attr.name] || ''}
                      onChange={(e) => setAttributeSearches(prev => ({...prev, [attr.name]: e.target.value}))}
                      sx={{ fontSize: '13px', width: '100%', color: '#374151' }}
                    />
                  </div>
                </Box>

                <Box sx={{ maxHeight: 220, overflowY: "auto", display: 'flex', flexDirection: 'column', gap: 1, px: 1, pb: 2 }} className="custom-scrollbar">
                  {options.map((opt) => (
                    <CustomCheckbox
                      key={opt}
                      id={`${attr.name}-${opt}`}
                      label={opt}
                      checked={selected.includes(opt)}
                      onChange={(e) =>
                        handleAttributeFilterChange(
                          attr.name,
                          opt,
                          e.target.checked
                        )
                      }
                    />
                  ))}
                </Box>
              </Collapse>
            </section>
          );
        })}

        {/* ✅ PRICE (DYNAMIC - FIXED) */}
        <section className="border-b border-gray-100 py-3 mx-3">
          {renderHeader("Price", "price")}

          <Collapse in={expandedSections.price}>
            <RadioGroup
              sx={{ px: 1, pb: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
              value={`${searchParams.get("minPrice") || ""}-${searchParams.get("maxPrice") || ""}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split("-");
                if (min && max) {
                  searchParams.set("minPrice", min);
                  searchParams.set("maxPrice", max);
                } else {
                  searchParams.delete("minPrice");
                  searchParams.delete("maxPrice");
                }
                setSearchParams(searchParams);
              }}
            >
              <FormControlLabel
                value="-"
                sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '13px', color: '#4b5563', fontWeight: 500 } }}
                control={<Radio size="small" sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#f97316' }, padding: '4px 8px 4px 0' }} />}
                label="Any Price"
              />
              {getAvailablePriceRanges().map((range, i) => (
                <FormControlLabel
                  key={i}
                  value={`${range.min}-${range.max}`}
                  sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '13px', color: '#4b5563', fontWeight: 500 } }}
                  control={<Radio size="small" sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#f97316' }, padding: '4px 8px 4px 0' }} />}
                  label={`₹${range.min} - ₹${range.max}`}
                />
              ))}
            </RadioGroup>
          </Collapse>
        </section>

        {/* DISCOUNT */}
        <section className="py-3 mx-3 mb-6">
          {renderHeader("Discount", "discount")}
          <Collapse in={expandedSections.discount}>
           <RadioGroup
              sx={{ px: 1, pb: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
              value={`${searchParams.get("minDiscount") || ""}-${searchParams.get("maxDiscount") || ""}`}
              onChange={(e) => {
                const value = e.target.value;
                const [min, max] = value.split("-");

                if (min && max) {
                  searchParams.set("minDiscount", min);
                  searchParams.set("maxDiscount", max);
                } else {
                  searchParams.delete("minDiscount");
                  searchParams.delete("maxDiscount");
                }
                setSearchParams(searchParams);
              }}
            >
              <FormControlLabel 
                value="-" 
                sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '13px', color: '#4b5563', fontWeight: 500 } }}
                control={<Radio size="small" sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#f97316' }, padding: '4px 8px 4px 0' }} />} 
                label="Any Discount" 
              />
              {getAvailableDiscountRanges().map((d) => (
                <FormControlLabel 
                  key={d.value} 
                  value={d.value} 
                  sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '13px', color: '#4b5563', fontWeight: 500 } }}
                  control={<Radio size="small" sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#f97316' }, padding: '4px 8px 4px 0' }} />} 
                  label={d.name} 
                />
              ))}
            </RadioGroup>
          </Collapse>
        </section>

      </div>
    </div>
  );
};

export default FilterSection;