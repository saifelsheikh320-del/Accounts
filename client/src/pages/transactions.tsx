import Layout from "@/components/layout";
import { useTransactions } from "@/hooks/use-transactions";
import { FileText, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">سجل المعاملات</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-muted-foreground text-sm font-medium">
              <tr>
                <th className="px-6 py-4">رقم المعاملة</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الملاحظات</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">جاري التحميل...</td></tr>
              ) : transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">#{tx.id}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-sm font-bold ${tx.type === 'sale' ? 'text-emerald-600' : 'text-blue-600'
                      }`}>
                      {tx.type === 'sale' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      {tx.type === 'sale' ? 'مبيعات' : tx.type === 'purchase' ? 'مشتريات' : tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{Number(tx.totalAmount).toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.transactionDate).toLocaleDateString('ar-EG')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{tx.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      {tx.status === 'completed' ? 'مكتمل' : 'ملغي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
