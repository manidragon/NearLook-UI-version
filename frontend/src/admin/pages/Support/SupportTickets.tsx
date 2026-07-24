import React from 'react';
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
                <Typography variant="h4" fontWeight="bold" color="primary">Support & Disputes</Typography>
                <Typography variant="body2" color="text.secondary">Resolve issues between customers and sellers or platform inquiries.</Typography>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ticket ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Submitted By</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mockTickets.map((ticket) => (
                                <TableRow key={ticket.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell fontWeight="500">{ticket.id}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>{ticket.user}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{ticket.role}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.priority} 
                                            size="small"
                                            color={ticket.priority === 'HIGH' ? 'error' : (ticket.priority === 'MEDIUM' ? 'warning' : 'info')}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.status} 
                                            size="small"
                                            color={ticket.status === 'OPEN' ? 'error' : (ticket.status === 'IN_PROGRESS' ? 'primary' : 'default')}
                                            variant={ticket.status === 'CLOSED' ? 'outlined' : 'filled'}
                                        />
                                    </TableCell>
                                    <TableCell>{ticket.date}</TableCell>
                                    <TableCell align="right">
                                        <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }}>Resolve</Button>
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
