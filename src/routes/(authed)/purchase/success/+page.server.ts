import { fullFillPayment } from '$lib/server/utils';
import { error, redirect } from '@sveltejs/kit';
import z from 'zod';

export const load = async ({ url }) => {
    const query = url.searchParams;
    const sessionId = query.get('sessionId');

    const result = z.string().min(1).safeParse(sessionId)
    if (!result.success) {
        throw error(400, 'Invalid session ID');
    }

    const success = await fullFillPayment(result.data);
    if (!success) throw error(400, 'Failed to fulfill payment');

    return redirect(303, '/');
};

