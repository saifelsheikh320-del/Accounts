import Layout from "@/components/layout";
import { StatsCard } from "@/components/stats-card";
import { useDashboardStats } from "@/hooks/use-dashboard";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = stats?.recentTransactions?.slice(0, 5).map(tx => ({
    name: new Date(tx.transactionDate).toLocaleDateString('ar-EG'),
    amount: Number(tx.totalAmount)
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المتجر</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المبيعات"
          value={`${stats?.totalSales.toLocaleString() ?? 0} ج.م`}
          icon={DollarSign}
          color="primary"
        />
        <StatsCard
          title="صافي الأرباح"
          value={`${stats?.totalProfits.toLocaleString() ?? 0} ج.م`}
          icon={TrendingUp}
          color="accent"
        />
        <StatsCard
          title="نواقص المخزون"
          value={stats?.lowStockCount ?? 0}
          icon={AlertTriangle}
          color="destructive"
        />
        <StatsCard
          title="المعاملات الأخيرة"
          value={stats?.recentTransactions.length ?? 0}
          icon={ShoppingCart}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            حركة المبيعات الأخيرة
          </h3>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">أحدث العمليات</h3>
          <div className="space-y-4">
            {stats?.recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {tx.type === 'sale' ? <ArrowUpRight className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {tx.type === 'sale' ? 'عملية بيع' : tx.type === 'purchase' ? 'شراء بضاعة' : 'مرتجع'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.transactionDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'sale' ? 'text-emerald-600' : 'text-foreground'}`}>
                  {Number(tx.totalAmount).toLocaleString()} ج.م
                </span>
              </div>
            ))}
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">لا توجد عمليات حديثة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
