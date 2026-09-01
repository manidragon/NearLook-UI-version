import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { getOrCreateChat, fetchChatMessages, addMessage, markMessagesAsSeen } from '../../../redux/Chat/ChatSlice';
import { io, Socket } from 'socket.io-client';

interface ChatModalProps {
  sellerId: string;
  sellerName: string;
  themeColor?: string;
  onClose: () => void;
}

export default function ChatModal({ sellerId, sellerName, themeColor = '#1976d2', onClose }: ChatModalProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const chat = useAppSelector(state => state.chat);
  const user = useAppSelector(state => state.user);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auth.jwt && sellerId) {
      dispatch(getOrCreateChat({ sellerId, jwt: auth.jwt }));
    }
  }, [dispatch, auth.jwt, sellerId]);

  useEffect(() => {
    if (chat.currentChat && auth.jwt) {
      dispatch(fetchChatMessages({ chatId: chat.currentChat._id, jwt: auth.jwt }));

      const API_URL = import.meta.env.VITE_API_URL || "https://api.nearlook.in";
      const newSocket = io(API_URL);
      setSocket(newSocket);

      newSocket.emit('join_chat', chat.currentChat._id);

      newSocket.on('receive_message', (message) => {
        dispatch(addMessage(message));
        // If we have chat open and get a message, mark as seen
        if (message.senderType !== 'User') {
          newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'User' });
        }
      });

      newSocket.on('messages_seen', (data) => {
        dispatch(markMessagesAsSeen(data));
      });

      // Mark initially loaded messages as seen
      newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'User' });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [chat.currentChat, auth.jwt, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSend = () => {
    if (!content.trim() || !socket || !chat.currentChat || !user.user) return;

    const messageData = {
      chatId: chat.currentChat._id,
      senderType: 'User',
      senderId: user.user._id || (user.user as any).id,
      content
    };

    socket.emit('send_message', messageData);
    setContent('');
  };

  return (
    <Paper sx={{
      position: 'fixed',
      bottom: { xs: 76, lg: 24 },
      right: { xs: 16, sm: 24 },
      width: { xs: 'calc(100vw - 32px)', sm: 380 },
      height: { xs: '65vh', sm: 500 },
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      zIndex: 1000,
      borderRadius: '24px',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <Box sx={{ 
        p: 2.5, 
        background: themeColor,
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>{sellerName}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
            Chats are automatically deleted after 15 days.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* CHAT AREA */}
      <Box sx={{ 
        flex: 1, 
        p: 2.5, 
        overflowY: 'auto', 
        bgcolor: '#f8fafc', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5 
      }}>
        {chat.messages.map((msg, idx) => {
          const isUser = msg.senderType === 'User';
          return (
            <Box key={idx} sx={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '85%',
              alignItems: isUser ? 'flex-end' : 'flex-start',
            }}>
              <Box sx={{
                bgcolor: isUser ? themeColor : '#ffffff',
                color: isUser ? 'white' : '#1e293b',
                p: '12px 16px',
                borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: isUser ? 'none' : '1px solid #e2e8f0',
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {msg.content}
                </Typography>
              </Box>
              {isUser && msg.isRead && idx === chat.messages.length - 1 && (
                <Typography variant="caption" sx={{ mt: 0.5, mr: 0.5, color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>
                  Seen
                </Typography>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* INPUT AREA */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'white', 
        borderTop: '1px solid #f1f5f9', 
        display: 'flex', 
        gap: 1.5,
        alignItems: 'center'
      }}>
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: '#f8fafc',
              minHeight: '48px',
              fontSize: '1rem',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: themeColor },
            }
          }}
        />
        <IconButton 
          onClick={handleSend}
          sx={{ 
            bgcolor: content.trim() ? themeColor : '#e2e8f0',
            color: content.trim() ? 'white' : '#94a3b8',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: content.trim() ? themeColor : '#e2e8f0',
              opacity: content.trim() ? 0.9 : 1,
              transform: content.trim() ? 'scale(1.05)' : 'none'
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
