import { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, TextField, IconButton, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Fade } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchSellerChats, fetchChatMessages, addMessage, setCurrentChat, markMessagesAsSeen } from '../../../redux/Chat/ChatSlice';
import { io, Socket } from 'socket.io-client';

export default function Chats() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const chat = useAppSelector(state => state.chat);
  const sellers = useAppSelector(state => state.sellers);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (auth.jwt) {
      dispatch(fetchSellerChats(auth.jwt));
    }
  }, [dispatch, auth.jwt]);

  useEffect(() => {
    if (chat.currentChat && auth.jwt) {
      dispatch(fetchChatMessages({ chatId: chat.currentChat._id, jwt: auth.jwt }));

      const API_URL = import.meta.env.VITE_API_URL || "https://api.nearlook.in";
      const newSocket = io(API_URL);
      setSocket(newSocket);

      newSocket.emit('join_chat', chat.currentChat._id);

      newSocket.on('receive_message', (message) => {
        dispatch(addMessage(message));
        if (message.senderType !== 'Seller') {
          newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'Seller' });
        }
      });

      newSocket.on('messages_seen', (data) => {
        dispatch(markMessagesAsSeen(data));
      });

      newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'Seller' });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [chat.currentChat, auth.jwt, dispatch]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chat.messages]);

  const handleSend = () => {
    if (!content.trim() || !socket || !chat.currentChat || !sellers.profile) return;

    const messageData = {
      chatId: chat.currentChat._id,
      senderType: 'Seller',
      senderId: sellers.profile._id,
      content
    };

    socket.emit('send_message', messageData);
    setContent('');
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', maxHeight: { md: '80vh', lg: '800px' }, gap: { xs: 0, md: 2 }, p: { xs: 0, md: 2 } }}>
      {/* Sidebar - Chat List */}
      <Paper 
        elevation={0}
        sx={{ 
          width: { xs: '100%', md: '40%' }, 
          overflowY: 'auto',
          display: { xs: chat.currentChat ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%)',
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'grey.100', position: 'sticky', top: 0, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', zIndex: 1 }}>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Customer Chats
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', fontStyle: 'italic' }}>
            Note: Chats are automatically deleted after 15 days.
          </Typography>
        </Box>
        <List sx={{ p: 1 }}>
          {chat.chats.map((c, index) => (
            <Fade in={true} key={c._id} style={{ transitionDelay: `${index * 50}ms` }}>
              <Box component="li">
                <ListItemButton 
                  selected={chat.currentChat?._id === c._id}
                  onClick={() => dispatch(setCurrentChat(c))}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      '&:hover': { bgcolor: 'primary.100' }
                    },
                    '&:hover': {
                      bgcolor: 'grey.50',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={c.user?.profilePicture} 
                      alt={c.user?.fullName}
                      sx={{ 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '2px solid white'
                      }}
                    >
                      {c.user?.fullName?.charAt(0) || 'C'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle2" fontWeight={chat.currentChat?._id === c._id ? 700 : 500}>
                        {c.user?.fullName || 'Customer'}
                      </Typography>
                    } 
                    secondary={c.lastMessage?.content || 'No messages yet'} 
                    secondaryTypographyProps={{ 
                      noWrap: true,
                      sx: { fontSize: '0.8rem', color: 'text.secondary' }
                    }}
                  />
                </ListItemButton>
              </Box>
            </Fade>
          ))}
          {chat.chats.length === 0 && (
            <Box component="li" sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
              <Typography variant="body1" color="text.secondary" fontWeight="500">
                No conversations yet
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1, 
          display: { xs: chat.currentChat ? 'flex' : 'none', md: 'flex' }, 
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          bgcolor: 'white'
        }}
      >
        {chat.currentChat ? (
          <>
            <Box sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'grey.100', 
              bgcolor: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <IconButton 
                sx={{ display: { md: 'none' }, mr: -1 }} 
                onClick={() => dispatch(setCurrentChat(null))}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar 
                src={chat.currentChat.user?.profilePicture} 
                alt={chat.currentChat.user?.fullName}
                sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                {chat.currentChat.user?.fullName?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                  {chat.currentChat.user?.fullName || 'Customer'}
                </Typography>
                {(chat.currentChat.user?.email || chat.currentChat.user?.mobile) && (
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    {chat.currentChat.user?.email || ''} {chat.currentChat.user?.mobile ? `• ${chat.currentChat.user.mobile}` : ''}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box ref={messagesContainerRef} sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: { xs: 2, md: 3 }, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.5, 
              bgcolor: '#f8fafc',
              backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
              {chat.messages.map((msg, idx) => (
                <Fade in={true} key={idx} timeout={300}>
                  <Box sx={{
                    alignSelf: msg.senderType === 'Seller' ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: { xs: '85%', sm: '75%', md: '65%' },
                    alignItems: msg.senderType === 'Seller' ? 'flex-end' : 'flex-start',
                  }}>
                    <Box sx={{
                      bgcolor: msg.senderType === 'Seller' ? 'primary.main' : 'white',
                      color: msg.senderType === 'Seller' ? 'primary.contrastText' : 'text.primary',
                      p: 1.5,
                      px: 2,
                      borderRadius: msg.senderType === 'Seller' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: msg.senderType === 'Seller' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                      border: msg.senderType !== 'Seller' ? '1px solid' : 'none',
                      borderColor: 'grey.100'
                    }}>
                      <Typography variant="body1" sx={{ fontSize: '0.95rem', wordBreak: 'break-word' }}>
                        {msg.content}
                      </Typography>
                    </Box>
                    {msg.senderType === 'Seller' && msg.isRead && idx === chat.messages.length - 1 && (
                      <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
                        Seen
                      </Typography>
                    )}
                  </Box>
                </Fade>
              ))}

            </Box>

            <Box sx={{ 
              p: 2, 
              bgcolor: 'white', 
              borderTop: '1px solid', 
              borderColor: 'grey.100',
              display: 'flex', 
              gap: 1.5,
              alignItems: 'center'
            }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Type your message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    bgcolor: 'grey.50',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'grey.300' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSend}
                disabled={!content.trim()}
                sx={{ 
                  bgcolor: content.trim() ? 'primary.main' : 'grey.100', 
                  color: content.trim() ? 'white' : 'grey.400',
                  borderRadius: '50%',
                  p: 1.2,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: content.trim() ? 'primary.dark' : 'grey.100',
                    transform: content.trim() ? 'scale(1.05)' : 'none'
                  } 
                }}
              >
                <SendIcon fontSize="small" sx={{ ml: 0.5 }} />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 3, 
              borderRadius: '50%', 
              bgcolor: 'primary.50', 
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SendIcon sx={{ fontSize: 40, opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" color="text.secondary" fontWeight="600">
              Your Messages
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
              Select a conversation from the sidebar to start chatting with your customers.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
