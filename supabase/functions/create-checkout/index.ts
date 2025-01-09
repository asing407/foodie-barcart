import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createSupabaseClient,
  createStripeClient,
  validateCartItems,
  createOrder,
  createOrderItems,
  createStripeSession
} from "./utils.ts";

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
    // Initialize clients
    const supabase = createSupabaseClient();
    const stripe = createStripeClient();

    // Parse and validate request
    const { cartItems } = await req.json();
    const validatedItems = validateCartItems(cartItems);
    console.log('Received cart items:', validatedItems);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Creating order for user:', user.id);

    // Calculate total amount
    const totalAmount = validatedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    // Create order
    const order = await createOrder(supabase, user.id, totalAmount);
    console.log('Order created:', order);

    // Create order items
    await createOrderItems(supabase, order, validatedItems);
    console.log('Order items created successfully');

    // Get origin for redirect URLs
    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Origin header is required');
    }

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...');
    const session = await createStripeSession(
      stripe,
      validatedItems,
      order,
      user.id,
      origin,
      user.email!
    );

    console.log('Stripe session created successfully:', session.id);
    console.log('Checkout URL:', session.url);

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
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : 'Unknown error'
      }),
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