import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import PayoutsPage from '../admin/pages/Payouts/PayoutsPage';
const GridTable = lazy(() => import('../admin/pages/HomePage/GridTable'));

const DashboardOverview = lazy(() => import('../admin/pages/Dashboard/DashboardOverview'));
const Coupon = lazy(() => import('../admin/pages/Coupon/Coupon'));
const CouponForm = lazy(() => import('../admin/pages/Coupon/CreateCouponForm'));
const ShopByCategoryTable = lazy(() => import('../admin/pages/HomePage/ShopByCategoryTable'));
const Deal = lazy(() => import('../admin/pages/HomePage/Deal'));
const CategoryManagement = lazy(() => import('../admin/components/CategoryManagement/CategoryManagment'));
const CategoryAttributeManagement = lazy(() => import('../admin/pages/CategoryAttributes/CategoryAttributeManagement'));
const UsersList = lazy(() => import('../admin/pages/Users/UsersList'));
const Transactions = lazy(() => import('../admin/pages/Transactions/Transactions'));
const AllProducts = lazy(() => import('../admin/pages/Products/AllProducts'));
const SellersManagement = lazy(() => import('../admin/pages/Sellers/SellersManagement'));
const GlobalOrders = lazy(() => import('../admin/pages/Orders/GlobalOrders'));
const SupportTickets = lazy(() => import('../admin/pages/Support/SupportTickets'));
const ReviewsModeration = lazy(() => import('../admin/pages/Reviews/ReviewsModeration'));
const Approvals = lazy(() => import('../admin/pages/Approvals/Approvals'));
// Eagerly load PayoutsPage to fix LCP Element render delay for this specific page

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