import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { fullFillPayment, stripe } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';

export const POST = async ({ request }) => {
    console.log('==> START', new Date().toISOString());

    const signature = request.headers.get('stripe-signature');
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
        return error(400, 'Missing signature or webhook secret');
    }

    const rawBody = await request.text();

    let event;
    try {
        // 1. Respond immediately
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Error verifying webhook signature:', err);
        return error(400, 'Webhook Error: ' + (err as Error).message);
    }

    // 2. Do your work asynchronously
    queueMicrotask(async () => {
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                case 'checkout.session.async_payment_succeeded': {
                    const success = await fullFillPayment(event.data.object.id);
                    if (!success) {
                        console.error('Failed to fulfill payment for', event.id);
                        // Stripe will already retry if fulfillment itself fails
                    }
                    break;
                }
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
        } catch (err) {
            console.error('Error handling event asynchronously:', err);
        }
    });

    // 2. Stripe only cares about a 2xx
    return new Response("ok", { status: 200 });
};
