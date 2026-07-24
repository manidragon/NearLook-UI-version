import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../Config/Api";

export interface PayoutTransaction {
    _id: string;
    amount: number;
    platformFee: number;
    netAmount: number;
    order: {
        _id: string;
        totalSellingPrice: number;
        orderStatus: string;
        deliverDate: string;
    };
    paymentStatus: string;
    paymentMethod: string;
    isOffline: boolean;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    refundAmount?: number;
    refundReason?: string;
    payoutId?: string;
    isSettled: boolean;
    seller?: {
        _id: string;
        sellerName: string;
        businessDetails?: {
            businessName: string;
        };
    };
    customer?: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt?: string;
    date?: string;
}

export interface Payout {
    _id: string;
    seller: {
        _id: string;
        sellerName: string;
        email: string;
        mobile: string;
        bankDetails: {
            accountNumber: string;
            accountHolderName: string;
            ifscCode: string;
            upiId: string;
        };
    };
    amount: number;
    transactions: PayoutTransaction[] | string[];
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    payoutPeriodStart?: string;
    payoutPeriodEnd?: string;
    razorpayTransferId?: string;
    payoutDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface AdminPayoutState {
    payouts: Payout[];
    transactions: PayoutTransaction[];
    selectedPayout: Payout | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminPayoutState = {
    payouts: [],
    transactions: [],
    selectedPayout: null,
    loading: false,
    error: null,
};

// Fetch all payouts
export const fetchAllPayouts = createAsyncThunk(
    "adminPayout/fetchAllPayouts",
    async (filters: { status?: string; sellerId?: string } | void, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();
            if (filters?.status) query.append("status", filters.status);
            if (filters?.sellerId) query.append("sellerId", filters.sellerId);

            const response = await api.get(`/api/admin/payouts?${query.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch payouts");
        }
    }
);

// Fetch all transactions for admin
export const fetchAllTransactions = createAsyncThunk(
    "adminPayout/fetchAllTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/transactions`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
        }
    }
);

// Fetch payout details
export const fetchPayoutDetails = createAsyncThunk(
    "adminPayout/fetchPayoutDetails",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/admin/payouts/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch payout details");
        }
    }
);

// Complete payout
export const completePayout = createAsyncThunk(
    "adminPayout/completePayout",
    async ({ id, razorpayTransferId }: { id: string; razorpayTransferId: string }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/api/admin/payouts/${id}/complete`,
                { razorpayTransferId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to complete payout");
        }
    }
);

// Trigger payouts manually
export const triggerPayouts = createAsyncThunk(
    "adminPayout/triggerPayouts",
    async (sellerIds: string[] | undefined, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post(
                `/api/admin/payouts/trigger`,
                { sellerIds },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                }
            );
            // Refresh list
            dispatch(fetchAllPayouts());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to trigger payouts");
        }
    }
);

const adminPayoutSlice = createSlice({
    name: "adminPayout",
    initialState,
    reducers: {
        clearSelectedPayout: (state) => {
            state.selectedPayout = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch All Payouts
        builder.addCase(fetchAllPayouts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllPayouts.fulfilled, (state, action: PayloadAction<Payout[]>) => {
            state.loading = false;
            state.payouts = action.payload;
        });
        builder.addCase(fetchAllPayouts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch All Transactions
        builder.addCase(fetchAllTransactions.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllTransactions.fulfilled, (state, action: PayloadAction<PayoutTransaction[]>) => {
            state.loading = false;
            state.transactions = action.payload;
        });
        builder.addCase(fetchAllTransactions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Payout Details
        builder.addCase(fetchPayoutDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPayoutDetails.fulfilled, (state, action: PayloadAction<Payout>) => {
            state.loading = false;
            state.selectedPayout = action.payload;
        });
        builder.addCase(fetchPayoutDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Complete Payout
        builder.addCase(completePayout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(completePayout.fulfilled, (state, action: PayloadAction<{ message: string; payout: Payout }>) => {
            state.loading = false;
            const updatedPayout = action.payload.payout;
            // Update in the list
            const index = state.payouts.findIndex(p => p._id === updatedPayout._id);
            if (index !== -1) {
                state.payouts[index] = updatedPayout;
            }
            // Update selected payout if it's the one
            if (state.selectedPayout?._id === updatedPayout._id) {
                state.selectedPayout = { ...state.selectedPayout, status: 'COMPLETED', razorpayTransferId: updatedPayout.razorpayTransferId };
            }
        });
        builder.addCase(completePayout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearSelectedPayout } = adminPayoutSlice.actions;
export default adminPayoutSlice.reducer;
