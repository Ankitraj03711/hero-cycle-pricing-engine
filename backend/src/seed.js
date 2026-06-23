import { getDb, closeDb } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = getDb();

// Clear existing data
db.exec('DELETE FROM configuration_parts');
db.exec('DELETE FROM configurations');
db.exec('DELETE FROM price_history');
db.exec('DELETE FROM parts');

// Seed parts data
const parts = [
  // Frames
  { name: 'Steel Frame Standard', category: 'frame', price: 1200 },
  { name: 'Aluminium Frame Light', category: 'frame', price: 2800 },
  { name: 'Carbon Fiber Pro', category: 'frame', price: 8500 },
  { name: 'Chromoly Adventure', category: 'frame', price: 3500 },

  // Gear Sets
  { name: 'Single Speed', category: 'gearSet', price: 500 },
  { name: '7-Speed Shimano', category: 'gearSet', price: 1800 },
  { name: '21-Speed Pro', category: 'gearSet', price: 4200 },
  { name: '3-Speed Internal Hub', category: 'gearSet', price: 2500 },

  // Tyres
  { name: 'Road Tyres (700c)', category: 'tyres', price: 600 },
  { name: 'Mountain Tyres (26")', category: 'tyres', price: 900 },
  { name: 'Hybrid Tyres (700c)', category: 'tyres', price: 750 },
  { name: 'Fat Tyres (4.0")', category: 'tyres', price: 1400 },

  // Brakes
  { name: 'V-Brakes Standard', category: 'brakes', price: 400 },
  { name: 'Disc Brakes Mechanical', category: 'brakes', price: 1500 },
  { name: 'Disc Brakes Hydraulic', category: 'brakes', price: 3200 },
  { name: 'Caliper Brakes', category: 'brakes', price: 600 },

  // Handlebars
  { name: 'Flat Bar', category: 'handlebars', price: 800 },
  { name: 'Drop Bar Road', category: 'handlebars', price: 1500 },
  { name: 'Riser Bar MTB', category: 'handlebars', price: 1200 },
  { name: 'Bullhorn Bar', category: 'handlebars', price: 1000 },

  // Seats
  { name: 'Basic Saddle', category: 'seat', price: 350 },
  { name: 'Comfort Gel Seat', category: 'seat', price: 800 },
  { name: 'Racing Saddle', category: 'seat', price: 1500 },
  { name: 'Touring Saddle', category: 'seat', price: 1100 },

  // Chains
  { name: 'Standard Chain', category: 'chain', price: 300 },
  { name: 'Shimano HG Chain', category: 'chain', price: 650 },
  { name: 'KMC X11 Chain', category: 'chain', price: 900 },
  { name: 'Single Speed Chain', category: 'chain', price: 200 },

  // Wheels
  { name: 'Steel Spoke Wheels', category: 'wheels', price: 1200 },
  { name: 'Alloy Double Wall', category: 'wheels', price: 2200 },
  { name: 'Carbon Fiber Wheelset', category: 'wheels', price: 12000 },
  { name: 'Mag Alloy Wheels', category: 'wheels', price: 3500 },
];

const insertPart = db.prepare('INSERT INTO parts (name, category, price) VALUES (?, ?, ?)');

const insertAll = db.transaction(() => {
  for (const part of parts) {
    insertPart.run(part.name, part.category, part.price);
  }
});

insertAll();

// Create a sample configuration
const sampleParts = db.prepare(`
  SELECT id, category FROM parts WHERE name IN (
    'Aluminium Frame Light', '7-Speed Shimano', 'Road Tyres (700c)',
    'Disc Brakes Mechanical', 'Flat Bar', 'Comfort Gel Seat',
    'Shimano HG Chain', 'Alloy Double Wall'
  )
`).all();

if (sampleParts.length === 8) {
  const configResult = db.prepare("INSERT INTO configurations (name) VALUES ('Hero Sprint Pro 2024')").run();
  const insertConfigPart = db.prepare('INSERT INTO configuration_parts (configuration_id, part_id) VALUES (?, ?)');
  for (const part of sampleParts) {
    insertConfigPart.run(configResult.lastInsertRowid, part.id);
  }
}

// Add some price history for demo
const aluminiumFrame = db.prepare("SELECT id FROM parts WHERE name = 'Aluminium Frame Light'").get();
if (aluminiumFrame) {
  db.prepare("INSERT INTO price_history (part_id, old_price, new_price, changed_at) VALUES (?, ?, ?, datetime('now', '-3 months'))").run(aluminiumFrame.id, 2500, 2650);
  db.prepare("INSERT INTO price_history (part_id, old_price, new_price, changed_at) VALUES (?, ?, ?, datetime('now', '-1 month'))").run(aluminiumFrame.id, 2650, 2800);
}

console.log(`✅ Seeded ${parts.length} parts across 8 categories`);
console.log('✅ Created 1 sample configuration');
console.log('✅ Added sample price history');

closeDb();
