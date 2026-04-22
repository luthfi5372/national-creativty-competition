"use client";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from "recharts";
import { Activity, PieChart as PieIcon, TrendingUp, Zap } from "lucide-react";

interface RingkasanTabProps {
  participants: any[];
  categoryData: any[];
  dailyTrendData: any[];
  isLoading: boolean;
}

export default function RingkasanTab({ 
  participants, 
  categoryData, 
  dailyTrendData, 
  isLoading 
}: RingkasanTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TREND HARIAN (MAHA KARYA STYLE) */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-[420px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-bold text-slate-800">Tren Pendaftaran Harian</h3>
            <p className="text-xs text-slate-500 font-medium">Lonjakan pendaftar NCC 13th secara real-time</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="flex-1 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrendData}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} 
                dy={12}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} 
                dx={-8}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#2563EB' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 7, shadow: '0 0 10px rgba(37,99,235,0.4)' }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KATEGORI BAR (MAHA KARYA STYLE) */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-[420px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-bold text-slate-800">Peminat Terbanyak</h3>
            <p className="text-xs text-slate-500 font-medium">Berdasarkan kategori lomba</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <PieIcon size={20} />
          </div>
        </div>
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} 
                dy={12}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[8, 8, 0, 0]} 
                barSize={36}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="text-center flex-1 border-r border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Entry</p>
              <p className="text-lg font-black text-slate-800">{participants.length}</p>
           </div>
           <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Status</p>
              <p className="text-lg font-black text-emerald-500">ACTIVE</p>
           </div>
        </div>
      </div>
    </div>
  );
}
