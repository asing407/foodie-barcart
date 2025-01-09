import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price_at_time,
          menu_item:menu_items (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details', details: orderError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .items { margin: 20px 0; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Receipt</h1>
            <p>Order #${order.id}</p>
            <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div class="items">
            ${order.order_items.map(item => `
              <div>
                ${item.quantity}x ${item.menu_item.name} - $${(item.price_at_time * item.quantity).toFixed(2)}
              </div>
            `).join('')}
          </div>
          <div class="total">
            Total: $${order.total_amount.toFixed(2)}
          </div>
        </body>
      </html>
    `

    // Convert HTML to PDF (simplified version - just storing HTML for now)
    const receiptFileName = `receipt-${orderId}.html`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(receiptFileName, receiptHtml, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload receipt', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Save receipt record
    const { error: receiptError } = await supabase
      .from('receipts')
      .insert({
        order_id: orderId,
        file_path: receiptFileName
      })

    if (receiptError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save receipt record', details: receiptError }),
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
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})