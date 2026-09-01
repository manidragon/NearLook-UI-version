import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, useMediaQuery, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchUserChats, fetchChatMessages, addMessage, setCurrentChat, markMessagesAsSeen } from '../../../redux/Chat/ChatSlice';
import { io, Socket } from 'socket.io-client';

export default function CustomerChats() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const chat = useAppSelector(state => state.chat);
  const user = useAppSelector(state => state.user);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (auth.jwt) {
      dispatch(fetchUserChats(auth.jwt));
    }
  }, [dispatch, auth.jwt]);

  useEffect(() => {
    if (chat.currentChat && auth.jwt) {
      dispatch(fetchChatMessages({ chatId: chat.currentChat._id, jwt: auth.jwt }));

      const newSocket = io('http://localhost:8080');
      setSocket(newSocket);

      newSocket.emit('join_chat', chat.currentChat._id);

      newSocket.on('receive_message', (message) => {
        dispatch(addMessage(message));
        if (message.senderType !== 'User') {
          newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'User' });
        }
      });

      newSocket.on('messages_seen', (data) => {
        dispatch(markMessagesAsSeen(data));
      });

      newSocket.emit('mark_seen', { chatId: chat.currentChat._id, readerType: 'User' });

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
    if (!content.trim() || !socket || !chat.currentChat || !user.user) return;

    const messageData = {
      chatId: chat.currentChat._id,
      senderType: 'User',
      senderId: user.user._id,
      content
    };

    socket.emit('send_message', messageData);
    setContent('');
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: '100%', md: 'calc(100vh - 220px)' }, maxHeight: { xl: '1000px' }, minHeight: { md: '500px' }, bgcolor: 'white', borderRadius: { xs: 0, md: 4 }, overflow: 'hidden', boxShadow: { xs: 0, md: '0 4px 20px rgba(0,0,0,0.05)' } }}>
      
      {/* Sidebar - Chat List */}
      {(!isMobile || !chat.currentChat) && (
        <Box sx={{ 
          width: { xs: '100%', md: '40%' }, 
          borderRight: { xs: 0, md: 1 }, 
          borderColor: 'grey.100', 
          overflowY: 'auto',
          bgcolor: 'white'
        }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'grey.100' }}>
            <Typography component="h1" variant="h5" fontWeight="bold">
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', fontStyle: 'italic' }}>
              Note: Chats are automatically deleted after 15 days.
            </Typography>
          </Box>
          <List sx={{ p: 0 }}>
          {chat.chats.map((c, index) => {
            const sellerName = c.seller?.businessDetails?.businessName || c.seller?.sellerName || 'Seller';
            const logo = c.seller?.businessDetails?.logo;
            return (
              <React.Fragment key={c._id}>
                <ListItem disablePadding divider={index < chat.chats.length - 1}>
                  <ListItemButton 
                    selected={chat.currentChat?._id === c._id}
                    onClick={() => dispatch(setCurrentChat(c))}
                    sx={{
                      px: 3, py: 2,
                      width: '100%',
                      '&.Mui-selected': { bgcolor: '#fff3ec', borderRight: '3px solid #FF5A00' },
                      '&:hover': { bgcolor: '#fff9f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={logo} alt={sellerName}>
                        {sellerName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={sellerName} 
                      secondary={c.lastMessage?.content || 'No messages yet'} 
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            );
          })}
          {chat.chats.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
              No conversations yet.
            </Typography>
          )}
        </List>
      </Box>
      )}

      {/* Main Chat Area */}
      {(!isMobile || chat.currentChat) && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#F1F3F6' }}>
          {chat.currentChat ? (
            <>
              <Box sx={{ p: 2, px: 3, borderBottom: 1, borderColor: 'grey.200', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', zIndex: 10 }}>
                {isMobile && (
                  <IconButton onClick={() => dispatch(setCurrentChat(null))} sx={{ ml: -1, color: 'text.primary' }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Avatar src={chat.currentChat.seller?.businessDetails?.logo} alt={chat.currentChat.seller?.businessDetails?.businessName || 'Seller'}>
                  {(chat.currentChat.seller?.businessDetails?.businessName || 'S').charAt(0)}
                </Avatar>
                <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {chat.currentChat.seller?.businessDetails?.businessName || chat.currentChat.seller?.sellerName || 'Seller'}
                </Typography>
              </Box>
            </Box>

              <Box ref={messagesContainerRef} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chat.messages.map((msg, idx) => (
                  <Box key={idx} sx={{
                    alignSelf: msg.senderType === 'User' ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '85%',
                    alignItems: msg.senderType === 'User' ? 'flex-end' : 'flex-start',
                  }}>
                    <Box sx={{
                      bgcolor: msg.senderType === 'User' ? '#FF5A00' : 'white',
                      color: msg.senderType === 'User' ? 'white' : 'text.primary',
                      p: 1.5, px: 2.5,
                      borderRadius: 3,
                      borderBottomRightRadius: msg.senderType === 'User' ? 0 : undefined,
                      borderBottomLeftRadius: msg.senderType === 'User' ? undefined : 0,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="body1" sx={{ fontSize: '15px' }}>{msg.content}</Typography>
                    </Box>
                  {msg.senderType === 'User' && msg.isRead && idx === chat.messages.length - 1 && (
                    <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.65rem' }}>
                      Seen
                    </Typography>
                  )}
                </Box>
              ))}

              </Box>
  
              <Box sx={{ p: 2, px: { xs: 2, md: 3 }, borderTop: 1, borderColor: 'grey.200', display: 'flex', gap: 1.5, bgcolor: 'white' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Type your message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 10,
                      bgcolor: '#F1F3F6',
                      '& fieldset': { border: 'none' }
                    }
                  }}
                />
                <IconButton color="primary" onClick={handleSend} sx={{ bgcolor: '#FF5A00', color: 'white', width: 48, height: 48, '&:hover': { bgcolor: '#e04f00' } }}>
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', px: 3, textAlign: 'center' }}>
              <div className="w-24 h-24 mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                <SendIcon sx={{ fontSize: 40, color: '#FF5A00', opacity: 0.5 }} />
              </div>
              <Typography component="h2" variant="h6" color="text.secondary" fontWeight="500">
                Your Messages
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300 }}>
                Select a conversation to start chatting with the seller
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
