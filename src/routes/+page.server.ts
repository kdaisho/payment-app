


import products from '$lib/server/data/products.json';
import ownedProducts from '$lib/server/data/owned_products.json';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { z } from 'zod'
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load = async () => {
    return {
        products,
        ownedProducts
    };
};

export const actions = {
    createCheckoutSession: async ({ request }) => {
        // TODO: validate user is logged in
        const data = await request.formData();
        const productId = data.get('productId');

        const result = z.string().min(1).safeParse(productId);
        if (!result.success) return fail(404, { productId, error: 'Invalid product ID' });;

        const product = products.find((p) => p.id === productId);
        if (!product) return fail(404, { productId, error: 'Product not found' });

        const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'cad',
                        unit_amount: product.price * 100, // in cents
                        product_data: {
                            name: product.name,
                            description: product.description
                        }
                    },
                    quantity: 1
                }
            ],
            success_url: 'http://localhost:5173/purchase/success',
            cancel_url: 'http://localhost:5173'
        });

        if (!session.url) return { form: { error: 'Failed to create checkout session' } };

        // return { form: { url: session.url } };
        return redirect(303, session.url);
    }
} satisfies Actions;