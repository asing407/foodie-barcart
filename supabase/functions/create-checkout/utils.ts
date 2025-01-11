import { CartItem, Order, OrderItem } from './types.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.7.1';
import { Stripe } from 'npm:stripe@14.14.0';

export const createSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export const createStripeClient = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Stripe secret key not found');
  }
  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
};

export const validateCartItems = (cartItems: any[]): CartItem[] => {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Invalid cart items');
  }
  return cartItems;
};

export const createOrder = async (supabase: any, userId: string, totalAmount: number) => {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Order creation error:', error);
    throw new Error('Failed to create order');
  }

  return order;
};

export const createOrderItems = async (supabase: any, order: Order, cartItems: CartItem[]) => {
  const orderItems = cartItems.map((item: CartItem) => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_time: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Order items creation error:', itemsError);
    // Cleanup the order if items creation fails
    await supabase
      .from('orders')
      .delete()
      .match({ id: order.id });
    throw new Error('Failed to create order items');
  }

  return orderItems;
};

export const createStripeSession = async (
  stripe: Stripe,
  cartItems: CartItem[],
  order: Order,
  userId: string,
  origin: string,
  userEmail: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${origin}/success?order_id=${order.id}`,
      cancel_url: `${origin}/?canceled=true`,
      customer_email: userEmail,
      metadata: {
        order_id: order.id,
        user_id: userId
      },
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
            description: item.description || undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
    });

    if (!session.url) {
      throw new Error('No checkout URL received from Stripe');
    }

    return session;
  } catch (error) {
    console.error('Stripe session creation error:', error);
    throw error;
  }
};