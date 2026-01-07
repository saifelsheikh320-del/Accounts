import { useState } from "react";
import Layout from "@/components/layout";
import { Plus, Search, BookOpen, BarChart2, MoreVertical, ArrowLeftRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { type Account, type JournalEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Accounting() {
    const [activeTab, setActiveTab] = useState("journals");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">النظام المحاسبي (ERP)</h1>
                <p className="text-muted-foreground">القيود اليومية، شجرة الحسابات، والتقارير المالية الاحترافية</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm mb-6 h-12">
                    <TabsTrigger value="journals" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <BookOpen className="w-4 h-4 ml-2" />
                        القيود اليومية
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="px-8 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                        <BarChart2 className="w-4 h-4 ml-2" />
                        شجرة الحسابات
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="journals">
                    <JournalEntriesView />
                </TabsContent>

                <TabsContent value="accounts">
                    <AccountsView />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function JournalEntriesView() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: entries, isLoading } = useQuery<JournalEntry[]>({
        queryKey: [api.journalEntries.list.path],
    });

    const { data: accounts } = useQuery<Account[]>({
        queryKey: [api.accounts.list.path],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(api.journalEntries.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create entry");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.journalEntries.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
            toast({ title: "تم الحفظ", description: "تم تسجيل القيد المحاسبي بنجاح" });
            setIsDialogOpen(false);
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary gap-2">
                            <Plus className="w-4 h-4" /> قيد يدوي جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>إنشاء قيد محاسبي يدوي</DialogTitle>
                        </DialogHeader>
                        <JournalForm accounts={accounts || []} onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-bold">البيان</th>
                            <th className="p-4 text-sm font-bold">المرجع</th>
                            <th className="p-4 text-sm font-bold">التاريخ</th>
                            <th className="p-4 text-sm font-bold">العمليات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground animate-pulse">جاري جلب القيود...</td></tr>
                        ) : entries?.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا يوجد قيود مسجلة بعد</td></tr>
                        ) : entries?.map(entry => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-sm">{entry.description}</td>
                                <td className="p-4 text-xs font-mono text-gray-500">{entry.reference || "---"}</td>
                                <td className="p-4 text-xs text-gray-400">{new Date(entry.entryDate).toLocaleDateString('ar-EG')}</td>
                                <td className="p-4 text-sm"><Button variant="ghost" size="sm" className="text-primary h-8 underline">عرض التفاصيل</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function JournalForm({ accounts, onSubmit, isPending }: { accounts: Account[], onSubmit: (data: any) => void, isPending: boolean }) {
    const form = useForm({
        defaultValues: {
            description: "",
            reference: "",
            items: [
                { accountId: 0, debit: 0, credit: 0 },
                { accountId: 0, debit: 0, credit: 0 }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const items = form.watch("items");
    const totalDebit = items.reduce((sum, item) => sum + Number(item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + Number(item.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">البيان (وصف القيد)</label>
                    <Input {...form.register("description")} placeholder="مثال: فاتورة مصروفات كهرباء..." required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">رقم المرجع (اختياري)</label>
                    <Input {...form.register("reference")} placeholder="رقم السند أو الفاتورة" />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold flex items-center">
                    <ArrowLeftRight className="w-4 h-4 ml-2 text-primary" />
                    تفاصيل القيد
                </label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="col-span-6 space-y-1">
                                <label className="text-[10px] text-gray-500">الحساب</label>
                                <Select onValueChange={(val) => form.setValue(`items.${index}.accountId`, Number(val))}>
                                    <SelectTrigger className="h-9 bg-white">
                                        <SelectValue placeholder="اختر حساباً..." />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] text-gray-500">مدين</label>
                                <Input type="number" {...form.register(`items.${index}.debit`)} className="h-9 bg-white" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] text-gray-500">دائن</label>
                                <Input type="number" {...form.register(`items.${index}.credit`)} className="h-9 bg-white" />
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-9" onClick={() => remove(index)}>حذف</Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: 0, debit: 0, credit: 0 })} className="w-full border-dashed">
                    <Plus className="w-4 h-4 ml-2" /> إضافة سطر جديد
                </Button>
            </div>

            <div className={cn(
                "flex justify-between items-center p-4 rounded-xl text-sm font-bold",
                isBalanced ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            )}>
                <div className="flex gap-8">
                    <span>إجمالي مدين: {totalDebit}</span>
                    <span>إجمالي دائن: {totalCredit}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isBalanced ? "القيد متوازن ✅" : "القيد غير متوازن ❌"}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" className="btn-primary w-full h-12 text-lg" disabled={isPending || !isBalanced}>
                    {isPending ? "جاري معالجة القيد..." : "ترحيل القيد للمحاسبة"}
                </Button>
            </div>
        </form>
    );
}

function AccountsView() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: accounts, isLoading } = useQuery<Account[]>({
        queryKey: [api.accounts.list.path],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(api.accounts.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create account");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
            toast({ title: "تم الإضافة", description: "تم إضافة الحساب لشجرة الحسابات" });
            setIsDialogOpen(false);
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary gap-2">
                            <Plus className="w-4 h-4" /> إضافة حساب
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>إضافة حساب جديد (Chart of Accounts)</DialogTitle>
                        </DialogHeader>
                        <AccountForm onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {isLoading ? (
                    <p>جاري تحميل شجرة الحسابات...</p>
                ) : accounts?.map(acc => (
                    <div key={acc.id} className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between border-r-4 border-r-primary">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{acc.code}</span>
                                <span className="font-bold text-lg">{acc.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">النوع: {acc.type}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-gray-400">الرصيد الحالي</p>
                            <p className={cn("text-xl font-black", Number(acc.balance) >= 0 ? "text-emerald-600" : "text-red-600")}>
                                {acc.balance}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AccountForm({ onSubmit, isPending }: { onSubmit: (data: any) => void, isPending: boolean }) {
    const form = useForm({
        defaultValues: {
            code: "",
            name: "",
            type: "asset",
            balance: "0"
        }
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">كود الحساب (مثلاً: 1101)</label>
                    <Input {...form.register("code")} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">نوع الحساب</label>
                    <Select onValueChange={(val) => form.setValue("type", val as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر النوع..." />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                            <SelectItem value="asset">أصول (Assets)</SelectItem>
                            <SelectItem value="liability">خصوم (Liabilities)</SelectItem>
                            <SelectItem value="equity">حقوق ملكية (Equity)</SelectItem>
                            <SelectItem value="revenue">إيرادات (Revenue)</SelectItem>
                            <SelectItem value="expense">مصروفات (Expense)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">اسم الحساب</label>
                <Input {...form.register("name")} required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">الرصيد الافتتاحي</label>
                <Input type="number" {...form.register("balance")} />
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" className="btn-primary w-full" disabled={isPending}>
                    {isPending ? "جاري الإضافة..." : "حفظ الحساب"}
                </Button>
            </div>
        </form>
    );
}
