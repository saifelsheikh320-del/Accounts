import { useState } from "react";
import { usePartners, useCreatePartner } from "@/hooks/use-partners";
import { Plus, Search, Users, Phone, MapPin, FileText, ArrowUpRight, ArrowDownLeft, Calendar, UserCheck, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertPartnerSchema, type InsertPartner, type Partner, type Transaction } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";

export default function Partners() {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [search, setSearch] = useState("");
  const { data: partners, isLoading } = usePartners(activeTab, search);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedPartnerForStatement, setSelectedPartnerForStatement] = useState<Partner | null>(null);
  const { toast } = useToast();

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingPartner(null);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.partners.delete.path, { id }), { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      toast({ title: "تم الحذف", description: "تم حذف الشريك بنجاح" });
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingPartner
        ? buildUrl(api.partners.update.path, { id: editingPartner.id })
        : api.partners.create.path;

      const method = editingPartner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في حفظ البيانات");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      toast({
        title: editingPartner ? "تم التحديث" : "تمت الإضافة",
        description: editingPartner ? "تم تحديث بيانات الشريك بنجاح" : "تم إضافة الشريك بنجاح"
      });
      setIsDialogOpen(false);
      setEditingPartner(null);
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">العملاء والموردين</h1>
          <p className="text-muted-foreground mt-1 font-medium">إدارة شاملة لبيانات المتعاملين وكشوف الحسابات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="btn-primary gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> إضافة {activeTab === 'customer' ? 'عميل' : 'مورد'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingPartner ? `تعديل ${activeTab === 'customer' ? 'العميل' : 'المورد'}` : `إضافة ${activeTab === 'customer' ? 'عميل' : 'مورد'} جديد`}</DialogTitle>
            </DialogHeader>
            <PartnerForm
              type={activeTab}
              onSubmit={(data) => mutation.mutate(data)}
              isPending={mutation.isPending}
              initialData={editingPartner}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm h-12 inline-flex">
          <TabsTrigger value="customer" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">العملاء</TabsTrigger>
          <TabsTrigger value="supplier" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الموردين</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`بحث في ${activeTab === 'customer' ? 'العملاء' : 'الموردين'}...`}
                className="pr-10 h-11 rounded-xl border-gray-200 focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : partners?.map((partner) => (
              <div key={partner.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5"
                    onClick={() => handleEdit(partner)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
                        deleteMutation.mutate(partner.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Users className="w-8 h-8" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 font-bold h-9 bg-gray-50/50"
                    onClick={() => setSelectedPartnerForStatement(partner)}
                  >
                    <FileText className="w-4 h-4" /> كشف حساب
                  </Button>
                </div>

                <h3 className="font-black text-xl mb-4 text-gray-900">{partner.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span dir="ltr">{partner.phone || '---'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="truncate">{partner.address || '---'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">الحالة</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-gray-700">نشط</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">تاريخ الإضافة</p>
                    <p className="text-xs font-bold text-gray-700 mt-1">{new Date(partner.createdAt || Date.now()).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && partners?.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-bold">لا توجد بيانات متاحة حالياً</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>

      {/* Statement Dialog */}
      <Dialog open={!!selectedPartnerForStatement} onOpenChange={() => setSelectedPartnerForStatement(null)}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0 overflow-hidden" dir="rtl">
          <DialogHeader className="p-6 border-b bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                <FileText className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-black">كشف حساب: {selectedPartnerForStatement?.name}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedPartnerForStatement && (
              <PartnerStatement partnerId={selectedPartnerForStatement.id} partnerType={selectedPartnerForStatement.type} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PartnerStatement({ partnerId, partnerType }: { partnerId: number, partnerType: string }) {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [api.transactions.list.path, { partnerId }],
    queryFn: async () => {
      const res = await fetch(`${api.transactions.list.path}?partnerId=${partnerId}`);
      if (!res.ok) throw new Error("فشل تحميل كشف الحساب");
      return res.json();
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <p className="text-sm font-bold text-gray-500">جاري جلب المعاملات...</p>
    </div>
  );

  const totalAmount = transactions?.reduce((sum, tx) => {
    const amount = Number(tx.totalAmount);
    if (tx.type === 'sale' || tx.type === 'purchase') return sum + amount;
    if (tx.type.includes('return')) return sum - amount;
    return sum;
  }, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
            <FileText className="w-32 h-32" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">صافي الرصيد المستحق</p>
          <div className="text-3xl font-black mb-1">{totalAmount.toLocaleString()} ج.م</div>
          <p className="text-[10px] text-gray-400 font-bold">آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">عدد المعاملات</p>
            <p className="text-xl font-black text-gray-900">{transactions?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">نوع الجهة</p>
            <p className="text-xl font-black text-gray-900">{partnerType === 'customer' ? 'عميل' : 'مورد'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">رقم المعاملة</th>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">النوع</th>
              <th className="px-6 py-4">المبلغ</th>
              <th className="px-6 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions?.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{tx.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {new Date(tx.transactionDate).toLocaleDateString('ar-EG')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 shadow-sm border",
                    tx.type === 'sale' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      tx.type === 'purchase' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {tx.type === 'sale' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    {tx.type === 'sale' ? 'مبيعات' : tx.type === 'purchase' ? 'مشتريات' : tx.type === 'sale_return' ? 'مرتجع مبيعات' : 'مرتجع مشتريات'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-gray-900 text-sm">{Number(tx.totalAmount).toLocaleString()} ج.م</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">مكتمل</span>
                </td>
              </tr>
            ))}
            {transactions?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <FileText className="w-10 h-10 mb-2" />
                    <p className="font-black">لا توجد حركات مسجلة لهذا الحساب</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PartnerForm({ type, onSubmit, isPending, initialData }: { type: 'customer' | 'supplier', onSubmit: (data: any) => void, isPending: boolean, initialData?: Partner | null }) {
  const form = useForm<InsertPartner>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: type,
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
      isActive: initialData?.isActive ?? true
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 mr-1">الاسم</label>
          <Input {...form.register("name")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
          {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 mr-1">رقم الهاتف</label>
          <Input {...form.register("phone")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white text-left" dir="ltr" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 mr-1">البريد الإلكتروني</label>
          <Input {...form.register("email")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 mr-1">العنوان</label>
          <Input {...form.register("address")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="btn-primary w-full h-12 rounded-xl text-lg font-bold" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : initialData ? "تحديث البيانات" : "حفظ الشريك"}
        </Button>
      </div>
    </form>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
