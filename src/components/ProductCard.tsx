import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image_url: string | null;
    price_per_litre: number;
    offer_price_per_litre: number | null;
    stock_quantity: number;
  };
  onUpdate?: () => void;
}

export default function ProductCard({ product, onUpdate }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const effectivePrice = product.offer_price_per_litre || product.price_per_litre;
  const hasDiscount = product.offer_price_per_litre && product.offer_price_per_litre < product.price_per_litre;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price_per_litre - product.offer_price_per_litre!) / product.price_per_litre) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    setIsAddingToCart(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity_litres: 1,
        }, {
          onConflict: 'user_id,product_id',
        });

      if (error) throw error;
      toast.success('Added to cart');
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/auth');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: product.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Already in wishlist');
        } else {
          throw error;
        }
      } else {
        toast.success('Added to wishlist');
        onUpdate?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)]"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 z-10 bg-destructive">
            {discountPercentage}% OFF
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur hover:bg-background"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
        >
          <Heart className="h-4 w-4" />
        </Button>
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            ₹{effectivePrice.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">/litre</span>
        </div>
        {hasDiscount && (
          <span className="text-sm text-muted-foreground line-through">
            ₹{product.price_per_litre.toFixed(2)}
          </span>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {product.stock_quantity > 0 ? `${product.stock_quantity} L in stock` : 'Out of stock'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_quantity === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}