import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export const fetchAdminProductReviews = createAsyncThunk(
  'adminReviews/fetchProductReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/reviews/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product reviews');
    }
  }
);

export const fetchAdminSellerReviews = createAsyncThunk(
  'adminReviews/fetchSellerReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/reviews/sellers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller reviews');
    }
  }
);

interface AdminReviewState {
  productReviews: any[];
  sellerReviews: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminReviewState = {
  productReviews: [],
  sellerReviews: [],
  loading: false,
  error: null,
};

const adminReviewSlice = createSlice({
  name: 'adminReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProductReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchAdminProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminSellerReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminSellerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerReviews = action.payload;
      })
      .addCase(fetchAdminSellerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminReviewSlice.reducer;
