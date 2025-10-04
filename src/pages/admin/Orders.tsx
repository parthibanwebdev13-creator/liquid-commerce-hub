import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*, order_items(*), profiles(email, full_name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
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
        <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Order #{order.order_number}</span>
                  <Badge>{order.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Customer: {order.profiles?.email}</p>
                <p>Total: ₹{order.final_amount}</p>
                <p>Items: {order.order_items?.length}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}