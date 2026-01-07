import { Switch, Route, useLocation, useSearch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import POS from "@/pages/pos";
import Inventory from "@/pages/inventory";
import Partners from "@/pages/partners";
import Employees from "@/pages/employees";
import Salaries from "@/pages/salaries";
import Accounting from "@/pages/accounting";
import Users from "@/pages/users";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Audit from "@/pages/audit";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  if (location === "/login") return <>{children}</>;

  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLocation("/login");
    }
  }, [setLocation]);

  const user = localStorage.getItem("user");
  if (!user) return null;

  return <>{children}</>;
}

const POSRoute = () => {
  const [location] = useLocation();
  const search = useSearch();
  return <POS key={location + search} />;
};

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route path="/pos" component={POSRoute} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/audit" component={Audit} />
        <Route path="/partners" component={Partners} />
        <Route path="/employees" component={Employees} />
        <Route path="/salaries" component={Salaries} />
        <Route path="/accounting" component={Accounting} />
        <Route path="/users" component={Users} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
