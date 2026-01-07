import { useState } from "react";
import { Plus, Search, UserCircle, Shield, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertUserSchema, type User } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Users() {
    const [search, setSearch] = useState("");
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: [api.users.list.path],
    });

    const filteredUsers = users?.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(api.users.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create user");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
            toast({ title: "تمت الإضافة", description: "تم إضافة المستخدم بنجاح" });
            setIsDialogOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`${api.users.delete.path.replace(':id', id.toString())}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete user");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
            toast({ title: "تم الحذف", description: "تم حذف المستخدم بنجاح" });
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                    <p className="text-muted-foreground">التحكم في صلاحيات الدخول للنظام</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary gap-2">
                            <Plus className="w-4 h-4" /> إضافة مستخدم
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                        </DialogHeader>
                        <UserForm
                            onSubmit={(data) => createMutation.mutate(data)}
                            isPending={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="بحث عن مستخدم..."
                        className="pr-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>جاري التحميل...</p>
                ) : filteredUsers?.map(user => (
                    <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center",
                                    user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {user.role === "admin" ? <Shield className="w-7 h-7" /> : <UserCircle className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user.fullName}</h3>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">الصلاحية:</span>
                                <span className={cn(
                                    "text-xs font-bold px-3 py-1 rounded-full",
                                    user.role === "admin"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                )}>
                                    {user.role === "admin" ? "مدير النظام" : "موظف"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">الحالة:</span>
                                <span className={cn(
                                    "text-xs font-bold px-3 py-1 rounded-full",
                                    user.isActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                )}>
                                    {user.isActive ? "نشط" : "معطل"}
                                </span>
                            </div>

                            {user.role !== "admin" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                                    onClick={() => {
                                        if (confirm(`هل أنت متأكد من حذف المستخدم "${user.fullName}"؟`)) {
                                            deleteMutation.mutate(user.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف المستخدم
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserForm({ onSubmit, isPending }: { onSubmit: (data: any) => void, isPending: boolean }) {
    const form = useForm({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
            fullName: "",
            role: "employee" as const,
            isActive: true
        }
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <Input {...form.register("fullName")} placeholder="مثال: أحمد محمد" />
                    {form.formState.errors.fullName && <p className="text-red-500 text-xs">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">اسم المستخدم</label>
                    <Input {...form.register("username")} placeholder="مثال: ahmed123" />
                    {form.formState.errors.username && <p className="text-red-500 text-xs">{form.formState.errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور</label>
                    <Input type="password" {...form.register("password")} placeholder="********" />
                    {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">الصلاحية</label>
                    <Select onValueChange={(val) => form.setValue("role", val as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر الصلاحية..." />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                            <SelectItem value="admin">مدير النظام (Admin)</SelectItem>
                            <SelectItem value="employee">موظف (Employee)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" className="btn-primary w-full" disabled={isPending}>
                    {isPending ? "جاري الحفظ..." : "حفظ المستخدم"}
                </Button>
            </div>
        </form>
    );
}
