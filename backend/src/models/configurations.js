import { getDb } from '../db.js';
import { CATEGORIES, getPartById } from './parts.js';

export function getAllConfigurations() {
  const db = getDb();
  const configs = db.prepare('SELECT * FROM configurations ORDER BY updated_at DESC').all();

  // Attach total price to each configuration
  return configs.map(config => {
    const total = db.prepare(`
      SELECT COALESCE(SUM(p.price), 0) as total
      FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ?
    `).get(config.id);
    return { ...config, totalPrice: total.total };
  });
}

export function getConfigurationById(id) {
  const db = getDb();
  const config = db.prepare('SELECT * FROM configurations WHERE id = ?').get(id);
  if (!config) return null;

  const parts = db.prepare(`
    SELECT p.id, p.name, p.category, p.price
    FROM configuration_parts cp
    JOIN parts p ON cp.part_id = p.id
    WHERE cp.configuration_id = ?
    ORDER BY p.category
  `).all(id);

  const totalPrice = parts.reduce((sum, part) => sum + part.price, 0);

  return {
    ...config,
    parts,
    totalPrice
  };
}

export function createConfiguration({ name, partIds }) {
  const db = getDb();

  // Validate all parts exist and cover all categories
  const categories = new Set();
  const parts = [];

  for (const partId of partIds) {
    const part = getPartById(partId);
    if (!part) {
      return { error: `Part with id ${partId} not found` };
    }
    if (categories.has(part.category)) {
      return { error: `Duplicate category: ${part.category}. Only one part per category allowed.` };
    }
    categories.add(part.category);
    parts.push(part);
  }

  // Check all categories are covered
  for (const cat of CATEGORIES) {
    if (!categories.has(cat)) {
      return { error: `Missing category: ${cat}. All categories must be selected.` };
    }
  }

  // Create configuration in a transaction
  const insertConfig = db.prepare('INSERT INTO configurations (name) VALUES (?)');
  const insertPart = db.prepare('INSERT INTO configuration_parts (configuration_id, part_id) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    const result = insertConfig.run(name);
    const configId = result.lastInsertRowid;
    for (const partId of partIds) {
      insertPart.run(configId, partId);
    }
    return configId;
  });

  const configId = transaction();
  return getConfigurationById(configId);
}

export function updateConfiguration(id, { name, partIds }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM configurations WHERE id = ?').get(id);
  if (!existing) return null;

  if (partIds) {
    // Validate parts
    const categories = new Set();
    for (const partId of partIds) {
      const part = getPartById(partId);
      if (!part) {
        return { error: `Part with id ${partId} not found` };
      }
      if (categories.has(part.category)) {
        return { error: `Duplicate category: ${part.category}` };
      }
      categories.add(part.category);
    }
    for (const cat of CATEGORIES) {
      if (!categories.has(cat)) {
        return { error: `Missing category: ${cat}` };
      }
    }
  }

  const transaction = db.transaction(() => {
    if (name) {
      db.prepare("UPDATE configurations SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name, id);
    }
    if (partIds) {
      db.prepare('DELETE FROM configuration_parts WHERE configuration_id = ?').run(id);
      const insertPart = db.prepare('INSERT INTO configuration_parts (configuration_id, part_id) VALUES (?, ?)');
      for (const partId of partIds) {
        insertPart.run(id, partId);
      }
      db.prepare("UPDATE configurations SET updated_at = datetime('now') WHERE id = ?").run(id);
    }
  });

  transaction();
  return getConfigurationById(id);
}

export function deleteConfiguration(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM configurations WHERE id = ?').run(id);
  return { deleted: result.changes > 0 };
}
