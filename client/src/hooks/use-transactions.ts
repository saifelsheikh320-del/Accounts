import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateTransactionRequest } from "@shared/schema";

export function useTransactions(type?: string) {
  return useQuery({
    queryKey: [api.transactions.list.path, type],
    queryFn: async () => {
      const url = type 
        ? `${api.transactions.list.path}?type=${type}`
        : api.transactions.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("فشل في تحميل المعاملات");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTransactionRequest) => {
      const res = await fetch(api.transactions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل في إنشاء المعاملة");
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] }); // Stock changes
      queryClient.invalidateQueries({ queryKey: [api.reports.dashboard.path] }); // Stats change
    },
  });
}
