import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export const fetchAdminNotificationCounts = createAsyncThunk(
  'adminNotifications/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/notifications/counts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notification counts');
    }
  }
);

interface AdminNotificationState {
  counts: {
    users: number;
    products: number;
    sellers: number;
    orders: number;
    reviews: number;
  };
  lastSeenCounts: {
    users: number;
    products: number;
    sellers: number;
    orders: number;
    reviews: number;
  };
  loading: boolean;
  error: string | null;
}

const loadLastSeen = () => {
  try {
    const data = localStorage.getItem('adminLastSeenCounts');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const savedLastSeen = loadLastSeen();

const initialState: AdminNotificationState = {
  counts: {
    users: 0,
    products: 0,
    sellers: 0,
    orders: 0,
    reviews: 0,
  },
  lastSeenCounts: savedLastSeen || {
    users: 0,
    products: 0,
    sellers: 0,
    orders: 0,
    reviews: 0,
  },
  loading: false,
  error: null,
};

const adminNotificationSlice = createSlice({
  name: 'adminNotifications',
  initialState,
  reducers: {
    clearAdminNotificationCounts: (state) => {
      state.counts = { ...initialState.counts };
    },
    clearAdminBadge: (state, action: { payload: keyof AdminNotificationState['counts'] }) => {
      // Mark current absolute count as seen
      state.lastSeenCounts[action.payload] = state.counts[action.payload] + state.lastSeenCounts[action.payload];
      state.counts[action.payload] = 0;
      localStorage.setItem('adminLastSeenCounts', JSON.stringify(state.lastSeenCounts));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotificationCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminNotificationCounts.fulfilled, (state, action) => {
        state.loading = false;
        const newCounts = action.payload;
        // Calculate the difference between backend absolute count and what we've already seen
        Object.keys(newCounts).forEach((k) => {
          const key = k as keyof AdminNotificationState['counts'];
          const actual = newCounts[key];
          const seen = state.lastSeenCounts[key] || 0;
          state.counts[key] = Math.max(0, actual - seen);
          
          // If actual count dropped (e.g. within 24h window), reset the seen count
          if (actual < seen) {
             state.lastSeenCounts[key] = actual;
             state.counts[key] = 0;
             localStorage.setItem('adminLastSeenCounts', JSON.stringify(state.lastSeenCounts));
          }
        });
        state.error = null;
      })
      .addCase(fetchAdminNotificationCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminNotificationCounts, clearAdminBadge } = adminNotificationSlice.actions;

export default adminNotificationSlice.reducer;
