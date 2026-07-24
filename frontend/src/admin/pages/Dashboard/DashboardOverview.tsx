import { Typography, Box, Grid, Paper } from "@mui/material";

const DashboardOverview = () => {
  return (
    <Box>
      <Typography variant="h4" className="mb-4">
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} className="p-5 text-center">
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3" color="primary">--</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} className="p-5 text-center">
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h3" color="secondary">--</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} className="p-5 text-center">
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h3" color="success.main">$0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
