import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "accent" | "destructive";
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, color = "primary" }: StatsCardProps) {
  const colorStyles = {
    primary: "bg-blue-50 text-blue-600",
    accent: "bg-emerald-50 text-emerald-600",
    destructive: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className={`mt-4 text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          <span>{trend}</span>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span className="text-muted-foreground">مقارنة بالشهر الماضي</span>
        </div>
      )}
    </div>
  );
}
