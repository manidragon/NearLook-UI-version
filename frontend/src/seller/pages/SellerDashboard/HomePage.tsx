import React, { useEffect } from "react";
import SellingChart from "./SellingChart";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { fetchSellerReport } from "../../../redux/Seller/sellerSlice";
import ReportCard from "./Report/ReportCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

const Chart = [
  { name: "Today", value: "today" },
  { name: "Last 7 days", value: "daily" },
  { name: "Last 12 Month", value: "monthly" },
];

const HomePage = () => {
  const sellers = useAppSelector((state) => state.sellers);
  const dispatch = useAppDispatch();
  const [chartType, setChartType] = React.useState(Chart[0].value);

  useEffect(() => {
    dispatch(fetchSellerReport(localStorage.getItem("jwt") || ""));
  }, []);

  const handleChange = (event: any) => {
    setChartType(event.target.value);
  };
  
  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your store performance and sales metrics.</p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <ReportCard
          icon={<AccountBalanceIcon />}
          value={"₹" + (sellers.report?.totalEarnings || 0)}
          title={"Total Earnings"}
        />
        <ReportCard
          icon={<StorefrontIcon />}
          value={sellers.report?.totalSales || 0}
          title={"Total Sales"}
        />
        <ReportCard
          icon={<TrendingUpIcon />}
          value={"₹" + (sellers.report?.totalRefunds || 0)}
          title={"Total Refund"}
        />
        <ReportCard
          icon={<RemoveShoppingCartIcon />}
          value={sellers.report?.canceledOrders || 0}
          title={"Cancel Orders"}
        />
      </section>

      {/* CHART SECTION */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800">Sales Analytics</h2>
          <div className="w-full sm:w-48">
            <select
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none transition-shadow hover:shadow-sm cursor-pointer"
              value={chartType}
              onChange={handleChange}
            >
              {Chart.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full h-[350px] md:h-[450px]">
          <SellingChart chartType={chartType} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
