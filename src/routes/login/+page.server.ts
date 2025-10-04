import bcrypt from 'bcrypt';
import { z } from 'zod'
import users from '$lib/server/data/users.json';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { readSessions, userSessionFilePath } from '$lib/server/utils';

export const load = ({ locals }) => {
    if (locals.user) redirect(303, '/');
};

export const actions = {
    login: async ({ request, locals, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');
        const emailResult = z.email().safeParse(email);
        const passwordResult = z.string().min(1).safeParse(password);

        const user = users.find((u) => u.email === email);
        if (!emailResult.success || !passwordResult.success || !user) {
            return fail(400, { error: 'Invalid email or password' });
        }

        if (typeof password !== 'string') return fail(400, { error: 'Invalid password' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return fail(400, { error: 'Invalid password' });
        }

        const sessions = readSessions(userSessionFilePath);
        const newSession = {
            token: randomUUID(),
            user_id: user.id,
            created_at: new Date().toISOString(),
            expired_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // expires in 8 hours
        }
        sessions.push(newSession);

        fs.writeFileSync(userSessionFilePath, JSON.stringify(sessions, null, 4), 'utf-8');

        cookies.set('session', newSession.token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 8 * 60 * 60 // 8 hours
        })

        locals.user = { id: user.id, email: user.email };

        redirect(303, '/');
    }
};