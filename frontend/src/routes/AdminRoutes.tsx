// D:\Mani\Code with Zosh\Backup\source code\frontend\src\routes\AdminRoutes.tsx
import { Route, Routes } from 'react-router-dom'
import DashboardOverview from '../admin/pages/Dashboard/DashboardOverview'
import Coupon from '../admin/pages/Coupon/Coupon'
import CouponForm from '../admin/pages/Coupon/CreateCouponForm'
import GridTable from '../admin/pages/HomePage/GridTable'
import ShopByCategoryTable from '../admin/pages/HomePage/ShopByCategoryTable'
import Deal from '../admin/pages/HomePage/Deal'
import CategoryManagement from '../admin/components/CategoryManagement/CategoryManagment'
import CategoryAttributeManagement from '../admin/pages/CategoryAttributes/CategoryAttributeManagement';
import UsersList from '../admin/pages/Users/UsersList';
import Transactions from '../admin/pages/Transactions/Transactions';
import AllProducts from '../admin/pages/Products/AllProducts';
import SellersManagement from '../admin/pages/Sellers/SellersManagement';
import GlobalOrders from '../admin/pages/Orders/GlobalOrders';
import SupportTickets from '../admin/pages/Support/SupportTickets';
import ReviewsModeration from '../admin/pages/Reviews/ReviewsModeration';
import Approvals from '../admin/pages/Approvals/Approvals';
import PayoutsPage from '../admin/pages/Payouts/PayoutsPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashboardOverview />} />
      <Route path='/coupon' element={<Coupon />} />
      <Route path='/add-coupon' element={<CouponForm />} />
      <Route path='/home-grid' element={<GridTable />} />
      <Route path='/shop-by-category' element={<ShopByCategoryTable />} />
      <Route path='/deals' element={<Deal />} />
      <Route path='/categories' element={<CategoryManagement />} />
      <Route path='/categories/attributes' element={<CategoryAttributeManagement />} />
      <Route path='/users' element={<UsersList />} />
      <Route path='/transactions' element={<Transactions />} />
      <Route path='/products' element={<AllProducts />} />
      <Route path='/sellers' element={<SellersManagement />} />
      <Route path='/orders' element={<GlobalOrders />} />
      <Route path='/support' element={<SupportTickets />} />
      <Route path='/approvals' element={<Approvals />} />
      <Route path='/reviews' element={<ReviewsModeration />} />
      <Route path='/payouts' element={<PayoutsPage />} />
    </Routes>
  )
}

export default AdminRoutes