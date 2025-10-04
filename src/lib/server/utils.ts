import type { UUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import allOwnedProducts from '$lib/server/data/owned_products.json';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const userSessionFilePath = path.resolve('src/lib/server/data/user_sessions.json');

export const userDataFilePath = path.resolve('src/lib/server/data/users.json');

const ownedProductFilePath = path.resolve('src/lib/server/data/owned_products.json');

export const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });

export function readSessions(filePath: string): Array<{ token: UUID; user_id: string, created_at: string; expired_at: string }> {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function addOwnProduct(productId: string, userId: string, quantity = 1) {
    allOwnedProducts[userId] ??= [];

    const ownedProducts = allOwnedProducts[userId]
    if (!Array.isArray(ownedProducts)) throw new Error('Owned products is not an array');

    const existingProduct = Array.isArray(ownedProducts) && ownedProducts.find((p) => p.id === productId);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        ownedProducts.push({ id: productId, quantity });
    }

    return fs.writeFileSync(path.resolve(ownedProductFilePath), JSON.stringify(allOwnedProducts, null, 4), 'utf-8');
}

export async function fullFillPayment(sessionId: string) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items']
    })

    if (checkoutSession.payment_status === 'unpaid') {
        return false
    }

    const productId = checkoutSession.metadata?.productId;
    const userId = checkoutSession.metadata?.userId;
    if (!productId || !userId) {
        return false;
    }

    const quantity = checkoutSession.line_items?.data[0].quantity;
    if (!quantity) {
        return false
    }

    addOwnProduct(productId, userId, quantity);

    return true

}
