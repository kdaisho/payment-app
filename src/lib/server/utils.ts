import type { UUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export const userSessionFilePath = path.resolve('src/lib/server/data/user_sessions.json');

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

// export function addSession(token: UUID, userId: string, filePath: string) {
//     const now = new Date();
//     const expires = new Date(now.getTime() + 8 * 60 * 60 * 1000); // +8h

//     const newSession = {
//         token,
//         user_id: userId,
//         created_at: now.toISOString(),
//         expired_at: expires.toISOString()
//     };

//     const sessions = readSessions(filePath);
//     sessions.push(newSession);
//     writeSessions(sessions);

//     return newSession;
// }