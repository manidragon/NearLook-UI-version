import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { api } from '../../../Config/Api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalFollowers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  timeSeries: {
    date: string;
    views: number;
    followers: number;
    revenue: number;
  }[];
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [engagementRange, setEngagementRange] = useState(7);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const response = await api.get('/sellers/analytics', {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress sx={{ color: '#FF5A00' }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error" variant="h6">{error || 'No data available'}</Typography>
      </Box>
    );
  }

  // Format Y-Axis ticks (e.g. 1000 -> 1k)
  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toFixed(0)}k`;
    }
    return tickItem.toString();
  };

  const statCards = [
    {
      title: "Net Earnings",
      value: `₹${data.summary.totalRevenue.toLocaleString()}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      gradient: "from-[#FF5A00] to-[#FF8C42]",
      shadow: "shadow-[0_10px_20px_rgba(255,90,0,0.2)]"
    },
    {
      title: "Profile Views",
      value: data.summary.totalViews.toLocaleString(),
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
      gradient: "from-[#3B82F6] to-[#60A5FA]",
      shadow: "shadow-[0_10px_20px_rgba(59,130,246,0.2)]"
    },
    {
      title: "Followers",
      value: data.summary.totalFollowers.toLocaleString(),
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      gradient: "from-[#10B981] to-[#34D399]",
      shadow: "shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
    },
    {
      title: "Orders Fulfilled",
      value: data.summary.totalOrders.toLocaleString(),
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      shadow: "shadow-[0_10px_20px_rgba(139,92,246,0.2)]"
    }
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Overview</h1>
        <p className="text-gray-500 mt-1">Track your business growth and customer engagement.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10 w-full">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className={`flex-1 min-w-0 relative overflow-hidden bg-gradient-to-br ${stat.gradient} ${stat.shadow} rounded-2xl p-4 lg:p-6 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            {/* Glassmorphism decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 lg:w-24 lg:h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-12 h-12 lg:w-20 lg:h-20 bg-white opacity-10 rounded-full blur-lg pointer-events-none"></div>
            
            <div className="flex flex-row justify-between items-center relative z-10 gap-2">
              <div className="min-w-0 w-full">
                <p className="text-white/90 font-medium text-[10px] lg:text-xs uppercase tracking-wider mb-1 truncate">{stat.title}</p>
                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold truncate">{stat.value}</h3>
              </div>
              <div className="bg-white/20 p-2 lg:p-3 rounded-xl backdrop-blur-sm shrink-0">
                {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 24, lg: 32 } } })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Revenue Growth (30 Days)</h2>
            <span className="px-3 py-1 bg-orange-100 text-[#FF5A00] text-xs font-bold rounded-full">Last 30 Days</span>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart
                data={data.timeSeries}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5A00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF5A00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={formatYAxis} 
                  width={45}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label: any) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF5A00" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Views & Followers Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Engagement</h2>
            <select
              className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5 outline-none cursor-pointer transition-colors hover:bg-blue-100"
              value={engagementRange}
              onChange={(e) => setEngagementRange(Number(e.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={15}>Last 15 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart
                data={data.timeSeries.slice(-engagementRange)} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={12}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return engagementRange <= 7 
                      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                      : `${date.getDate()}/${date.getMonth() + 1}`;
                  }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  labelFormatter={(label: any) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="views" name="Profile Views" fill="#3B82F6" radius={[4, 4, 4, 4]} />
                <Bar dataKey="followers" name="New Followers" fill="#10B981" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
