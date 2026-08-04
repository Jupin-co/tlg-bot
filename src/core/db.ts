export interface UserProfile {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
  start_param?: string;
}

export async function saveUser(db: D1Database, profile: UserProfile) {
  const { telegram_id, username, first_name, last_name, language_code, is_premium, start_param } = profile;
  
  await db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium, start_param) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(telegram_id) DO UPDATE SET 
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      language_code = excluded.language_code,
      is_premium = excluded.is_premium
  `).bind(
    telegram_id, 
    username || null, 
    first_name || null, 
    last_name || null, 
    language_code || null, 
    is_premium ? 1 : 0, 
    start_param || null
  ).run();
}

export async function updateUserPhone(db: D1Database, telegram_id: number, phone_number: string) {
  await db.prepare(`UPDATE users SET phone_number = ? WHERE telegram_id = ?`).bind(phone_number, telegram_id).run();
}

export async function logUsage(db: D1Database, user_id: number, action: string, metadata: any = {}) {
  await db.prepare(`INSERT INTO user_usage_logs (user_id, action, metadata) VALUES (?, ?, ?)`).bind(user_id, action, JSON.stringify(metadata)).run();
}

export async function getAdminIds(db: D1Database): Promise<number[]> {
  const { results } = await db.prepare("SELECT telegram_id FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN')").all();
  return results.map((r: any) => r.telegram_id as number);
}
