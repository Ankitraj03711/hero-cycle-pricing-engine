import express from 'express';
import cors from 'cors';
import partsRouter from './routes/parts.js';
import configurationsRouter from './routes/configurations.js';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚲 Hero Cycles Pricing Engine API running on http://localhost:${PORT}`);
});

export default app;
