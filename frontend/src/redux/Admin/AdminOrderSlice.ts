import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { type Order } from '../../types/orderTypes';

export const fetchAdminOrders = createAsyncThunk<Order[]>(
  'adminOrders/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

interface AdminOrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  loading: false,
  error: null,
};

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminOrderSlice.reducer;
