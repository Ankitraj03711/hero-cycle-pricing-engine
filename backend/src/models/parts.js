import { getDb } from '../db.js';

export const CATEGORIES = ['frame', 'gearSet', 'tyres', 'brakes', 'handlebars', 'seat', 'chain', 'wheels'];

export function getAllParts(category = null) {
  const db = getDb();
  if (category) {
    return db.prepare('SELECT * FROM parts WHERE category = ? ORDER BY category, name').all(category);
  }
  return db.prepare('SELECT * FROM parts ORDER BY category, name').all();
}

export function getPartById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM parts WHERE id = ?').get(id);
}

export function createPart({ name, category, price }) {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO parts (name, category, price) VALUES (?, ?, ?)'
  ).run(name, category, price);
  return getPartById(result.lastInsertRowid);
}

export function updatePart(id, { name, category, price }) {
  const db = getDb();
  const existing = getPartById(id);
  if (!existing) return null;

  // Record price change in history if price changed
  if (price !== undefined && price !== existing.price) {
    db.prepare(
      'INSERT INTO price_history (part_id, old_price, new_price) VALUES (?, ?, ?)'
    ).run(id, existing.price, price);
  }

  const updatedName = name ?? existing.name;
  const updatedCategory = category ?? existing.category;
  const updatedPrice = price ?? existing.price;

  db.prepare(
    "UPDATE parts SET name = ?, category = ?, price = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(updatedName, updatedCategory, updatedPrice, id);

  return getPartById(id);
}

export function deletePart(id) {
  const db = getDb();
  // Check if part is used in any configuration
  const usage = db.prepare(
    'SELECT COUNT(*) as count FROM configuration_parts WHERE part_id = ?'
  ).get(id);

  if (usage.count > 0) {
    return { error: 'Part is used in existing configurations and cannot be deleted' };
  }

  const result = db.prepare('DELETE FROM parts WHERE id = ?').run(id);
  return { deleted: result.changes > 0 };
}

export function getPriceHistory(partId) {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM price_history WHERE part_id = ? ORDER BY changed_at DESC'
  ).all(partId);
}
