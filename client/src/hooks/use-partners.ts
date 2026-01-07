import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPartner } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePartners(type?: 'customer' | 'supplier', search?: string) {
  const queryKey = [api.partners.list.path, type, search].filter(Boolean);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      if (search) params.append("search", search);
      
      const res = await fetch(`${api.partners.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch partners");
      return api.partners.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertPartner) => {
      const res = await fetch(api.partners.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create partner");
      return api.partners.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      toast({ title: "Partner created", description: "Successfully added to database" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.partners.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete partner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      toast({ title: "Partner deleted", description: "Removed successfully" });
    },
  });
}
