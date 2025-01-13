import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { generateReceiptHtml } from './template.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price_at_time,
          menu_item:menu_items (
            name,
            description
          )
        ),
        status_updates (
          status,
          payment_status,
          created_at,
          notes
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const receiptHtml = generateReceiptHtml({
      orderId: order.id,
      orderCreatedAt: new Date(order.created_at),
      orderItems: order.order_items,
      statusUpdates: order.status_updates,
      subtotal: order.total_amount
    });

    const receiptFileName = `receipt-${orderId}.html`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(receiptFileName, receiptHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload receipt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { error: receiptError } = await supabase
      .from('receipts')
      .insert({
        order_id: orderId,
        file_path: receiptFileName
      })

    if (receiptError) {
      console.error('Error saving receipt record:', receiptError);
      return new Response(
        JSON.stringify({ error: 'Failed to save receipt record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Receipt generated successfully',
        receiptPath: receiptFileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})