import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const SellerRegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      bgcolor: '#f8fafc'
    }}>
      <Paper elevation={0} sx={{
        p: { xs: 4, md: 6 },
        maxWidth: 500,
        width: '100%',
        textAlign: 'center',
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
          Registration Successful!
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6 }}>
          Your seller account has been successfully created and is currently under review. Once approved by our administration team, you will receive an email and be able to access your seller dashboard to add products and manage your store.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            py: 1.5,
            px: 4,
            bgcolor: '#FF5A00',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            borderRadius: 2,
            boxShadow: '0 4px 14px 0 rgba(255, 90, 0, 0.39)',
            '&:hover': {
              bgcolor: '#e65100',
            }
          }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default SellerRegistrationSuccess;
