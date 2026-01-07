import Layout from "@/components/layout";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إعدادات النظام</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">إعدادات المتجر</h2>
              <p className="text-sm text-muted-foreground">تعديل بيانات المتجر والعملة</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">اسم المتجر</label>
              <Input defaultValue="المحاسب الذكي" />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input defaultValue="القاهرة، مصر" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">العملة</label>
              <Input defaultValue="EGP" />
            </div>

            <Button className="btn-primary w-full md:w-auto">حفظ التغييرات</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
