import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Shield, Truck, Award, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured_in_offers', true)
        .eq('is_active', true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentReviews } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to OilMart
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Your trusted source for premium quality cooking oils. Pure, healthy, and authentic.
            </p>
            <Link to="/products">
              <Button size="lg" className="text-lg px-8 py-6">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Pure</h3>
              <p className="text-muted-foreground">Authentic and unadulterated oils</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Finest selection for your kitchen</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick and safe doorstep delivery</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Competitive pricing with offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Special Offers</h2>
            <p className="text-muted-foreground text-center mb-8">Limited time deals on premium products</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">About OilMart</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                Welcome to OilMart, your trusted destination for premium quality cooking oils. We believe that great cooking starts with great ingredients, and that's why we source only the finest, purest oils for your kitchen.
              </p>
              <p>
                Our commitment to quality means every bottle we sell is 100% authentic, unadulterated, and carefully tested to meet the highest standards. Whether you're looking for traditional oils or exploring new flavors, we have something special for every culinary need.
              </p>
              <p>
                With fast delivery, competitive pricing, and exceptional customer service, OilMart makes it easy to stock your kitchen with the best. Join thousands of satisfied customers who trust us for their cooking oil needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {recentReviews && recentReviews.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">What Our Customers Say</h2>
            <p className="text-muted-foreground text-center mb-8">Real experiences from real customers</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {recentReviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-4">{review.comment}</p>
                    <p className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Experience Quality?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our collection of premium cooking oils and start your journey to healthier cooking.
          </p>
          <Link to="/products">
            <Button size="lg" variant="default" className="text-lg px-8 py-6">
              Explore Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
