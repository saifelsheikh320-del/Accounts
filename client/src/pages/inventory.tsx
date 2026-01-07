import { useState } from "react";
import Layout from "@/components/layout";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { z } from "zod";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts(search);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const deleteMutation = useDeleteProduct();

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteMutation.mutateAsync(id);
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-muted-foreground">قائمة المنتجات ومراقبة الكميات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
            </DialogHeader>
            <ProductForm
              defaultValues={editingProduct}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="بحث باسم المنتج أو الكود..."
              className="pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-muted-foreground text-sm font-medium">
              <tr>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">سعر التكلفة</th>
                <th className="px-6 py-4">سعر البيع</th>
                <th className="px-6 py-4">الكمية</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">جاري التحميل...</td></tr>
              ) : products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.category || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{Number(product.costPrice).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{Number(product.sellingPrice).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.quantity <= (product.minStockLevel || 5)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {product.quantity} قطعة
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Form Schema with coercion for numbers
const formSchema = insertProductSchema.extend({
  quantity: z.coerce.number(),
  costPrice: z.coerce.number(),
  sellingPrice: z.coerce.number(),
  minStockLevel: z.coerce.number(),
});

function ProductForm({ defaultValues, onSuccess }: { defaultValues?: any, onSuccess: () => void }) {
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      minStockLevel: 5
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Convert numbers to strings for the API schema which expects numeric/decimal as string sometimes
      // But actually our schema defined numeric fields which drizzle-zod might expect as strings or numbers
      // Let's pass numbers, if it fails we fix. Our hook handles stringification.

      const payload = {
        ...data,
        costPrice: String(data.costPrice),
        sellingPrice: String(data.sellingPrice),
      };

      if (defaultValues?.id) {
        await updateMutation.mutateAsync({ id: defaultValues.id, ...payload });
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المنتج بنجاح" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "تمت الإضافة", description: "تم إضافة المنتج الجديد بنجاح" });
      }
      onSuccess();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحفظ" });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم المنتج</label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">كود المنتج (SKU)</label>
          <Input {...form.register("sku")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">التصنيف</label>
        <Input {...form.register("category")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">سعر الشراء</label>
          <Input type="number" step="0.01" {...form.register("costPrice")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">سعر البيع</label>
          <Input type="number" step="0.01" {...form.register("sellingPrice")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">الكمية الحالية</label>
          <Input type="number" {...form.register("quantity")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">حد الطلب (Minimum)</label>
          <Input type="number" {...form.register("minStockLevel")} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ البيانات"}
        </Button>
      </div>
    </form>
  );
}
