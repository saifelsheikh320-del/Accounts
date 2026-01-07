import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateTransactionRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: [api.transactions.list.path, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      const res = await fetch(`${api.transactions.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTransactionRequest) => {
      const res = await fetch(api.transactions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Transaction failed");
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] }); // Inventory changed
      queryClient.invalidateQueries({ queryKey: ["/api/reports/dashboard"] }); // Stats changed
      toast({ title: "Transaction Completed", description: "Successfully processed" });
    },
    onError: (err) => {
      toast({ title: "Transaction Failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.reports.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.reports.dashboard.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.reports.dashboard.responses[200].parse(await res.json());
    }
  });
}
