import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { fullFillPayment, stripe } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';

export const POST = async ({ request }) => {
    const signature = request.headers.get('stripe-signature')
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
        return error(400, 'Missing signature or webhook secret');
    }

    const rawBody = await request.text()

    try {
        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            STRIPE_WEBHOOK_SECRET
        );

        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded': {
                const success = await fullFillPayment(event.data.object.id);
                if (!success) return error(400, 'Failed to fulfill payment');
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        console.error('Error verifying webhook signature:', err);
        throw error(400, 'Webhook Error: ' + (err as Error).message);
    }
};