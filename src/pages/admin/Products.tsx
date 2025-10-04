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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price_per_litre: '',
    offer_price_per_litre: '',
    stock_quantity: '',
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
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product created');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', image_url: '', price_per_litre: '', offer_price_per_litre: '', stock_quantity: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <Button onClick={() => setIsDialogOpen(true)}>Add Product</Button>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              </div>
              <div>
                <Label>Price per Litre (₹)</Label>
                <Input type="number" value={formData.price_per_litre} onChange={(e) => setFormData({ ...formData, price_per_litre: e.target.value })} />
              </div>
              <div>
                <Label>Offer Price (₹)</Label>
                <Input type="number" value={formData.offer_price_per_litre} onChange={(e) => setFormData({ ...formData, offer_price_per_litre: e.target.value })} />
              </div>
              <div>
                <Label>Stock (Litres)</Label>
                <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} />
              </div>
              <Button onClick={() => createProductMutation.mutate()} className="w-full">Create Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}