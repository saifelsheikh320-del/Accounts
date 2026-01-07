import { useState } from "react";
import { Layout } from "@/components/layout";
import { useProducts } from "@/hooks/use-products";
import { usePartners } from "@/hooks/use-partners";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, Trash2, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function POS() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: products, isLoading: loadingProducts } = useProducts(search, selectedCategory);
  const { data: customers } = usePartners("customer");
  
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCart();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  
  const createTransaction = useCreateTransaction();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      await createTransaction.mutateAsync({
        type: "sale",
        userId: 1, // Hardcoded for MVP, would come from auth context
        partnerId: selectedPartnerId ? Number(selectedPartnerId) : undefined,
        totalAmount: total, // Backend calculates this but frontend sends for validation if needed, schema requires it not though? Actually schema derives total in logic usually but let's check schema. Schema has totalAmount in transactions table.
        // Wait, schema for createTransactionRequestSchema does NOT have totalAmount. It calculates it from items? 
        // Let's re-read schema.
        // createTransactionRequestSchema has: type, partnerId, userId, items, notes.
        // Good. Backend will calc total.
        items: items.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          price: Number(item.sellingPrice)
        })),
        notes: "POS Sale"
      });
      clearCart();
    } catch (e) {
      // Toast handled in hook
    }
  };

  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean) as string[]));

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden pt-0 lg:pt-0"> {/* Adjust padding if header exists */}
        
        {/* Left Side: Product Grid */}
        <div className="flex-1 flex flex-col h-full bg-muted/30 border-r p-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-white dark:bg-card border-none shadow-sm h-12 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl bg-white dark:bg-card border-none shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1 -mx-2 px-2">
            {loadingProducts ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {products?.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="group bg-white dark:bg-card p-4 rounded-xl border border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center text-4xl font-display font-bold text-muted-foreground/20">
                      {product.name.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-mono font-bold text-primary">${Number(product.sellingPrice).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{product.quantity} in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Side: Cart */}
        <div className="w-[400px] flex flex-col h-full bg-background shadow-2xl z-10">
          <div className="p-6 border-b space-y-4">
            <h2 className="text-2xl font-bold font-display">Current Order</h2>
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger className="w-full h-11 rounded-lg">
                <SelectValue placeholder="Select Customer (Optional)" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Cart is empty</p>
                </div>
              ) : items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-card flex items-center justify-center font-bold text-primary">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">${Number(item.sellingPrice).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-background rounded-lg border p-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.cartQuantity - 1); }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-foreground"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.cartQuantity}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addItem(item); }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/10 border-t space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              size="lg"
              disabled={items.length === 0 || createTransaction.isPending}
              onClick={handleCheckout}
            >
              {createTransaction.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay & Print
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
