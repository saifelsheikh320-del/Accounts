import { useState } from "react";
import Layout from "@/components/layout";
import { Plus, Search, DollarSign, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertSalarySchema, type Salary, type Employee } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Salaries() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: salaries, isLoading: loadingSals } = useQuery<Salary[]>({
        queryKey: [api.salaries.list.path],
    });

    const { data: employees } = useQuery<Employee[]>({
        queryKey: [api.employees.list.path],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(api.salaries.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to process salary");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.salaries.list.path] });
            toast({ title: "تم التصديق", description: "تم تسجيل صرف الراتب والمزامنة مع الحسابات" });
            setIsDialogOpen(false);
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">مسيرات الرواتب</h1>
                    <p className="text-muted-foreground">صرف الرواتب الشهرية وتأثيرها المالي</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary gap-2">
                            <Plus className="w-4 h-4" /> صرف راتب جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>نموذج صرف راتب</DialogTitle>
                        </DialogHeader>
                        <SalaryForm
                            employees={employees || []}
                            onSubmit={(data) => createMutation.mutate(data)}
                            isPending={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-bold text-sm">الموظف</th>
                            <th className="p-4 font-bold text-sm">الشهر</th>
                            <th className="p-4 font-bold text-sm">المبلغ</th>
                            <th className="p-4 font-bold text-sm">التاريخ</th>
                            <th className="p-4 font-bold text-sm">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loadingSals ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل البيانات...</td></tr>
                        ) : salaries?.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد سجلات رواتب حتى الآن</td></tr>
                        ) : salaries?.map(sal => {
                            const emp = employees?.find(e => e.id === sal.employeeId);
                            return (
                                <tr key={sal.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{emp?.fullName || "موظف محذوف"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium">{sal.month}</td>
                                    <td className="p-4 text-sm font-bold text-emerald-600">{sal.amount}</td>
                                    <td className="p-4 text-xs text-gray-500">{new Date(sal.paymentDate).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-4 text-xs text-gray-400">{sal.notes || "-"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SalaryForm({ employees, onSubmit, isPending }: { employees: Employee[], onSubmit: (data: any) => void, isPending: boolean }) {
    const form = useForm({
        resolver: zodResolver(insertSalarySchema),
        defaultValues: {
            employeeId: 0,
            amount: "0",
            month: new Date().toISOString().slice(0, 7), // YYYY-MM
            notes: ""
        }
    });

    const selectedEmpId = form.watch("employeeId");

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">اختر الموظف</label>
                <Select
                    onValueChange={(val) => {
                        const emp = employees.find(e => e.id === Number(val));
                        form.setValue("employeeId", Number(val));
                        if (emp) form.setValue("amount", emp.salary);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="اختر من القائمة..." />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                        {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>{emp.fullName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.employeeId && <p className="text-red-500 text-xs">يرجى اختيار الموظف</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">الشهر</label>
                    <Input type="month" {...form.register("month")} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">المبلغ</label>
                    <Input type="number" {...form.register("amount")} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Input {...form.register("notes")} placeholder="مثال: مكافأة نهاية سنة، سلفة مستقطعة..." />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" className="btn-primary w-full" disabled={isPending}>
                    <DollarSign className="w-4 h-4 ml-2" />
                    {isPending ? "جاري المعالجة..." : "تأكيد صرف الراتب"}
                </Button>
            </div>
        </form>
    );
}
