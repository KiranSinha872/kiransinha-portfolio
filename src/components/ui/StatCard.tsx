import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded bg-white flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{title}</span>
        <Icon className="w-4 h-4 text-gray-600" />
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-xl font-bold text-gray-900">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
