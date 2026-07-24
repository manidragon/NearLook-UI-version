import { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../redux/Store';
import { fetchRevenueChart } from '../../../redux/Seller/revenueChartSlice';

const SellingChart = ({chartType}:{chartType:string}) => {
  const dispatch = useAppDispatch()
  const revenueChart = useAppSelector(state => state.revenueChart)

  useEffect(() => {
    if(chartType){
      dispatch(fetchRevenueChart({type:chartType}))
    }
  }, [chartType])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={revenueChart.chart}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{fill: '#64748b', fontSize: 12}} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fill: '#64748b', fontSize: 12}} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }} 
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#ea580c" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SellingChart;