import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhookToken } from '@/lib/tinkoff';
import { sendBookingNotifications } from '@/lib/booking-notifications';

export async function POST(req: Request) {
  try {
    const params = await req.json();

    if (!verifyWebhookToken(params)) {
      console.error('Tinkoff webhook: invalid token', params);
      return new NextResponse('FORBIDDEN', { status: 403 });
    }

    const appointmentId = params['OrderId'] as string;
    const tinkoffPaymentId = String(params['PaymentId']);
    const status = params['Status'] as string;

    if (status === 'CONFIRMED') {
      const { data: updated } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'active', payment_status: 'paid', payment_id: tinkoffPaymentId })
        .eq('id', appointmentId)
        .eq('status', 'pending_payment')
        .select('id')
        .maybeSingle();

      if (updated) {
        await sendBookingNotifications(appointmentId);
      }
    } else if (['REJECTED', 'CANCELLED', 'DEADLINE_EXPIRED'].includes(status)) {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled_by_client', payment_status: 'failed', payment_id: tinkoffPaymentId })
        .eq('id', appointmentId)
        .eq('status', 'pending_payment');
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Tinkoff webhook error:', err);
    return new NextResponse('ERROR', { status: 500 });
  }
}
