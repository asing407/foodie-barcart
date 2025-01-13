import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'npm:stripe@14.14.0'
import { createClient } from 'npm:@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      console.log('Received OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method === "POST") {
      console.log('Received webhook request');
      
      const signature = req.headers.get("stripe-signature")
      if (!signature || !webhookSecret) {
        console.error('Missing webhook secret or signature');
        return new Response('Webhook secret or signature missing', { 
          status: 400,
          headers: corsHeaders
        })
      }

      const body = await req.text()
      console.log('Webhook body received, length:', body.length);
      
      let event
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('Successfully constructed event:', event.type);
      } catch (err) {
        console.error(`Webhook signature verification failed:`, err);
        return new Response(`Webhook signature verification failed: ${err.message}`, { 
          status: 400,
          headers: corsHeaders
        })
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Processing completed checkout session:', session.id);
        console.log('Order ID from metadata:', session.metadata?.order_id);

        if (!session.metadata?.order_id) {
          console.error('No order ID found in session metadata');
          return new Response('No order ID found in session metadata', { 
            status: 400,
            headers: corsHeaders
          });
        }

        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // First check if we already processed this payment
        const { data: existingStatus } = await supabase
          .from('status_updates')
          .select('*')
          .eq('order_id', session.metadata.order_id)
          .eq('payment_status', 'success')
          .single();

        if (existingStatus) {
          console.log('Payment already marked as successful for order:', session.metadata.order_id);
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log('Updating payment status for order:', session.metadata.order_id);

        // Insert new status update with success payment status
        const { error: statusError } = await supabase
          .from('status_updates')
          .insert({
            order_id: session.metadata.order_id,
            status: 'confirmed',
            payment_status: 'success',
            notes: `Payment confirmed via Stripe. Session ID: ${session.id}`
          });

        if (statusError) {
          console.error('Error updating order status:', statusError);
          throw statusError;
        }

        console.log('Successfully updated payment status for order:', session.metadata.order_id);

        // Update the order status itself
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', session.metadata.order_id);

        if (orderError) {
          console.error('Error updating order:', orderError);
          throw orderError;
        }

        console.log('Successfully processed payment for order:', session.metadata.order_id);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});