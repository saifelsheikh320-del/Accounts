import { useDashboardStats } from "@/hooks/use-dashboard";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Data for Sales/Purchases comparison
  const financialData = [
    { name: 'المبيعات', amount: Number(stats?.breakdown.sales || 0), color: '#10b981' },
    { name: 'المشتريات', amount: Number(stats?.breakdown.purchases || 0), color: '#0ea5e9' },
    { name: 'مرتجع مبيعات', amount: Number(stats?.breakdown.saleReturns || 0), color: '#ef4444' },
    { name: 'مرتجع مشتريات', amount: Number(stats?.breakdown.purchaseReturns || 0), color: '#f59e0b' },
  ];

  // Data for Stock categories (Using real data from stats if possible)
  const stockData = [
    { name: 'منخفض المخزون', value: stats?.lowStockCount || 0 },
    { name: 'مبيعات المنتجات', value: stats?.topSellingProducts.length || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">التقارير التحليلية</h1>
          <p className="text-muted-foreground mt-1 font-medium">تحليل شامل لأداء المحل والمخزون</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-emerald-100 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-700 font-bold">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{(stats?.totalSales || 0).toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-blue-100 bg-blue-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 font-bold">إجمالي الأرباح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">{(stats?.totalProfits || 0).toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-red-100 bg-red-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 font-bold">منتجات منخفضة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">{stats?.lowStockCount || 0} صنف</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm h-12">
          <TabsTrigger value="financial" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">التقارير المالية</TabsTrigger>
          <TabsTrigger value="inventory" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">تقارير المخزون</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  مقارنة المبيعات والمشتريات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  توزيع الحركة المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                منتجات منخفضة المخزون
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats?.lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-bold">{product.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {product.sku || '---'}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">الكمية الحالية: <span className="text-red-600 font-bold">{product.quantity}</span></div>
                      <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded border">الحد الأدنى: {product.minStockLevel}</div>
                    </div>
                  </div>
                ))}
                {stats?.lowStockProducts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">لا توجد منتجات منخفضة المخزون حالياً</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
