import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = path.join(__dirname, 'test.db');

// We'll test the logic directly using a test database
let db;

beforeAll(() => {
  // Remove old test db if exists
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

  db = new Database(TEST_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('frame', 'gearSet', 'tyres', 'brakes', 'handlebars', 'seat', 'chain', 'wheels')),
      price REAL NOT NULL CHECK(price > 0),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE configuration_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      configuration_id INTEGER NOT NULL,
      part_id INTEGER NOT NULL,
      FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE,
      FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
    );

    CREATE TABLE price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      part_id INTEGER NOT NULL,
      old_price REAL NOT NULL,
      new_price REAL NOT NULL,
      changed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
    );
  `);

  // Seed test data
  const insertPart = db.prepare('INSERT INTO parts (name, category, price) VALUES (?, ?, ?)');
  insertPart.run('Steel Frame', 'frame', 1200);
  insertPart.run('Aluminium Frame', 'frame', 2800);
  insertPart.run('Single Speed', 'gearSet', 500);
  insertPart.run('7-Speed', 'gearSet', 1800);
  insertPart.run('Road Tyres', 'tyres', 600);
  insertPart.run('V-Brakes', 'brakes', 400);
  insertPart.run('Flat Bar', 'handlebars', 800);
  insertPart.run('Basic Seat', 'seat', 350);
  insertPart.run('Standard Chain', 'chain', 300);
  insertPart.run('Steel Wheels', 'wheels', 1200);
});

afterAll(() => {
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

describe('Parts CRUD', () => {
  it('should list all parts', () => {
    const parts = db.prepare('SELECT * FROM parts ORDER BY category, name').all();
    expect(parts.length).toBe(10);
  });

  it('should filter parts by category', () => {
    const frames = db.prepare('SELECT * FROM parts WHERE category = ?').all('frame');
    expect(frames.length).toBe(2);
    expect(frames.every(p => p.category === 'frame')).toBe(true);
  });

  it('should create a new part', () => {
    const result = db.prepare('INSERT INTO parts (name, category, price) VALUES (?, ?, ?)').run('Carbon Frame', 'frame', 8500);
    expect(result.lastInsertRowid).toBeGreaterThan(0);
    const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(result.lastInsertRowid);
    expect(part.name).toBe('Carbon Frame');
    expect(part.price).toBe(8500);
  });

  it('should reject invalid category', () => {
    expect(() => {
      db.prepare('INSERT INTO parts (name, category, price) VALUES (?, ?, ?)').run('Bad Part', 'invalid', 100);
    }).toThrow();
  });

  it('should reject negative price', () => {
    expect(() => {
      db.prepare('INSERT INTO parts (name, category, price) VALUES (?, ?, ?)').run('Bad Part', 'frame', -100);
    }).toThrow();
  });

  it('should update part price and record history', () => {
    const part = db.prepare("SELECT * FROM parts WHERE name = 'Steel Frame'").get();
    const oldPrice = part.price;
    const newPrice = 1400;

    // Record history
    db.prepare('INSERT INTO price_history (part_id, old_price, new_price) VALUES (?, ?, ?)').run(part.id, oldPrice, newPrice);
    // Update price
    db.prepare('UPDATE parts SET price = ? WHERE id = ?').run(newPrice, part.id);

    const updated = db.prepare('SELECT * FROM parts WHERE id = ?').get(part.id);
    expect(updated.price).toBe(1400);

    const history = db.prepare('SELECT * FROM price_history WHERE part_id = ?').all(part.id);
    expect(history.length).toBe(1);
    expect(history[0].old_price).toBe(1200);
    expect(history[0].new_price).toBe(1400);
  });
});

describe('Configuration & Pricing', () => {
  it('should create a configuration with parts', () => {
    const parts = db.prepare('SELECT id FROM parts ORDER BY category LIMIT 8').all();
    // We need one from each category
    const frame = db.prepare("SELECT id FROM parts WHERE category = 'frame' LIMIT 1").get();
    const gear = db.prepare("SELECT id FROM parts WHERE category = 'gearSet' LIMIT 1").get();
    const tyres = db.prepare("SELECT id FROM parts WHERE category = 'tyres' LIMIT 1").get();
    const brakes = db.prepare("SELECT id FROM parts WHERE category = 'brakes' LIMIT 1").get();
    const bars = db.prepare("SELECT id FROM parts WHERE category = 'handlebars' LIMIT 1").get();
    const seat = db.prepare("SELECT id FROM parts WHERE category = 'seat' LIMIT 1").get();
    const chain = db.prepare("SELECT id FROM parts WHERE category = 'chain' LIMIT 1").get();
    const wheels = db.prepare("SELECT id FROM parts WHERE category = 'wheels' LIMIT 1").get();

    const configResult = db.prepare("INSERT INTO configurations (name) VALUES ('Test Config')").run();
    const configId = configResult.lastInsertRowid;

    const insertCP = db.prepare('INSERT INTO configuration_parts (configuration_id, part_id) VALUES (?, ?)');
    insertCP.run(configId, frame.id);
    insertCP.run(configId, gear.id);
    insertCP.run(configId, tyres.id);
    insertCP.run(configId, brakes.id);
    insertCP.run(configId, bars.id);
    insertCP.run(configId, seat.id);
    insertCP.run(configId, chain.id);
    insertCP.run(configId, wheels.id);

    const configParts = db.prepare('SELECT COUNT(*) as count FROM configuration_parts WHERE configuration_id = ?').get(configId);
    expect(configParts.count).toBe(8);
  });

  it('should calculate total price correctly', () => {
    const config = db.prepare('SELECT id FROM configurations LIMIT 1').get();
    const result = db.prepare(`
      SELECT COALESCE(SUM(p.price), 0) as total
      FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ?
    `).get(config.id);

    // Sum of: Steel Frame (1400 after update) + Single Speed (500) + Road Tyres (600) + V-Brakes (400) + Flat Bar (800) + Basic Seat (350) + Standard Chain (300) + Steel Wheels (1200)
    expect(result.total).toBe(1400 + 500 + 600 + 400 + 800 + 350 + 300 + 1200);
  });

  it('should get price breakdown', () => {
    const config = db.prepare('SELECT id FROM configurations LIMIT 1').get();
    const breakdown = db.prepare(`
      SELECT p.name, p.category, p.price
      FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ?
      ORDER BY p.category
    `).all(config.id);

    expect(breakdown.length).toBe(8);
    expect(breakdown.every(b => b.name && b.category && b.price > 0)).toBe(true);
  });

  it('should prevent deleting a part used in a configuration', () => {
    const usedPart = db.prepare(`
      SELECT part_id FROM configuration_parts LIMIT 1
    `).get();

    // Foreign key constraint should prevent deletion
    expect(() => {
      db.prepare('DELETE FROM parts WHERE id = ?').run(usedPart.part_id);
    }).toThrow();
  });

  it('should reflect updated prices in configuration total', () => {
    const config = db.prepare('SELECT id FROM configurations LIMIT 1').get();

    // Get current total
    const before = db.prepare(`
      SELECT COALESCE(SUM(p.price), 0) as total
      FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ?
    `).get(config.id);

    // Update a part's price
    const partInConfig = db.prepare(`
      SELECT p.id, p.price FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ? LIMIT 1
    `).get(config.id);

    db.prepare('UPDATE parts SET price = ? WHERE id = ?').run(partInConfig.price + 100, partInConfig.id);

    // Check total reflects the new price
    const after = db.prepare(`
      SELECT COALESCE(SUM(p.price), 0) as total
      FROM configuration_parts cp
      JOIN parts p ON cp.part_id = p.id
      WHERE cp.configuration_id = ?
    `).get(config.id);

    expect(after.total).toBe(before.total + 100);
  });
});
