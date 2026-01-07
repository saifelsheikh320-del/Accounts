import { Link, useLocation, useSearch } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  RefreshCcw,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSync } from "@/hooks/use-sync";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const search = useSearch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  const { isOnline, status, lastSync, triggerSync } = useSync();

  const navItems = [
    { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/pos?type=sale", label: "المبيعات", icon: ShoppingCart },
    { href: "/pos?type=sale_return", label: "مرتجع مبيعات", icon: RefreshCcw },
    { href: "/pos?type=purchase", label: "المشتريات", icon: ArrowDownLeft },
    { href: "/pos?type=purchase_return", label: "مرتجع مشتريات", icon: ArrowUpRight },
    { href: "/inventory", label: "المخزون", icon: Package },
    { href: "/audit", label: "الجرد والتسويات", icon: ClipboardCheck },
    { href: "/partners", label: "العملاء والموردين", icon: Users },
    { href: "/employees", label: "الموظفين", icon: Users },
    { href: "/salaries", label: "الرواتب", icon: FileText },
    { href: "/accounting", label: "القيود والحسابات", icon: FileText },
    { href: "/users", label: "المستخدمين", icon: Users },
    { href: "/reports", label: "التقارير المالية", icon: FileText },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-primary">نظام إدارة ذكي</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 bg-white border-l border-gray-100 shadow-xl transition-all duration-300 md:translate-x-0 md:static md:shadow-none flex flex-col h-full overflow-hidden",
        isCollapsed ? "w-20" : "w-64",
        isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          {!isCollapsed && (
            <div className="animate-in fade-in duration-300 overflow-hidden">
              <h1 className="text-xl font-black text-primary tracking-tighter">المحاسب الذكي</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">إدارة متكاملة</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-0.5 custom-scrollbar">
          {/* Dashboard Section */}
          <div className="mb-2">
            <Link href="/" title={isCollapsed ? "لوحة التحكم" : ""} className={cn(
              "sidebar-link group py-2",
              location === "/" && "active",
              isCollapsed && "justify-center px-0"
            )}>
              <LayoutDashboard className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", location === "/" && "text-primary")} />
              {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">لوحة التحكم</span>}
            </Link>
          </div>

          {/* Sales Section */}
          <div className="mb-2">
            {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 px-3">المبيعات والمشتريات</p>}
            {navItems.filter(item =>
              ["/pos?type=sale", "/pos?type=sale_return", "/pos?type=purchase", "/pos?type=purchase_return"].includes(item.href)
            ).map((item) => {
              const Icon = item.icon;
              const isPosItem = item.href.startsWith("/pos?");
              const itemSearch = item.href.split('?')[1];

              const currentParams = new URLSearchParams(search);
              const itemParams = new URLSearchParams(itemSearch);

              const isActualActive = isPosItem
                ? (location === "/pos" && currentParams.get('type') === itemParams.get('type'))
                : (location === item.href);

              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""} className={cn(
                  "sidebar-link group py-2",
                  isActualActive && "active",
                  isCollapsed && "justify-center px-0"
                )}>
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", isActualActive && "text-primary")} />
                  {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Inventory Section */}
          <div className="mb-2">
            {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 px-3">المخزون</p>}
            {navItems.filter(item =>
              ["/inventory", "/audit", "/partners"].includes(item.href)
            ).map((item) => {
              const Icon = item.icon;
              const isActualActive = location === item.href;

              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""} className={cn(
                  "sidebar-link group py-2",
                  isActualActive && "active",
                  isCollapsed && "justify-center px-0"
                )}>
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", isActualActive && "text-primary")} />
                  {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Employees Section */}
          <div className="mb-2">
            {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 px-3">الموارد البشرية</p>}
            {navItems.filter(item =>
              ["/employees", "/salaries"].includes(item.href)
            ).map((item) => {
              const Icon = item.icon;
              const isActualActive = location === item.href;

              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""} className={cn(
                  "sidebar-link group py-2",
                  isActualActive && "active",
                  isCollapsed && "justify-center px-0"
                )}>
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", isActualActive && "text-primary")} />
                  {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Accounting Section */}
          <div className="mb-2">
            {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 px-3">المحاسبة</p>}
            {navItems.filter(item =>
              ["/accounting", "/reports"].includes(item.href)
            ).map((item) => {
              const Icon = item.icon;
              const isActualActive = location === item.href;

              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""} className={cn(
                  "sidebar-link group py-2",
                  isActualActive && "active",
                  isCollapsed && "justify-center px-0"
                )}>
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", isActualActive && "text-primary")} />
                  {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* System Section */}
          <div className="mb-2">
            {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1 px-3">النظام</p>}
            {navItems.filter(item =>
              ["/users", "/settings"].includes(item.href)
            ).map((item) => {
              const Icon = item.icon;
              const isActualActive = location === item.href;

              return (
                <Link key={item.href} href={item.href} title={isCollapsed ? item.label : ""} className={cn(
                  "sidebar-link group py-2",
                  isActualActive && "active",
                  isCollapsed && "justify-center px-0"
                )}>
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110 shrink-0", isActualActive && "text-primary")} />
                  {!isCollapsed && <span className="font-medium text-sm animate-in fade-in slide-in-from-right-2">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* User & Sync Info (Inside Scrollable Area) */}
          <div className="pt-6 pb-2 space-y-3 mt-8 border-t border-gray-100">
            {/* User Card */}
            {(() => {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                const user = JSON.parse(userStr);
                return (
                  <div className={cn("p-3 bg-gray-50 rounded-xl border border-gray-100", isCollapsed && "px-1 flex flex-col items-center")}>
                    {!isCollapsed && (
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">البروفايل</p>
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          isOnline ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    )}
                    <div className={cn("flex flex-col", isCollapsed && "items-center")}>
                      {!isCollapsed ? (
                        <p className="font-bold text-sm text-gray-900 truncate">{user.fullName}</p>
                      ) : (
                        <div className={cn("w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mb-1")}>
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          localStorage.removeItem("user");
                          window.location.href = "/login";
                        }}
                        className={cn(
                          "text-[11px] text-red-600 hover:text-red-700 font-bold underline transition-colors",
                          !isCollapsed ? "mt-2" : "text-[9px]"
                        )}
                        title="تسجيل الخروج"
                      >
                        {!isCollapsed ? "تسجيل الخروج" : "خروج"}
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Sync Status Card */}
            <div className={cn(
              "flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group",
              isCollapsed && "flex-col p-1 gap-1"
            )}
              title={isCollapsed ? (status === "syncing" ? "جاري المزامنة..." : "المزامنة السحابية") : ""}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all",
                status === "syncing" ? "bg-blue-50 text-blue-600 animate-spin" :
                  status === "error" ? "bg-red-50 text-red-600" : "bg-white text-gray-600 shadow-sm"
              )}>
                {status === "syncing" ? <RefreshCw className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in">
                  <p className="text-[11px] font-bold truncate text-gray-900">
                    {status === "syncing" ? "جاري المزامنة..." : "المزامنة السحابية"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate lowercase">
                    {lastSync ? `${lastSync.toLocaleTimeString('ar-EG')}` : "غير مزامن"}
                  </p>
                </div>
              )}
              {isOnline && status !== "syncing" && (
                <button
                  onClick={() => triggerSync()}
                  className={cn("p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-400", isCollapsed && "mt-1")}
                  title="مزامنة الآن"
                >
                  <RefreshCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
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
