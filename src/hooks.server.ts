import { type Handle } from '@sveltejs/kit';
import { readSessions, userSessionFilePath } from '$lib/server/utils';
import users from '$lib/server/data/users.json';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');

    const sessions = readSessions(userSessionFilePath);
    const validSession = sessions.find((s) => s.token === session && new Date(s.expired_at) > new Date());
    if (!validSession) {
        event.locals.user = undefined
        return await resolve(event);
    };

    const validUser = users.find((u) => u.id === validSession.user_id);
    if (!validUser) {
        event.locals.user = undefined
        return await resolve(event);
    }

    event.locals.user = {
        id: validUser.id, email: validUser.email
    };

    return await resolve(event);
};