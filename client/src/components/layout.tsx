import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/pos", label: "نقطة البيع", icon: ShoppingCart },
    { href: "/inventory", label: "المخزون", icon: Package },
    { href: "/partners", label: "العملاء والموردين", icon: Users },
    { href: "/transactions", label: "المعاملات", icon: FileText },
    { href: "/reports", label: "التقارير", icon: FileText },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-primary">نظام إدارة ذكي</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-100 shadow-xl transition-transform duration-300 md:translate-x-0 md:static md:shadow-none",
        !isSidebarOpen && "translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            المحاسب الذكي
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة متكاملة</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "sidebar-link group",
                isActive && "active"
              )}>
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
