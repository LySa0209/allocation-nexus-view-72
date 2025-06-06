import React from 'react';
interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}
const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'bg-white'
}) => {
  return <div className={`metrics-card ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="font-bold mt-1 text-2xl">{value}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="p-2 rounded-full bg-zinc-500">
          {React.cloneElement(icon as React.ReactElement, {
          className: 'h-5 w-5 text-primary2'
        })}
        </div>
      </div>
      
      {trend && <div className="mt-2">
          <span className={`inline-flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        </div>}
    </div>;
};
export default MetricsCard;