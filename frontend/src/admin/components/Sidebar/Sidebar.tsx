// D:\Mani\Code with Zosh\Backup\source code\frontend\src\admin-seller\pages\AdminSidebar.tsx

import * as React from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RateReviewIcon from '@mui/icons-material/RateReview';

import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../redux/Store";
import { performLogout } from "../../../redux/Customer/AuthSlice";
import "../../../SidebarGlider.css";

const menu = [
    {
        name: "Dashboard",
        path: "/admin",
        icon: <DashboardIcon className="text-primary-color" />,
        activeIcon: <DashboardIcon className="text-white" />,
    },
    {
        name: "Category Management",
        path: "/admin/categories",
        icon: <AdminPanelSettingsIcon className="text-primary-color" />,
        activeIcon: <AdminPanelSettingsIcon className="text-white" />,
    },
    // ✅ NEW: Category Attributes Manager (for managing dynamic product specs)
    {
        name: "Category Attributes",
        path: "/admin/categories/attributes",
        icon: <SettingsIcon className="text-primary-color" />,
        activeIcon: <SettingsIcon className="text-white" />,
    },
    // {
    //     name: "Coupons",
    //     path: "/admin/coupon",
    //     icon: <IntegrationInstructionsIcon className="text-primary-color" />,
    //     activeIcon: <IntegrationInstructionsIcon className="text-white" />,
    // },
    // {
    //     name: "Add New Coupon",
    //     path: "/admin/add-coupon",
    //     icon: <AddIcon className="text-primary-color" />,
    //     activeIcon: <AddIcon className="text-white" />,
    // },
    {
        name: "HomePage",
        path: "/admin/home-grid",
        icon: <HomeIcon className="text-primary-color" />,
        activeIcon: <HomeIcon className="text-white" />,
    },
    {
        name: "Shop By Category",
        path: "/admin/shop-by-category",
        icon: <CategoryIcon className="text-primary-color" />,
        activeIcon: <CategoryIcon className="text-white" />,
    },
    {
        name: "Deals",
        path: "/admin/deals",
        icon: <LocalOfferIcon className="text-primary-color" />,
        activeIcon: <LocalOfferIcon className="text-white" />,
    },
    {
        name: "Users Management",
        path: "/admin/users",
        icon: <PeopleIcon className="text-primary-color" />,
        activeIcon: <PeopleIcon className="text-white" />,
    },
    {
        name: "Transactions",
        path: "/admin/transactions",
        icon: <ReceiptIcon className="text-primary-color" />,
        activeIcon: <ReceiptIcon className="text-white" />,
    },
    {
        name: "Global Products",
        path: "/admin/products",
        icon: <InventoryIcon className="text-primary-color" />,
        activeIcon: <InventoryIcon className="text-white" />,
    },
    {
        name: "Product Approvals",
        path: "/admin/approvals",
        icon: <FactCheckIcon className="text-primary-color" />,
        activeIcon: <FactCheckIcon className="text-white" />,
    },
    {
        name: "Sellers",
        path: "/admin/sellers",
        icon: <StorefrontIcon className="text-primary-color" />,
        activeIcon: <StorefrontIcon className="text-white" />,
    },
    {
        name: "Seller Payouts",
        path: "/admin/payouts",
        icon: <StorefrontIcon className="text-primary-color" />,
        activeIcon: <StorefrontIcon className="text-white" />,
    },
    {
        name: "Global Orders",
        path: "/admin/orders",
        icon: <ListAltIcon className="text-primary-color" />,
        activeIcon: <ListAltIcon className="text-white" />,
    },
    {
        name: "Support Tickets",
        path: "/admin/support",
        icon: <SupportAgentIcon className="text-primary-color" />,
        activeIcon: <SupportAgentIcon className="text-white" />,
    },
    {
        name: "Reviews & Moderation",
        path: "/admin/reviews",
        icon: <RateReviewIcon className="text-primary-color" />,
        activeIcon: <RateReviewIcon className="text-white" />,
    },
];

const menu2 = [
    {
        name: "Logout",
        path: "/",
        icon: <LogoutIcon className="text-primary-color" />,
        activeIcon: <LogoutIcon className="text-white" />,
    },
];

interface SidebarProps {
    toggleDrawer?: any;
}

const AdminSidebar = ({ toggleDrawer }: SidebarProps) => {

    const dispatch = useAppDispatch()


    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem("jwt");

    dispatch(performLogout());

    window.location.href = "/";
}

const handleClick = (item: any) => () => {

    if (item.name === "Logout") {
        handleLogout();
        return;
    }

    navigate(item.path);

    if (toggleDrawer) toggleDrawer(false)();
}
    return (
        <div className="h-full">
            <div
                className="flex flex-col justify-between h-full w-[300px] border-r py-5"
            >
                <div className="overflow-y-auto flex-1">
                    <div className="radio-container radio-container-seller relative" style={{ "--total-radio": menu.length } as React.CSSProperties}>
                        <div className="glider-container" style={{ width: '3px' }}>
                            {menu.findIndex(item => item.path === location.pathname) !== -1 && (
                                <div 
                                    className="glider" 
                                    style={{ transform: `translateY(${menu.findIndex(item => item.path === location.pathname) * 100}%)` }}
                                ></div>
                            )}
                        </div>
                        {menu.map((item) => {
                            const isActive = item.path === location.pathname;
                            return (
                                <div key={item.name}
                                    onClick={handleClick(item)}
                                    className="pr-9 cursor-pointer relative z-10">
                                    <div className={`${isActive ? "bg-orange-50 border-l-4 border-[#FF5A00] text-[#b33f00] font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} flex items-center px-5 py-3 transition-all duration-300`}>
                                        <ListItemIcon sx={{ color: isActive ? '#b33f00' : 'inherit' }}>
                                            {isActive ? item.activeIcon : item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="pt-4">
                    <Divider />
                    <div className="radio-container radio-container-seller relative mt-4" style={{ "--total-radio": menu2.length } as React.CSSProperties}>
                        <div className="glider-container" style={{ width: '3px' }}>
                            {menu2.findIndex(item => item.path === location.pathname) !== -1 && (
                                <div 
                                    className="glider" 
                                    style={{ transform: `translateY(${menu2.findIndex(item => item.path === location.pathname) * 100}%)` }}
                                ></div>
                            )}
                        </div>
                        {menu2.map((item) => {
                            const isActive = item.path === location.pathname;
                            return (
                                <div onClick={handleClick(item)} className="pr-9 cursor-pointer relative z-10" key={item.name}>
                                    <div className={`${isActive ? "bg-orange-50 border-l-4 border-[#FF5A00] text-[#b33f00] font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} flex items-center px-5 py-3 transition-all duration-300`}>
                                        <ListItemIcon sx={{ color: isActive ? '#b33f00' : 'inherit' }}>
                                            {isActive ? item.activeIcon : item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;