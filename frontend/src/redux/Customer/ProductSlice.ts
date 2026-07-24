// D:\Mani\Code with Zosh\Backup\source code\frontend\src\redux\Customer/ProductSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Product } from "../../types/productTypes";
import { type RootState } from "../Store";
import { api } from "../../Config/Api";

// Define the base URL for the API
const API_URL = "/products";

// ✅ FIX 1: ADD LocationFilter interface
export interface LocationFilter {
  type: 'current' | 'district';
  coordinates?: { lat: number; lng: number };
  district?: string;
  radiusKm?: number; // Default: 50km for current location
}

// ✅ FIX 2: UPDATE ProductState interface with locationFilter
interface ProductState {
  product: Product | null;
  products: Product[];
  paginatedProducts: any;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchProduct: Product[];
  followedSellerProducts: Product[];
  recentlyAddedProducts: Product[];
  topSellingProducts: Product[];
  productsNearYou: Product[];
  
  // ✅ NEW: Location filter state
  locationFilter: LocationFilter | null;
  currentPage: number; // ✅ ADD: Track current page for pagination reset
}

// ✅ FIX 3: UPDATE initialState with locationFilter and currentPage
const initialState: ProductState = {
  product: null,
  products: [],
  paginatedProducts: null,
  totalPages: 1,
  loading: false,
  error: null,
  searchProduct: [],
  followedSellerProducts: [],
  recentlyAddedProducts: [],
  topSellingProducts: [],
  productsNearYou: [],
  
  // ✅ NEW: Initialize location fields
  locationFilter: null,
  currentPage: 0,
};

// Create async thunks for API calls
export const fetchProductById = createAsyncThunk<Product, { productId: string; locationFilter?: LocationFilter | null }>(
  "products/fetchProductById",
  async ({ productId, locationFilter }, { rejectWithValue, getState }) => {
    try {
      // ✅ Get location from Redux state if not passed explicitly
      const state = getState() as RootState;
      const filter = locationFilter ?? state.products.locationFilter;

      // ✅ Build params with location
      const params: any = {};
      if (filter?.type === 'current' && filter.coordinates) {
        params.userLat = filter.coordinates.lat;
        params.userLng = filter.coordinates.lng;
        params.radiusKm = filter.radiusKm || 50;
      } else if (filter?.type === 'district' && filter.district) {
        params.district = filter.district;
      }

      const response = await api.get<Product>(`${API_URL}/${productId}`, { params });
      return response.data;
    } catch (error: any) {
      console.log("error ", error.response);
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred');
    }
  }
);

export const fetchFollowedSellerProducts = createAsyncThunk<Product[], void>(
  "products/fetchFollowedSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products/followed-sellers");
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to fetch followed seller products");
    }
  }
);

export const fetchRecentlyAddedProducts = createAsyncThunk<Product[], void>(
  "products/fetchRecentlyAddedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products?sort=newest&limit=12");
      return response.data?.data || response.data?.content || response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to fetch recently added products");
    }
  }
);

export const fetchTopSellingProducts = createAsyncThunk<Product[], void>(
  "products/fetchTopSellingProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products?sort=rating&limit=12");
      return response.data?.data || response.data?.content || response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to fetch top selling products");
    }
  }
);

export const fetchProductsNearYou = createAsyncThunk<Product[], any>(
  "products/fetchProductsNearYou",
  async (locationFilter, { rejectWithValue }) => {
    try {
      let url = "/products?limit=12";
      if (locationFilter) {
        if (locationFilter.type === 'current' && locationFilter.coordinates) {
          url += `&userLat=${locationFilter.coordinates.lat}&userLng=${locationFilter.coordinates.lng}&radiusKm=${locationFilter.radiusKm || 10}`;
        } else if (locationFilter.type === 'district' && locationFilter.district) {
          url += `&district=${encodeURIComponent(locationFilter.district)}`;
        }
      }
      const response = await api.get(url);
      return response.data?.data || response.data?.content || response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to fetch products near you");
    }
  }
);

// ✅ FIX 6A: UPDATE searchProduct thunk to accept and include location params
export const searchProduct = createAsyncThunk<
  { success: boolean; data: Product[]; count: number; page: number; totalPages: number },
  { query: string; locationFilter?: LocationFilter | null } // ✅ Accept optional location param
>("products/searchProduct", async ({ query, locationFilter }, { rejectWithValue, getState }) => {
  try {
    // ✅ Get location from Redux state if not passed explicitly
    const state = getState() as RootState;
    const filter = locationFilter ?? state.products.locationFilter;

    // ✅ Build params object with location filters
    const params: any = { search: query };
    
    if (filter?.type === 'current' && filter.coordinates) {
      params.userLat = filter.coordinates.lat;
      params.userLng = filter.coordinates.lng;
      params.radiusKm = filter.radiusKm || 50;
    } else if (filter?.type === 'district' && filter.district) {
      params.district = filter.district;
    }

    const response = await api.get(`${API_URL}/search`, { params });
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred');
  }
});

export const getAllProducts = createAsyncThunk<
  any,
  {
    category?: string;
    brand?: string;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    sort?: string;
    stock?: string;
    pageNumber?: number;
    locationFilter?: LocationFilter | null;
  }
>("products/getAllProducts", async (params, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    const locationFilter = params.locationFilter ?? state.products.locationFilter;

    // ✅ Extract params WITHOUT locationFilter to avoid nested serialization
    const { locationFilter: _, ...cleanParams } = params;
    
    const apiParams: any = {
      ...cleanParams,  // ✅ Spread only clean params (no locationFilter object)
      pageNumber: params.pageNumber || 0,
    };

    // ✅ Add location params as TOP-LEVEL params only
    if (locationFilter?.type === 'current' && locationFilter.coordinates) {
      apiParams.userLat = locationFilter.coordinates.lat;
      apiParams.userLng = locationFilter.coordinates.lng;
      apiParams.radiusKm = locationFilter.radiusKm || 50;
    } else if (locationFilter?.type === 'district' && locationFilter.district) {
      apiParams.district = locationFilter.district;  // ✅ Only this should be sent
    }

    const response = await api.get<any>(API_URL, { params: apiParams });
    return response.data;
  } catch (error: any) {
    console.log("error ", error.response);
    return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred');
  }
});

// ✅ ADMIN: Fetch all global products
export const fetchAllAdminProducts = createAsyncThunk<any, void>(
  "products/fetchAllAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<any>("/admin/products");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred");
    }
  }
);

// ✅ ADMIN: Update product status
export const updateProductStatus = createAsyncThunk<any, { productId: string; status: string }>(
  "products/updateProductStatus",
  async ({ productId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch<any>(`/admin/product/${productId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred");
    }
  }
);

// Create the slice
const productSlice = createSlice({
  name: "products",
  initialState,
  // ✅ FIX 4: ADD reducers object with setLocationFilter
  reducers: {
    // ✅ NEW: Sync action to set location filter (no API call needed)
    setLocationFilter: (state, action: PayloadAction<LocationFilter | null>) => {
      state.locationFilter = action.payload;
      state.currentPage = 0; // ✅ Reset pagination when location changes
    },
    // Optional: Add more sync actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<any>) => {
          const productData = action.payload?.data || action.payload;
          state.product = productData;
          state.loading = false;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
      })
      .addCase(searchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchProduct.fulfilled,
        (state, action: PayloadAction<{ success: boolean; data: Product[]; count: number; page: number; totalPages: number }>) => {
          const productsArray = action.payload?.data || action.payload || [];
          state.searchProduct = productsArray;
          state.loading = false;
          state.error = null;
          console.log('✅ Search results loaded:', {
            count: productsArray.length,
            firstProduct: productsArray[0]?.title
          });
        }
      )
      .addCase(searchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to search products";
        state.searchProduct = [];
      })
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllProducts.fulfilled,
        (state, action: PayloadAction<any>) => {
          let productsArray: Product[] = [];
          let totalPages = 1;

          if (action.payload?.data && Array.isArray(action.payload.data)) {
            productsArray = action.payload.data;
            totalPages = 1;
          }
          else if (action.payload?.content && Array.isArray(action.payload.content)) {
            productsArray = action.payload.content;
            totalPages = action.payload.totalPages || 1;
          }
          else if (Array.isArray(action.payload)) {
            productsArray = action.payload;
            totalPages = 1;
          }

          state.paginatedProducts = action.payload;
          state.products = productsArray;
          state.totalPages = totalPages;
          state.loading = false;
        }
      )
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      .addCase(fetchAllAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdminProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products = action.payload?.data || [];
      })
      .addCase(fetchAllAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch admin products";
      })
      .addCase(updateProductStatus.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedProduct = action.payload?.data;
        if (updatedProduct) {
          state.products = state.products.map(p => p._id === updatedProduct._id ? updatedProduct : p);
        }
      })
      .addCase(fetchFollowedSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowedSellerProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.followedSellerProducts = action.payload;
        state.loading = false;
      })
      .addCase(fetchFollowedSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch followed seller products";
      })
      .addCase(fetchRecentlyAddedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentlyAddedProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.recentlyAddedProducts = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecentlyAddedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTopSellingProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopSellingProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.topSellingProducts = action.payload;
        state.loading = false;
      })
      .addCase(fetchTopSellingProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductsNearYou.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsNearYou.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.productsNearYou = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsNearYou.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ FIX 5: EXPORT the setLocationFilter action
export const { setLocationFilter } = productSlice.actions;

export default productSlice.reducer;

// Define selector functions
export const selectProduct = (state: RootState) => state.products.product;
export const selectProducts = (state: RootState) => state.products.products;
export const selectPaginatedProducts = (state: RootState) =>
  state.products.paginatedProducts;
export const selectProductLoading = (state: RootState) =>
  state.products.loading;
export const selectProductError = (state: RootState) => state.products.error;

// ✅ FIX 7: ADD selector for location filter
export const selectLocationFilter = (state: RootState) => 
  state.products.locationFilter;