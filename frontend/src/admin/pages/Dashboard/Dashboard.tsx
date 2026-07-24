import  { useEffect, useState } from 'react'
import AdminRoutes from '../../../routes/AdminRoutes'
// import Sidebar from './Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import AdminSidebar from '../../components/Sidebar/Sidebar'
import Alert from "../../../components/CustomAlert";
import { Snackbar } from "@mui/material"
import { useAppSelector } from '../../../redux/Store'

const AdminDashboard = () => {
      const deal = useAppSelector(state => state.deal);
      const admin = useAppSelector(state => state.admin);
  
  const [snackbarOpen, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  }
  useEffect(() => {
    if (deal.dealCreated || deal.dealUpdated ||deal.error || admin.categoryUpdated) {
      setOpenSnackbar(true)
    }
  }, [deal.dealCreated, deal.dealUpdated, deal.error,admin.categoryUpdated])
  return (
    <>
      <div className="min-h-screen">
        <Navbar Sidebar={AdminSidebar} />
        <section className="lg:flex lg:h-[90vh]">
          <div className="hidden lg:block h-full">
            <AdminSidebar />
          </div>
          <div className="p-4 lg:p-10 w-full lg:w-[80%] overflow-y-auto">
            <AdminRoutes />
          </div>
        </section>

      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen} autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={deal.error ? "error" : "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {deal.error ? deal.error : deal.dealCreated ? "Deal created successfully" : deal.dealUpdated ? "deal updated successfully" : admin.categoryUpdated?"Category Updated successfully": ""}
        </Alert>
      </Snackbar>
    </>



  )
}

export default AdminDashboard