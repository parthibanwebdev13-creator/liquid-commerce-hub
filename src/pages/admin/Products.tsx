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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChevronRight, Upload, ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_litre: '',
    offer_price_per_litre: '',
    stock_quantity: '',
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

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const createProductMutation = useMutation({
    mutationFn: async () => {
      if (!formData.name || !formData.price_per_litre || !formData.stock_quantity) {
        throw new Error('Please fill in all required fields');
      }

      if (editingProduct) {
        const { error } = await supabase.from('products').update({
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
          price_per_litre: parseFloat(formData.price_per_litre),
          offer_price_per_litre: formData.offer_price_per_litre ? parseFloat(formData.offer_price_per_litre) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          is_active: formData.is_active,
        }).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
          price_per_litre: parseFloat(formData.price_per_litre),
          offer_price_per_litre: formData.offer_price_per_litre ? parseFloat(formData.offer_price_per_litre) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          is_active: formData.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({ 
        name: '',
        description: '',
        price_per_litre: '',
        offer_price_per_litre: '',
        stock_quantity: '',
        image_url: '',
        is_active: true 
      });
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price_per_litre: product.price_per_litre.toString(),
      offer_price_per_litre: product.offer_price_per_litre?.toString() || '',
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
      is_active: product.is_active,
    });
    setShowAddForm(true);
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
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowAddForm(false);
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price_per_litre: '',
                offer_price_per_litre: '',
                stock_quantity: '',
                image_url: '',
                is_active: true,
              });
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          <h1 className="text-3xl font-bold mb-8">{editingProduct ? 'Edit Product' : 'Add New Product'}</h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Name <span className="text-destructive">*</span></Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Enter product name" 
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Detailed product description" 
                    rows={6} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Price per Liter (₹) <span className="text-destructive">*</span></Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={formData.price_per_litre} 
                    onChange={(e) => setFormData({ ...formData, price_per_litre: e.target.value })} 
                    placeholder="130.00" 
                    required
                  />
                </div>
                <div>
                  <Label>Offer Price per Liter (₹)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={formData.offer_price_per_litre} 
                    onChange={(e) => setFormData({ ...formData, offer_price_per_litre: e.target.value })} 
                    placeholder="Optional discount price" 
                  />
                </div>
                <div>
                  <Label>Stock Quantity (Liters) <span className="text-destructive">*</span></Label>
                  <Input 
                    type="number" 
                    value={formData.stock_quantity} 
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} 
                    placeholder="150" 
                    required
                  />
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
                  <Label>Product Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload Product Image</p>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          handleImageUpload(file);
                        }
                      }}
                      className="mt-2"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                    {formData.image_url && (
                      <div className="mt-4">
                        <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Visible on Website</Label>
                    <Switch 
                      checked={formData.is_active} 
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => createProductMutation.mutate()} 
              size="lg" 
              disabled={createProductMutation.isPending || uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {createProductMutation.isPending ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
            </Button>
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={() => setShowAddForm(false)}
              disabled={createProductMutation.isPending || uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
        </div>

        <div className="grid gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{product.price_per_litre}/L | Stock: {product.stock_quantity}L</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}