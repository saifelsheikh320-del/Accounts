import { useState } from "react";
import { Layout } from "@/components/layout";
import { usePartners, useCreatePartner, useDeletePartner } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, User, Phone, Mail, MapPin, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartnerSchema, type InsertPartner } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function PartnerForm({ type, onClose }: { type: 'customer' | 'supplier', onClose: () => void }) {
  const createMutation = useCreatePartner();

  const form = useForm<InsertPartner>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      name: "",
      type: type,
      email: "",
      phone: "",
      address: "",
    }
  });

  const onSubmit = async (data: InsertPartner) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Partner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Partners() {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [search, setSearch] = useState("");
  const { data: partners, isLoading } = usePartners(activeTab, search);
  const deleteMutation = useDeletePartner();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Partners</h1>
            <p className="text-muted-foreground">Manage your customers and suppliers.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)} className="shadow-lg shadow-primary/25 rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Add {activeTab === 'customer' ? 'Customer' : 'Supplier'}
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {activeTab === 'customer' ? 'Customer' : 'Supplier'}</DialogTitle>
              </DialogHeader>
              <PartnerForm type={activeTab} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted p-1 rounded-xl">
              <TabsTrigger value="customer" className="rounded-lg px-6">Customers</TabsTrigger>
              <TabsTrigger value="supplier" className="rounded-lg px-6">Suppliers</TabsTrigger>
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={`Search ${activeTab}s...`} 
                className="pl-9 rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="customer" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div>Loading...</div>
              ) : partners?.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                  No customers found.
                </div>
              ) : (
                partners?.map(p => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                          {p.name.charAt(0)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(p.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {p.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {p.email}</div>}
                        {p.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {p.phone}</div>}
                        {p.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {p.address}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="supplier" className="m-0">
             {/* Same grid logic for suppliers, reusing same data source as it filters by type */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div>Loading...</div>
              ) : partners?.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                  No suppliers found.
                </div>
              ) : (
                partners?.map(p => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                          {p.name.charAt(0)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate(p.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {p.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {p.email}</div>}
                        {p.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {p.phone}</div>}
                        {p.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {p.address}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
