// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\components\Sidebar\Sidebar.tsx

import * as React from "react";
import {
  AccountBox,
  Replay,
  SwapHoriz,
} from "@mui/icons-material";

import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";

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
    path: "/seller",
    icon: <DashboardIcon className="text-primary-color" />,
    activeIcon: <DashboardIcon className="text-white" />,
  },
  {
    name: "Analytics",
    path: "/seller/analytics",
    icon: <TrendingUpIcon className="text-primary-color" />,
    activeIcon: <TrendingUpIcon className="text-white" />,
  },
  {
    name: "Orders",
    path: "/seller/orders",
    icon: <ShoppingBagIcon className="text-primary-color" />,
    activeIcon: <ShoppingBagIcon className="text-white" />,
  },

  {
    name: "Returns",
    path: "/seller/returns",
    icon: <Replay className="text-primary-color" />,
    activeIcon: <Replay className="text-white" />,
  },
  {
    name: "Replacements",
    path: "/seller/replacements",
    icon: <SwapHoriz className="text-primary-color" />,
    activeIcon: <SwapHoriz className="text-white" />,
  },
  {
    name: "Products",
    path: "/seller/products",
    icon: <InventoryIcon className="text-primary-color" />,
    activeIcon: <InventoryIcon className="text-white" />,
  },
  {
    name: "Stock Management",
    path: "/seller/stock",
    icon: <WarehouseIcon className="text-primary-color" />,
    activeIcon: <WarehouseIcon className="text-white" />,
  },
  {
    name: "Offline Sale",
    path: "/seller/offline-sale",
    icon: <ReceiptLongIcon className="text-primary-color" />,
    activeIcon: <ReceiptLongIcon className="text-white" />,
  },
  {
    name: "Add Product",
    path: "/seller/add-product",
    icon: <AddIcon className="text-primary-color" />,
    activeIcon: <AddIcon className="text-white" />,
  },

  {
    name: "Transaction",
    path: "/seller/transaction",
    icon: <ReceiptIcon className="text-primary-color" />,
    activeIcon: <ReceiptIcon className="text-white" />,
  },
  {
  name: "Enquiries",
  path: "/seller/enquiries",
  icon: <EmailIcon className="text-primary-color" />,
  activeIcon: <EmailIcon className="text-white" />,
},
  {
  name: "Chats",
  path: "/seller/chats",
  icon: <ChatIcon className="text-primary-color" />,
  activeIcon: <ChatIcon className="text-white" />,
},
];

const menu2 = [
  {
    name: "Account",
    path: "/seller/account",
    icon: <AccountBox className="text-primary-color" />,
    activeIcon: <AccountBox className="text-white" />,
  },
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

const SellerSidebar = ({ toggleDrawer }: SidebarProps) => {

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
                className="flex flex-col justify-between h-full w-[300px] border-r pt-5 pb-32 lg:pb-5 overflow-y-auto"
            >
                <div>
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
                                    <div className={`${isActive ? "text-primary-color font-bold" : "text-gray-600"} flex items-center px-5 py-3 rounded-r-full transition-colors`}>
                                        <ListItemIcon sx={{ color: isActive ? '#FF5A00' : 'inherit' }}>
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
                                    <div className={`${isActive ? "text-primary-color font-bold" : "text-gray-600"} flex items-center px-5 py-3 rounded-r-full transition-colors`}>
                                        <ListItemIcon sx={{ color: isActive ? '#FF5A00' : 'inherit' }}>
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

export default SellerSidebar;