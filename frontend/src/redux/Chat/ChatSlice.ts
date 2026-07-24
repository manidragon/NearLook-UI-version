import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export const fetchUserChats = createAsyncThunk('chat/fetchUserChats', async (jwt: string) => {
  const response = await api.get('/api/chats/user', {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  return response.data;
});

export const fetchSellerChats = createAsyncThunk('chat/fetchSellerChats', async (jwt: string) => {
  const response = await api.get('/api/chats/seller', {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  return response.data;
});

export const getOrCreateChat = createAsyncThunk('chat/getOrCreateChat', async (data: { sellerId: string, jwt: string }) => {
  const response = await api.post('/api/chats/user/create', { sellerId: data.sellerId }, {
    headers: { Authorization: `Bearer ${data.jwt}` }
  });
  return response.data;
});

export const fetchChatMessages = createAsyncThunk('chat/fetchChatMessages', async (data: { chatId: string, jwt: string }) => {
  const response = await api.get(`/api/chats/${data.chatId}/messages`, {
    headers: { Authorization: `Bearer ${data.jwt}` }
  });
  return response.data;
});

interface ChatState {
  chats: any[];
  currentChat: any | null;
  messages: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    markMessagesAsSeen: (state, action) => {
      // payload: { chatId, readerType }
      state.messages.forEach(msg => {
        if (msg.senderType !== action.payload.readerType) {
          msg.isRead = true;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchSellerChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.currentChat = action.payload;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  }
});

export const { addMessage, setCurrentChat, markMessagesAsSeen } = chatSlice.actions;
export default chatSlice.reducer;
