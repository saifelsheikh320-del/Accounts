import { useState, useRef, useEffect } from "react";
import { Settings as SettingsIcon, Globe, Upload, Image as ImageIcon, Trash2, Cloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.settings.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({ title: "تم الحفظ", description: "تم تحديث الإعدادات بنجاح" });
    }
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currencies = [
    { code: "EGP", name: "جنيه مصري" },
    { code: "USD", name: "دولار أمريكي" },
    { code: "SAR", name: "ريال سعودي" },
    { code: "AED", name: "درهم إماراتي" },
    { code: "KWD", name: "دينار كويتي" },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">تخصيص النظام وإعدادات المزامنة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            شعار المحل
          </h3>

          <div className="relative group">
            <div className="w-40 h-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl"
            >
              <Upload className="w-8 h-8 text-white" />
            </button>
          </div>

          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleLogoUpload}
          />

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => fileInputRef.current?.click()}>
              تغيير الشعار
            </Button>
            {logoPreview && (
              <Button variant="destructive" size="icon" className="rounded-xl w-12" onClick={() => setLogoPreview(null)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* General Settings */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              mutation.mutate(data);
            }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold pb-4 border-b border-gray-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                المعلومات الأساسية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-1">اسم المحل</label>
                  <Input name="storeName" defaultValue={settings?.storeName} className="h-12 rounded-xl bg-gray-50/50 border-gray-200" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-1">رقم الهاتف</label>
                  <Input name="phone" defaultValue={settings?.phone} className="h-12 rounded-xl bg-gray-50/50 border-gray-200 text-left" dir="ltr" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-1">العملة الافتراضية</label>
                  <Select name="currency" defaultValue={settings?.currency || "EGP"}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-200">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code} className="font-medium">{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 mr-1">العنوان</label>
                  <Input name="address" defaultValue={settings?.address} className="h-12 rounded-xl bg-gray-50/50 border-gray-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold pb-4 border-b border-gray-100 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                إعدادات المزامنة السحابية (للنسخة المكتبية)
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">رابط السيرفر السحابي (Remote URL)</label>
                <Input
                  name="remoteUrl"
                  defaultValue={settings?.remoteUrl}
                  placeholder="مثال: https://my-accounting-site.com"
                  className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-blue-500"
                  dir="ltr"
                />
                <p className="text-[10px] text-muted-foreground mr-1">هذا الرابط يستخدم لمزامنة البيانات بين هذا البرنامج والموقع بضغطة زر واحدة.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" disabled={mutation.isPending} className="h-12 px-12 rounded-xl font-bold btn-primary text-white gap-2">
                <Save className="w-4 h-4" />
                {mutation.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
