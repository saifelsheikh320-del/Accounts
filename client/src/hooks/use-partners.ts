import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPartner, type UpdatePartnerRequest } from "@shared/schema";

export function usePartners(type?: 'customer' | 'supplier', search?: string) {
  const queryKey = [api.partners.list.path, type, search].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (search) params.search = search;
      
      const queryString = new URLSearchParams(params).toString();
      const url = `${api.partners.list.path}?${queryString}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("فشل في تحميل البيانات");
      return api.partners.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPartner) => {
      const res = await fetch(api.partners.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل في الإضافة");
      return api.partners.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePartnerRequest & { id: number }) => {
      const url = buildUrl(api.partners.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل في التحديث");
      return api.partners.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.partners.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("فشل في الحذف");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
    },
  });
}
