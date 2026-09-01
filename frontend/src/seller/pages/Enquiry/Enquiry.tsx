import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip, Card, CardContent, Divider, Avatar } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CustomLoader from "../../../components/CustomLoader";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
}

export default function Enquiry() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      const jwt = localStorage.getItem("jwt");

      if (!jwt) {
        setLoading(false);
        return;
      }

      // 1. Fetch enquiries directly using the JWT
      const API_URL = import.meta.env.VITE_API_URL || "https://api.nearlook.in";
      const enquiryRes = await fetch(
        `${API_URL}/api/enquiries/seller`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const enquiryData = await enquiryRes.json();

      setEnquiries(enquiryData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CustomLoader />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
          <EmailIcon sx={{ color: 'primary.dark' }} />
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          Customer Enquiries
        </Typography>
      </Box>

      {enquiries.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }} elevation={0}>
          <EmailIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">No Enquiries Yet</Typography>
          <Typography variant="body2">When customers ask questions, they will appear here.</Typography>
        </Paper>
      ) : (
        <>
          {/* 📱 Mobile Card Layout (xs to md) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {enquiries.map((item) => (
              <Card key={item._id} elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonOutlineIcon fontSize="small" color="action" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={item.subject} 
                      size="small" 
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', fontWeight: 600, height: 24, fontSize: '0.7rem', color: '#9a3412', borderColor: '#9a3412' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📧 <a href={`mailto:${item.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.email}</a>
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, mb: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
                    "{item.message}"
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, color: '#424242' }}>
                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* 💻 Desktop Table Layout (md and up) */}
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}>
            <Table sx={{ minWidth: 800 }} aria-label="enquiries table">
              <TableHead sx={{ bgcolor: 'primary.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#9a3412' }}>Customer Details</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#9a3412' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#9a3412', width: '40%' }}>Message</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#9a3412' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enquiries.map((item) => (
                  <TableRow
                    key={item._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body1" fontWeight="600" color="text.primary">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.subject} 
                        size="small" 
                        variant="outlined" 
                        sx={{ textTransform: 'capitalize', fontWeight: 600, color: '#9a3412', borderColor: '#9a3412' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.message}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}