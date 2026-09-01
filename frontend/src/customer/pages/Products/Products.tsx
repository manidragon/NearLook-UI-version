// D:\Mani\Code with Zosh\Backup\source code\frontend\src\customer\pages\Products\Products.tsx
import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard/ProductCard";
import FilterSection from "./FilterSection";
import { Box, FormControl, IconButton, MenuItem, Pagination, Select, type SelectChangeEvent, useMediaQuery, useTheme, Typography, Drawer as MuiDrawer } from '@mui/material';

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchCategories } from "../../../redux/Admin/CategorySlice";
import type { Category } from "../../../types/categoryTypes";
import { getAllProducts, selectLocationFilter } from "../../../redux/Customer/ProductSlice";
import "./Products.css";
import CustomLoader from "../../../components/CustomLoader";

const Products = () => {
  const [sort, setSort] = React.useState("");
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const [showFilter, setShowFilter] = useState(false);
  const { categoryId } = useParams(); // MongoDB ObjectId from URL
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products);
  const categoryState = useAppSelector((state) => state.category);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const locationFilter = useAppSelector(selectLocationFilter);

  // ✅ Fetch categories if not already loaded
  useEffect(() => {
    if (categoryState.categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryState.categories.length]);

  // ✅ Helper to resolve slug from ObjectId (for FilterSection only)
  const getCategorySlugFromId = useMemo(() => {
    return (id: string | undefined): string | undefined => {
      if (!id || !categoryState.categories?.length) return undefined;

      const category = categoryState.categories.find(
        (cat: Category) => cat._id === id
      );

      // ✅ Use _id since categoryId (slug) is removed from Category model
      return category?._id;
    };
  }, [categoryState.categories]);

  // ✅ Compute slug ONLY for FilterSection (category attributes API)
  const categorySlug = useMemo(() => {
    return getCategorySlugFromId(categoryId) || categoryId;
  }, [categoryId, getCategorySlugFromId]);

  // ✅ Get category name for display
  const categoryName = useMemo(() => {
    if (!categoryId) return 'Products';

    const category = categoryState.categories.find(
      (cat: Category) => cat._id === categoryId
    );

    if (category?.name) {
      return category.name;
    }

    return categoryId
      .split('_')
      .map((item: string) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ');
  }, [categoryId, categoryState.categories]);

  const handleSortProduct = (event: SelectChangeEvent) => {
    setSort(event.target.value as string);
  };

  const handleShowFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handlePageChange = (value: any) => {
    setPage(value);
  };

// ✅✅✅ FIX: Collect ALL filter params including dynamic attribute filters
useEffect(() => {
  // Skip if no categoryId from URL
  if (!categoryId) return;

  const [minPrice, maxPrice] = searchParams.get("price")?.split("-") || [];
  
  // ✅✅✅ NEW: Collect ALL search params as filters (including dynamic attributes)
  const allFilterParams: Record<string, any> = {};
  
  // Known filter params
  if (searchParams.get("brand")) allFilterParams.brand = searchParams.get("brand");
  if (searchParams.get("color")) allFilterParams.color = searchParams.get("color");
  if (minPrice) allFilterParams.minPrice = Number(minPrice);
  if (maxPrice) allFilterParams.maxPrice = Number(maxPrice);
  if (searchParams.get("discount")) {
    allFilterParams.minDiscount = Number(searchParams.get("discount"));
  }
  
  // ✅✅✅ NEW: Collect dynamic attribute filters (ram, storage, size, etc.)
  // Exclude known params to get only attribute filters
  const knownParams = ['price', 'brand', 'color', 'discount', 'sort', 'page', 'category'];
  searchParams.forEach((value, key) => {
    if (!knownParams.includes(key) && value) {
      allFilterParams[key] = value; // e.g., ram: "8GB,16GB", storage: "128GB"
    }
  });

  const validSort = sort && ['price_low', 'price_high'].includes(sort) ? sort : '';
  

  // ✅ Send ALL filters to API
  dispatch(getAllProducts({ 
    category: categoryId,  // ObjectId for products API
    sort: validSort, 
    pageNumber: page - 1,
    locationFilter,  // ✅ Pass location filter from Redux
    ...allFilterParams  // ✅ Spread all filter params
  }));
}, [searchParams, categoryId, sort, page, dispatch, locationFilter]); // ✅ Dependencies trigger re-fetch on filter change

// ✅ NEW: Reset to page 1 when locationFilter changes
useEffect(() => {
  if (locationFilter) {
    setPage(1);  // Reset to first page when district/location changes
  }
}, [locationFilter]);
  // ✅ Safe products array getter
  const productsToRender = products.products || [];

  return (
    <div className="bg-[#f5f5f5] min-h-screen text-gray-900 font-sans">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 pb-20">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm p-4 rounded-2xl mb-6 sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
              <LocalMallIcon fontSize="small" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 m-0 tracking-tight leading-tight">{categoryName}</h1>
              <p className="text-xs text-gray-500 m-0">Browse through our collection</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-y-3 gap-x-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-gray-500 hidden sm:block">Results:</span>
              <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{productsToRender.length}</span>
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-[200px] sm:min-w-0 sm:w-auto justify-end">
              <FormControl size="small" sx={{ minWidth: '120px', flex: { xs: 1, sm: 'none' } }}>
                <Select
                  value={sort}
                  onChange={handleSortProduct}
                  displayEmpty
                  IconComponent={ExpandMoreIcon}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        mt: 1,
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f3f4f6',
                        '& .MuiMenuItem-root': {
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#4b5563',
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#ffedd5',
                            color: '#ea580c',
                            '&:hover': {
                              backgroundColor: '#ffedd5',
                            }
                          }
                        }
                      }
                    }
                  }}
                  sx={{ 
                    bgcolor: 'white', 
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb', borderWidth: '1px' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fed7aa', borderWidth: '1px' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316', borderWidth: '2px' },
                    '& .MuiSelect-icon': { color: '#9ca3af' }
                  }}
                  inputProps={{ 'aria-label': 'Sort By' }}
                >
                  <MenuItem value=""><em>Sort By</em></MenuItem>
                  <MenuItem value={"price_low"}>Price: Low to High</MenuItem>
                  <MenuItem value={"price_high"}>Price: High to Low</MenuItem>
                </Select>
              </FormControl>
              
              {/* Mobile Filter Toggle */}
              {!isLarge && (
                <button 
                  onClick={handleShowFilter}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-1.5 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
                >
                  <FilterAltIcon fontSize="small" className="text-orange-500" />
                  Filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Desktop Left Sidebar: Filters */}
          {isLarge && (
            <aside className="w-[280px] shrink-0 sticky top-[92px]">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <FilterSection categoryId={categorySlug} />
              </div>
            </aside>
          )}

          {/* Mobile Filter Drawer */}
          <MuiDrawer 
            anchor="bottom" 
            open={showFilter && !isLarge} 
            onClose={() => setShowFilter(false)}
            PaperProps={{ 
              sx: { 
                height: '85vh', 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24,
                bgcolor: '#fff'
              } 
            }}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 m-0">
                <FilterAltIcon className="text-orange-500" />
                Filters
              </h2>
              <IconButton onClick={() => setShowFilter(false)} size="small" sx={{ bgcolor: 'gray.50' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="px-4 pb-10">
              <FilterSection categoryId={categorySlug} />
            </div>
          </MuiDrawer>

          {/* Right Content: Products Grid */}
          <section className="flex-1 w-full min-h-[60vh]">
            
            {products.loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', py: 20 }}>
                <CustomLoader sx={{ color: '#f97316' }} />
                <Typography className="text-gray-500 font-medium text-sm animate-pulse">Loading products...</Typography>
              </Box>
            ) : productsToRender.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {productsToRender.map((item: any) => (
                  <ProductCard key={item._id} item={item} categoryId={categoryId} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center mt-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <SearchIcon sx={{ fontSize: 32, color: '#9ca3af' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  We couldn't find any products matching your current filters. Try removing some filters to see more results.
                </p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {products.totalPages > 1 && (
              <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex justify-center">
                <Pagination
                  page={page}
                  onChange={(e, value) => handlePageChange(value)}
                  count={products.totalPages || 1}
                  shape="rounded"
                  size={isLarge ? "medium" : "small"}
                  sx={{
                    '& .MuiPaginationItem-root': { fontWeight: 500, borderRadius: '8px' },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#f97316',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
                      '&:hover': {
                        backgroundColor: '#ea580c',
                      }
                    }
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;