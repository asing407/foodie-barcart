import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { cartItems } = await req.json();
    console.log('Received cart items:', cartItems);
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Invalid cart items');
    }

    // Get the user from the authorization header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    console.log('Creating order with total amount:', totalAmount);

    // Create a new order in the database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order);

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Cleanup the order if items creation fails
      await supabaseClient
        .from('orders')
        .delete()
        .match({ id: order.id });
      throw new Error('Failed to create order items');
    }

    console.log('Order items created successfully');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?order_id=${order.id}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      customer_email: user.email,
      metadata: {
        order_id: order.id
      },
      line_items: cartItems.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
    });

    console.log('Stripe session created successfully');

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    );
  }
});