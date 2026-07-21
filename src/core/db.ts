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

export async function createOrder(db: D1Database, user_id: number, days: number, gb: number, price: number) {
  const res = await db.prepare(
    "INSERT INTO orders (user_id, days, gb, price, status) VALUES (?, ?, ?, ?, ?) RETURNING id"
  ).bind(user_id, days, gb, price, "PENDING_PAYMENT").first();
  return res?.id as number;
}

export async function updateOrderStatus(db: D1Database, orderId: number, status: string) {
  await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, orderId).run();
}

export async function getAdminIds(db: D1Database): Promise<number[]> {
  const { results } = await db.prepare("SELECT telegram_id FROM users WHERE is_admin = 1").all();
  return results.map((r: any) => r.telegram_id as number);
}
