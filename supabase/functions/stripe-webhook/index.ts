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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      const signature = req.headers.get("stripe-signature")
      if (!signature || !webhookSecret) {
        console.error('Missing webhook secret or signature')
        return new Response('Webhook secret or signature missing', { 
          status: 400,
          headers: corsHeaders
        })
      }

      const body = await req.text()
      let event
      
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response(`Webhook signature verification failed: ${err.message}`, { 
          status: 400,
          headers: corsHeaders
        })
      }

      console.log('Received Stripe webhook event:', event.type)

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const orderId = session.metadata?.order_id

        if (!orderId) {
          console.error('No order ID found in session metadata')
          return new Response('No order ID found in session metadata', { 
            status: 400,
            headers: corsHeaders
          })
        }

        console.log('Processing successful payment for order:', orderId)

        // Update order status
        const { error: statusError } = await supabase
          .from('status_updates')
          .insert({
            order_id: orderId,
            status: 'confirmed',
            payment_status: 'success',
            notes: 'Payment confirmed via Stripe'
          })

        if (statusError) {
          console.error('Error updating order status:', statusError)
          return new Response('Error updating order status', { 
            status: 500,
            headers: corsHeaders
          })
        }

        console.log(`Successfully processed payment for order: ${orderId}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      })
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response('Webhook processing failed', { 
      status: 400,
      headers: corsHeaders
    })
  }
})