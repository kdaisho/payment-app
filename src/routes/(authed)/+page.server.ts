


import products from '$lib/server/data/products.json';
import ownedProducts from '$lib/server/data/owned_products.json';
import users from '$lib/server/data/users.json';
import { z } from 'zod'
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { stripe, userDataFilePath } from '$lib/server/utils';
import fs from 'fs';

export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    return {
        products,
        userId: locals.user.id,
        ownedProducts
    };
};

export const actions = {
    createCheckoutSession: async ({ locals, request }) => {
        if (!locals.user) return fail(401, { error: 'Not authenticated' });
        const user = users.find((u) => {
            if (!locals.user) return false
            return u.id === locals.user.id
        });

        if (!user) return fail(401, { error: 'Not authenticated' });

        const data = await request.formData();
        const productId = data.get('productId');

        const result = z.string().min(1).safeParse(productId);
        if (!result.success) return fail(404, { productId, error: 'Invalid product ID' });;

        const product = products.find((p) => p.id === productId);
        if (!product) return fail(404, { productId, error: 'Product not found' });

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;

            const updatedUsers = users.map((u) => {
                if (u.id === user.id) {
                    return { ...u, stripeCustomerId: customerId };
                }
                return u;
            });
            fs.writeFileSync(userDataFilePath, JSON.stringify(updatedUsers, null, 4), 'utf-8');
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer: customerId,
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
                    quantity: 1,
                }
            ],
            metadata: {
                productId: product.id,
                userId: user.id
            },
            success_url: 'http://localhost:5173/purchase/success?sessionId={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173'
        });

        if (!session.url) return { form: { error: 'Failed to create checkout session' } };

        return redirect(303, session.url);
    }
} satisfies Actions;