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

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Handle different types of events
      switch (event.type) {
        case 'checkout.session.completed':
          console.log(`Processing checkout.session.completed event`);
          const checkoutSession = event.data.object;
          
          if (!checkoutSession.metadata?.order_id) {
            console.error('No order ID found in session metadata');
            return new Response('No order ID found in session metadata', { 
              status: 400,
              headers: corsHeaders
            });
          }

          // Check if payment was already processed
          const { data: existingStatus } = await supabase
            .from('status_updates')
            .select('*')
            .eq('order_id', checkoutSession.metadata.order_id)
            .eq('payment_status', 'success')
            .single();

          if (existingStatus) {
            console.log('Payment already marked as successful for order:', checkoutSession.metadata.order_id);
            return new Response(JSON.stringify({ received: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          // Update payment status
          const { error: statusError } = await supabase
            .from('status_updates')
            .insert({
              order_id: checkoutSession.metadata.order_id,
              status: 'confirmed',
              payment_status: 'success',
              notes: `Payment confirmed via Stripe. Session ID: ${checkoutSession.id}`
            });

          if (statusError) {
            console.error('Error updating order status:', statusError);
            throw statusError;
          }

          // Update order status
          const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'confirmed' })
            .eq('id', checkoutSession.metadata.order_id);

          if (orderError) {
            console.error('Error updating order:', orderError);
            throw orderError;
          }

          console.log('Successfully processed checkout.session.completed for order:', checkoutSession.metadata.order_id);
          break;

        case 'payment_intent.succeeded':
          console.log('Processing payment_intent.succeeded event');
          const paymentIntent = event.data.object;
          
          if (paymentIntent.metadata?.order_id) {
            const { error: successError } = await supabase
              .from('status_updates')
              .insert({
                order_id: paymentIntent.metadata.order_id,
                status: 'payment_successful',
                payment_status: 'success',
                notes: `Payment successful. Payment Intent ID: ${paymentIntent.id}`
              });

            if (successError) {
              console.error('Error updating payment success status:', successError);
              throw successError;
            }
          }
          break;

        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          const failedPaymentIntent = event.data.object;
          
          if (failedPaymentIntent.metadata?.order_id) {
            const { error: failureError } = await supabase
              .from('status_updates')
              .insert({
                order_id: failedPaymentIntent.metadata.order_id,
                status: 'payment_failed',
                payment_status: 'failed',
                notes: `Payment failed. Reason: ${failedPaymentIntent.last_payment_error?.message || 'Unknown error'}`
              });

            if (failureError) {
              console.error('Error updating failed payment status:', failureError);
              throw failureError;
            }
          }
          break;

        case 'checkout.session.expired':
          console.log('Checkout session expired:', event.data.object);
          const expiredSession = event.data.object;
          
          if (expiredSession.metadata?.order_id) {
            const { error: expiryError } = await supabase
              .from('status_updates')
              .insert({
                order_id: expiredSession.metadata.order_id,
                status: 'expired',
                payment_status: 'failed',
                notes: 'Checkout session expired'
              });

            if (expiryError) {
              console.error('Error updating expired session status:', expiryError);
              throw expiryError;
            }
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
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