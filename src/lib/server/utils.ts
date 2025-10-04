import type { UUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export const userSessionFilePath = path.resolve('src/lib/server/data/user_sessions.json');

export const userDataFilePath = path.resolve('src/lib/server/data/users.json');

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
