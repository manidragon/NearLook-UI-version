import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Chip, Button, useTheme, alpha 
} from '@mui/material';

const mockTickets = [
    { id: 'TKT-101', subject: 'Item not received', user: 'Alice M.', role: 'Customer', priority: 'HIGH', status: 'OPEN', date: '2026-06-25' },
    { id: 'TKT-102', subject: 'Payout delayed', user: 'Tech Store', role: 'Seller', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2026-06-24' },
    { id: 'TKT-103', subject: 'Return request denied', user: 'Bob K.', role: 'Customer', priority: 'HIGH', status: 'OPEN', date: '2026-06-24' },
    { id: 'TKT-104', subject: 'How to list products?', user: 'New Vendor', role: 'Seller', priority: 'LOW', status: 'CLOSED', date: '2026-06-20' },
];

const SupportTickets = () => {
    const theme = useTheme();

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#111827' }}>Support & Disputes</Typography>
                <Typography variant="body2" sx={{ color: '#4B5563' }}>Resolve issues between customers and sellers or platform inquiries.</Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Ticket ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Submitted By</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#111827' }} align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mockTickets.map((ticket) => (
                                <TableRow key={ticket.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: '500', color: '#111827' }}>{ticket.id}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{ticket.subject}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{ticket.user}</TableCell>
                                    <TableCell sx={{ color: '#374151' }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#4B5563' }}>{ticket.role}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.priority} 
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: ticket.priority === 'HIGH' ? '#7F1D1D' : (ticket.priority === 'MEDIUM' ? '#78350F' : '#1E3A8A'),
                                                bgcolor: ticket.priority === 'HIGH' ? '#FEE2E2' : (ticket.priority === 'MEDIUM' ? '#FEF3C7' : '#DBEAFE')
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.status} 
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: ticket.status === 'OPEN' ? '#7F1D1D' : (ticket.status === 'IN_PROGRESS' ? '#064E3B' : '#374151'),
                                                bgcolor: ticket.status === 'OPEN' ? '#FEE2E2' : (ticket.status === 'IN_PROGRESS' ? '#D1FAE5' : '#F3F4F6'),
                                                border: ticket.status === 'CLOSED' ? '1px solid #D1D5DB' : 'none'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#374151' }}>{ticket.date}</TableCell>
                                    <TableCell align="right">
                                        <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2, color: '#C2410C', borderColor: '#C2410C', '&:hover': { bgcolor: '#FFF7ED', borderColor: '#C2410C' } }}>Resolve</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default SupportTickets;
