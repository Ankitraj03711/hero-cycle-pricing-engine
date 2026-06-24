import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import partsRouter from './routes/parts.js';
import configurationsRouter from './routes/configurations.js';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
getDb();

// Routes
app.use('/api/parts', partsRouter);
app.use('/api/configurations', configurationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    if (fs.existsSync(frontendIndexPath)) {
      return res.sendFile(frontendIndexPath);
    }

    return next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚲 Hero Cycles Pricing Engine API running on http://localhost:${PORT}`);
});

export default app;
