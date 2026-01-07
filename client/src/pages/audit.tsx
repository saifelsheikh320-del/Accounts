import { useState } from "react";
import Layout from "@/components/layout";
import { useProducts, useUpdateProduct } from "@/hooks/use-products";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { Search, ClipboardCheck, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Audit() {
    const [search, setSearch] = useState("");
    const { data: products, isLoading } = useProducts(search);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [newQuantity, setNewQuantity] = useState<number>(0);
    const [notes, setNotes] = useState("");
    const { toast } = useToast();

    const createTransaction = useCreateTransaction();

    const handleAudit = (product: any) => {
        setSelectedProduct(product);
        setNewQuantity(product.quantity);
        setNotes("");
    };

    const handleSaveAdjustment = async () => {
        if (!selectedProduct) return;

        try {
            const diff = newQuantity - selectedProduct.quantity;
            if (diff === 0) {
                toast({ title: "لا يوجد تغيير", description: "الكمية الجديدة مطابقة للكمية الحالية" });
                return;
            }

            await createTransaction.mutateAsync({
                type: "adjustment",
                userId: 1, // Hardcoded
                items: [{
                    productId: selectedProduct.id,
                    quantity: diff, // Can be positive or negative
                    price: Number(selectedProduct.costPrice) // Adjustments usually recorded at cost
                }],
                notes: notes || "تسوية جرد يدوية"
            });

            toast({ title: "تم الجرد", description: "تم تحديث المخزون وتسجيل التسوية بنجاح" });
            setSelectedProduct(null);
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "فشل إتمام عملية التسوية" });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ClipboardCheck className="w-8 h-8 text-primary" />
                    جرد المخازن والتسويات
                </h1>
                <p className="text-muted-foreground">مطابقة الكمية الفعلية مع كمية النظام وتسجيل الفروقات</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="بحث عن منتج للجرد..."
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
                                <th className="px-6 py-4">الكمية الحالية (النظام)</th>
                                <th className="px-6 py-4">آخر تحديث</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-8">جاري التحميل...</td></tr>
                            ) : products?.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">SKU: {product.sku || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-lg">{product.quantity}</span> قطعة
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(product.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAudit(product)}>
                                            <ArrowRightLeft className="w-4 h-4" /> جرد / تسوية
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="sm:max-w-[450px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>جرد وتسوية: {selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-bold">تنبيه الجرد:</p>
                                <p>قم بإدخال الكمية الفعلية الموجودة في المخزن الآن. سيقوم النظام بحساب الفارق وتسجيله كعملية تسوية تلقائياً.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">الكمية الحالية (النظام)</label>
                                <div className="p-3 bg-gray-50 rounded-lg font-bold text-xl text-center border border-gray-100">
                                    {selectedProduct?.quantity}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الكمية الفعلية (الجرد)</label>
                                <Input
                                    type="number"
                                    className="text-center text-xl font-bold h-12"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-medium">الفارق (الزيادة/النقص)</p>
                            <p className={`text-2xl font-black ${newQuantity - (selectedProduct?.quantity || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {newQuantity - (selectedProduct?.quantity || 0) > 0 ? '+' : ''}
                                {newQuantity - (selectedProduct?.quantity || 0)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظات التسوية</label>
                            <Input
                                placeholder="مثلاً: تالف، عجز في الجرد، بضاعة زائدة..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>إلغاء</Button>
                            <Button
                                className="flex-1 btn-primary"
                                onClick={handleSaveAdjustment}
                                disabled={createTransaction.isPending}
                            >
                                {createTransaction.isPending ? "جاري الحفظ..." : "اعتماد الجرد"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
