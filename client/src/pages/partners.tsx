import { useState } from "react";
import Layout from "@/components/layout";
import { usePartners, useCreatePartner, useDeletePartner } from "@/hooks/use-partners";
import { Plus, Search, Users, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { insertPartnerSchema, type InsertPartner } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function Partners() {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [search, setSearch] = useState("");
  const { data: partners, isLoading } = usePartners(activeTab, search);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">العملاء والموردين</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary gap-2">
                <Plus className="w-4 h-4" /> إضافة جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة {activeTab === 'customer' ? 'عميل' : 'مورد'} جديد</DialogTitle>
              </DialogHeader>
              <PartnerForm type={activeTab} onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-8 space-x-reverse mb-6">
            <TabsTrigger 
              value="customer"
              className="px-8 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base"
            >
              العملاء
            </TabsTrigger>
            <TabsTrigger 
              value="supplier"
              className="px-8 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base"
            >
              الموردين
            </TabsTrigger>
          </TabsList>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder={`بحث في ${activeTab === 'customer' ? 'العملاء' : 'الموردين'}...`}
                className="pr-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              <p>جاري التحميل...</p>
            ) : partners?.map(partner => (
              <div key={partner.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{partner.name}</h3>
                      <p className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">
                        {partner.type === 'customer' ? 'عميل' : 'مورد'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  {partner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span dir="ltr">{partner.phone}</span>
                    </div>
                  )}
                  {partner.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{partner.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}

function PartnerForm({ type, onSuccess }: { type: 'customer' | 'supplier', onSuccess: () => void }) {
  const { toast } = useToast();
  const createMutation = useCreatePartner();

  const form = useForm<InsertPartner>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      name: "",
      type: type,
      phone: "",
      address: "",
      email: ""
    }
  });

  const onSubmit = async (data: InsertPartner) => {
    try {
      await createMutation.mutateAsync({ ...data, type }); // Ensure type is forced
      toast({ title: "تمت الإضافة", description: "تم إضافة الشريك بنجاح" });
      onSuccess();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">الاسم</label>
        <Input {...form.register("name")} />
        {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">رقم الهاتف</label>
        <Input {...form.register("phone")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">البريد الإلكتروني</label>
        <Input {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">العنوان</label>
        <Input {...form.register("address")} />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className="btn-primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </div>
    </form>
  );
}
