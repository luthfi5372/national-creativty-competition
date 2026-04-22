"use client";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  isLoading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  isLoading 
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-32">
      <h4 className="text-slate-500 font-medium text-sm mb-4 leading-none">{title}</h4>
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          {isLoading ? (
            <span className="inline-block w-24 h-8 bg-slate-100 animate-pulse rounded-lg"></span>
          ) : (
            value.toLocaleString()
          )}
        </h2>
        {trend && (
          <span className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-md mb-0.5
            ${trend.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}
          `}>
            {trend.isUp ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
