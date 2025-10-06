import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ChevronRight, Upload } from 'lucide-react';

export default function AdminProducts() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    short_description: '',
    description: '',
    tags: '',
    base_price: '',
    price_per_litre: '',
    quantity_litres: '5',
    offer_price_per_litre: '',
    stock_quantity: '',
    low_stock_alert: '10',
    image_url: '',
    is_active: true,
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url || null,
        price_per_litre: parseFloat(formData.price_per_litre),
        offer_price_per_litre: formData.offer_price_per_litre ? parseFloat(formData.offer_price_per_litre) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        is_active: formData.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      setShowAddForm(false);
      setFormData({ 
        name: '', sku: '', category: '', short_description: '', description: '', tags: '',
        base_price: '', price_per_litre: '', quantity_litres: '5', offer_price_per_litre: '',
        stock_quantity: '', low_stock_alert: '10', image_url: '', is_active: true 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const calculateTotalPrice = () => {
    const pricePerLitre = parseFloat(formData.price_per_litre) || 0;
    const quantity = parseFloat(formData.quantity_litres) || 0;
    return (pricePerLitre * quantity).toFixed(2);
  };

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-foreground">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setShowAddForm(false)} className="hover:text-foreground">Products</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Add New Product</span>
          </div>

          <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Product Identification */}
            <Card>
              <CardHeader>
                <CardTitle>Product Identification & Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Name <span className="text-destructive">*</span></Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" />
                </div>
                <div>
                  <Label>SKU/Product Code</Label>
                  <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Enter SKU" />
                </div>
                <div>
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Enter category" />
                </div>
                <div>
                  <Label>Short Description</Label>
                  <Input value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief description" />
                </div>
                <div>
                  <Label>Full Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed product description" rows={4} />
                </div>
                <div>
                  <Label>Tags/Keywords</Label>
                  <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Comma separated tags" />
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory (Liters Focused)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Price (₹)</Label>
                  <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} placeholder="650.00" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity (Liters)</Label>
                    <Input type="number" value={formData.quantity_litres} onChange={(e) => setFormData({ ...formData, quantity_litres: e.target.value })} placeholder="5" />
                  </div>
                  <div>
                    <Label>Price per Liter (₹) <span className="text-destructive">*</span></Label>
                    <Input type="number" value={formData.price_per_litre} onChange={(e) => setFormData({ ...formData, price_per_litre: e.target.value })} placeholder="3250.00" />
                  </div>
                </div>
                <div>
                  <Label>Total Price (Calculated)</Label>
                  <Input value={`₹${calculateTotalPrice()}`} disabled className="bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity in Stock <span className="text-destructive">*</span></Label>
                    <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} placeholder="150" />
                  </div>
                  <div>
                    <Label>Low Stock Alert at</Label>
                    <Input type="number" value={formData.low_stock_alert} onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })} placeholder="10" />
                  </div>
                </div>
                <div>
                  <Label>Offer Price per Liter (₹)</Label>
                  <Input type="number" value={formData.offer_price_per_litre} onChange={(e) => setFormData({ ...formData, offer_price_per_litre: e.target.value })} placeholder="Optional discount price" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Media & Visibility */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Media & Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Product Image(s)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Drag & Drop Uploader</p>
                    <Input type="text" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="Or paste image URL" className="mt-2" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Visible on Website</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => createProductMutation.mutate()} size="lg" className="bg-green-600 hover:bg-green-700">
              Save Product
            </Button>
            <Button variant="secondary" size="lg">Save Draft</Button>
            <Button variant="destructive" size="lg" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
        </div>

        <div className="grid gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">₹{product.price_per_litre}/L | Stock: {product.stock_quantity}L</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}