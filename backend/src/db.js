import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'pricing.db');
let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('frame', 'gearSet', 'tyres', 'brakes', 'handlebars', 'seat', 'chain', 'wheels')),
      price REAL NOT NULL CHECK(price > 0),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS configuration_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      configuration_id INTEGER NOT NULL,
      part_id INTEGER NOT NULL,
      FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE,
      FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      part_id INTEGER NOT NULL,
      old_price REAL NOT NULL,
      new_price REAL NOT NULL,
      changed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
    CREATE INDEX IF NOT EXISTS idx_config_parts_config ON configuration_parts(configuration_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_part ON price_history(part_id);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
