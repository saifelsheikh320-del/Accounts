import { useState } from "react";
import { Plus, Search, UserCircle, Phone, Briefcase, Calendar, Edit, Trash2, FileText, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertEmployeeSchema, type Employee, type Salary } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";

export default function Employees() {
    const [search, setSearch] = useState("");
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [selectedEmployeeForStatement, setSelectedEmployeeForStatement] = useState<Employee | null>(null);

    const { data: employees, isLoading } = useQuery<Employee[]>({
        queryKey: [api.employees.list.path],
    });

    const filteredEmployees = employees?.filter(emp =>
        emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase())
    );

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const url = editingEmployee
                ? buildUrl(api.employees.update.path, { id: editingEmployee.id })
                : api.employees.create.path;

            const method = editingEmployee ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("فشل في حفظ بيانات الموظف");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
            toast({
                title: editingEmployee ? "تم التحديث" : "تمت الإضافة",
                description: editingEmployee ? "تم تحديث بيانات الموظف بنجاح" : "تم إضافة الموظف بنجاح"
            });
            setIsDialogOpen(false);
            setEditingEmployee(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(buildUrl(api.employees.delete.path, { id }), { method: "DELETE" });
            if (!res.ok) throw new Error("فشل الحذف");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
            toast({ title: "تم الحذف", description: "تم حذف الموظف بنجاح" });
        }
    });

    const handleEdit = (emp: Employee) => {
        setEditingEmployee(emp);
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingEmployee(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
                    <p className="text-muted-foreground mt-1">إضافة وتعديل بيانات الموظفين والرواتب الأساسية</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> إضافة موظف
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>{editingEmployee ? "تعديل بيانات موظف" : "إضافة موظف جديد"}</DialogTitle>
                        </DialogHeader>
                        <EmployeeForm
                            onSubmit={(data) => mutation.mutate(data)}
                            isPending={mutation.isPending}
                            initialData={editingEmployee}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="بحث عن موظف بالاسم أو الوظيفة..."
                        className="pr-10 h-11 rounded-xl border-gray-200 focus:border-primary"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredEmployees?.map(emp => (
                    <div key={emp.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-4 left-4 flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5"
                                onClick={() => handleEdit(emp)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
                                        deleteMutation.mutate(emp.id);
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                <UserCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{emp.fullName}</h3>
                                <p className="text-sm text-primary font-bold">{emp.position || "بدون مسمى وظيفي"}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-50 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">الراتب الأساسي:</span>
                                <span className="font-black text-gray-900">{(Number(emp.salary) || 0).toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">تاريخ التعيين:</span>
                                <span className="text-gray-900 font-bold">
                                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('ar-EG') : "---"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full h-10 rounded-xl gap-2 font-bold bg-gray-50/50 hover:bg-white"
                                onClick={() => setSelectedEmployeeForStatement(emp)}
                            >
                                <FileText className="w-4 h-4" /> كشف حساب الراتب
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Employee Statement Dialog */}
            <Dialog open={!!selectedEmployeeForStatement} onOpenChange={() => setSelectedEmployeeForStatement(null)}>
                <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 overflow-hidden" dir="rtl">
                    <DialogHeader className="p-6 border-b bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                <FileText className="w-6 h-6" />
                            </div>
                            <DialogTitle className="text-2xl font-black">كشف حساب: {selectedEmployeeForStatement?.fullName}</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedEmployeeForStatement && (
                            <EmployeeStatement employeeId={selectedEmployeeForStatement.id} baseSalary={selectedEmployeeForStatement.salary} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EmployeeStatement({ employeeId, baseSalary }: { employeeId: number, baseSalary: string }) {
    const { data: salaries, isLoading } = useQuery<Salary[]>({
        queryKey: [api.salaries.list.path, { employeeId }],
        queryFn: async () => {
            const res = await fetch(`${api.salaries.list.path}?employeeId=${employeeId}`);
            if (!res.ok) throw new Error("فشل تحميل مسيرات الرواتب");
            return res.json();
        }
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm font-bold text-gray-500">جاري جلب سجل الرواتب...</p>
        </div>
    );

    const totalPaid = salaries?.reduce((sum, sal) => sum + Number(sal.amount), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
                        <DollarSign className="w-32 h-32" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">إجمالي ما تم صرفه</p>
                    <div className="text-3xl font-black mb-1">{totalPaid.toLocaleString()} ج.م</div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-gray-400 mb-1">الراتب التعاقدي</p>
                        <p className="text-xl font-black text-gray-900">{Number(baseSalary).toLocaleString()} ج.م</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                            <th className="px-6 py-4">الشهر المستحق</th>
                            <th className="px-6 py-4">تاريخ الصرف</th>
                            <th className="px-6 py-4">المبلغ</th>
                            <th className="px-6 py-4">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {salaries?.map(sal => (
                            <tr key={sal.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{sal.month}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                        {new Date(sal.paymentDate).toLocaleDateString('ar-EG')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-black text-emerald-600 text-sm">{Number(sal.amount).toLocaleString()} ج.م</span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-gray-500">{sal.notes || "---"}</p>
                                </td>
                            </tr>
                        ))}
                        {salaries?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-gray-400 font-bold">لا توجد سجلات صرف لهذا الموظف</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmployeeForm({ onSubmit, isPending, initialData }: { onSubmit: (data: any) => void, isPending: boolean, initialData?: Employee | null }) {
    const form = useForm({
        resolver: zodResolver(insertEmployeeSchema),
        defaultValues: {
            fullName: initialData?.fullName || "",
            position: initialData?.position || "",
            salary: initialData?.salary || "0",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            hireDate: initialData?.hireDate
                ? new Date(initialData.hireDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        }
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 mr-1">الاسم الكامل</label>
                    <Input {...form.register("fullName")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                    {form.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 mr-1">المسمى الوظيفي</label>
                    <Input {...form.register("position")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 mr-1">الراتب الأساسي</label>
                    <Input type="number" {...form.register("salary")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 mr-1">رقم الهاتف</label>
                    <Input {...form.register("phone")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white text-left" dir="ltr" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 mr-1">تاريخ التعيين</label>
                    <Input type="date" {...form.register("hireDate")} className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white" />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" className="btn-primary w-full h-12 rounded-xl text-lg font-bold" disabled={isPending}>
                    {isPending ? "جاري الحفظ..." : initialData ? "تحديث البيانات" : "حفظ الموظف"}
                </Button>
            </div>
        </form>
    );
}
