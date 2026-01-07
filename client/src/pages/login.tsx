import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        defaultValues: {
            username: "",
            password: ""
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const user = await res.json();
            localStorage.setItem("user", JSON.stringify(user));

            toast({
                title: "مرحباً بك!",
                description: `تم تسجيل الدخول بنجاح - ${user.fullName}`
            });

            setLocation("/");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "خطأ في تسجيل الدخول",
                description: "اسم المستخدم أو كلمة المرور غير صحيحة"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4" dir="rtl">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
                    {/* Logo & Title */}
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <LogIn className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            المحاسب الذكي
                        </h1>
                        <p className="text-muted-foreground text-sm">نظام ERP متكامل لإدارة الأعمال</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                اسم المستخدم
                            </label>
                            <Input
                                {...form.register("username", { required: true })}
                                placeholder="أدخل اسم المستخدم"
                                className="h-12 bg-white/50 border-gray-200 focus:border-primary focus:ring-primary"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                كلمة المرور
                            </label>
                            <div className="relative group">
                                <Input
                                    {...form.register("password", { required: true })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="أدخل كلمة المرور"
                                    className="h-12 bg-white/50 border-gray-200 focus:border-primary focus:ring-primary pl-12"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    جاري تسجيل الدخول...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    تسجيل الدخول
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="text-center text-xs text-muted-foreground pt-4 border-t border-gray-100">
                        <p>للحصول على حساب، تواصل مع مدير النظام</p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}
