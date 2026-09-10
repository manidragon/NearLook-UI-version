import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

interface NotificationCounts {
  orders: number;
  returns: number;
  replacements: number;
  enquiries: number;
  chats: number;
}

interface NotificationState {
  counts: NotificationCounts;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  counts: {
    orders: 0,
    returns: 0,
    replacements: 0,
    enquiries: 0,
    chats: 0,
  },
  loading: false,
  error: null,
};

export const fetchNotificationCounts = createAsyncThunk<NotificationCounts, void>(
  'notifications/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sellers/notifications/counts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch notification counts'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationCounts: (state) => {
      state.counts = initialState.counts;
    },
    clearEnquiryNotification: (state) => {
      state.counts.enquiries = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationCounts.fulfilled, (state, action: PayloadAction<NotificationCounts>) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(fetchNotificationCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationCounts, clearEnquiryNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
