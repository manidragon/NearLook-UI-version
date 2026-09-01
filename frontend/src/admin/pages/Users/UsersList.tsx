import { useEffect, useState } from 'react';
import { 
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Avatar, InputBase, alpha, useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchAllUsers, selectAllUsers } from '../../../redux/Customer/UserSlice';

const UsersList = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Select users from Redux state
    const users = useAppSelector(selectAllUsers);

    // Fetch users on component mount
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Filter users based on search term
    const filteredUsers = users.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.mobile && user.mobile.includes(searchTerm))
    );

    return (
        <Box p={3}>
            <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                gap={2}
                mb={4}
            >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#111827' }}>Users Management</Typography>
                
                {/* Search Bar */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: alpha(theme.palette.common.black, 0.05),
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        width: { xs: '100%', sm: '300px' }
                    }}
                >
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <InputBase 
                        placeholder="Search users..." 
                        fullWidth 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Addresses</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar src={user.profilePicture} alt={user.fullName || "User"} />
                                            <Box>
                                                <Typography variant="body1" fontWeight="500">{user.fullName || "N/A"}</Typography>
                                                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{user.mobile || "N/A"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {user.addresses && user.addresses.length > 0 
                                                ? `${user.addresses.length} address(es)`
                                                : "No address"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default UsersList;
