import { useState } from "react";
import Layout from "@/components/layout";
import { useProducts } from "@/hooks/use-products";
import { usePartners } from "@/hooks/use-partners";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export default function POS() {
  const [search, setSearch] = useState("");
  const { data: products } = useProducts(search);
  const { data: partners } = usePartners('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  
  const { toast } = useToast();
  const createTransaction = useCreateTransaction();

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: Number(product.sellingPrice), quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      await createTransaction.mutateAsync({
        type: "sale",
        userId: 1, // Hardcoded for now, normally from auth context
        partnerId: selectedPartnerId ? Number(selectedPartnerId) : undefined,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        notes: "POS Sale"
      });
      
      setSuccessOpen(true);
      setCart([]);
      setSelectedPartnerId("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إتمام العملية" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="بحث عن منتج..." 
                className="pr-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="electronics">إلكترونيات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 rounded-xl p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products?.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/50 transition-all text-right group flex flex-col justify-between h-[140px]"
                >
                  <div>
                    <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">الكمية: {product.quantity}</p>
                  </div>
                  <div className="mt-4 font-bold text-emerald-600">
                    {Number(product.sellingPrice).toFixed(2)} ج.م
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-xl flex flex-col border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              سلة المبيعات
            </h2>
          </div>

          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="اختر العميل (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                {partners?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-emerald-600 font-bold">{item.price.toFixed(2)} ج.م</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary text-2xl">{total.toFixed(2)} ج.م</span>
            </div>
            <Button 
              className="w-full btn-primary h-12 text-lg" 
              onClick={handleCheckout}
              disabled={cart.length === 0 || createTransaction.isPending}
            >
              {createTransaction.isPending ? "جاري الدفع..." : "دفع وطباعة الفاتورة"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isSuccessOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تمت العملية بنجاح</h2>
            <p className="text-muted-foreground mb-6">تم تسجيل الفاتورة وتحديث المخزون</p>
            <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setSuccessOpen(false)}>إغلاق</Button>
              <Button className="flex-1 gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> طباعة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
