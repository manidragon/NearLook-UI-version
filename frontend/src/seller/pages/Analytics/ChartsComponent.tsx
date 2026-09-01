import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

interface ChartsComponentProps {
  data: any;
  engagementRange: number;
  setEngagementRange: (val: number) => void;
  formatYAxis: (val: number) => string;
}

const ChartsComponent: React.FC<ChartsComponentProps> = ({ data, engagementRange, setEngagementRange, formatYAxis }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Revenue Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Revenue Growth (30 Days)</h2>
          <span className="px-3 py-1 bg-orange-100 text-[#c24100] text-xs font-bold rounded-full">Last 30 Days</span>
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
            aria-label="Filter engagement analytics by time period"
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
  );
};

export default ChartsComponent;
