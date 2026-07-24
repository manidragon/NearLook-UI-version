// D:\Mani\Code with Zosh\Backup\source code\frontend\src\redux\Seller\revenueChartSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

// Define the base URL for the API
const API_BASE_URL = '/api/sellers/revenue/chart';
interface RevenueChart{
    date: string;
    revenue:number;
}
// Define interfaces for the state
interface RevenueState {
  chart:RevenueChart[];
  loading: boolean;
  error: string | null;
}

// Initial state for the slice
const initialState: RevenueState = {
  chart: [],
  loading: false,
  error: null,
};

export const fetchRevenueChart = createAsyncThunk(
    'revenue/fetchRevenueChart',
    async ({ type }: { type: string }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('jwt'); 
        const response = await api.get(`${API_BASE_URL}`, {
          params: { type },
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
          console.log("error ",error.response)
        return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch daily revenue');
      }
    }
  );








// Create RevenueSlice
const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueChart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.loading = false;
        state.chart = action.payload;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

  },
});

export default revenueSlice.reducer;