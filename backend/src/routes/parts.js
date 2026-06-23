import { Router } from 'express';
import { getAllParts, getPartById, createPart, updatePart, deletePart, getPriceHistory, CATEGORIES } from '../models/parts.js';

const router = Router();

// GET /api/parts?category=frame
router.get('/', (req, res) => {
  const { category } = req.query;
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
  }
  const parts = getAllParts(category || null);
  res.json(parts);
});

// GET /api/parts/:id
router.get('/:id', (req, res) => {
  const part = getPartById(Number(req.params.id));
  if (!part) return res.status(404).json({ error: 'Part not found' });
  res.json(part);
});

// GET /api/parts/:id/history
router.get('/:id/history', (req, res) => {
  const part = getPartById(Number(req.params.id));
  if (!part) return res.status(404).json({ error: 'Part not found' });
  const history = getPriceHistory(Number(req.params.id));
  res.json(history);
});

// POST /api/parts
router.post('/', (req, res) => {
  const { name, category, price } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'name, category, and price are required' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  const part = createPart({ name, category, price });
  res.status(201).json(part);
});

// PUT /api/parts/:id
router.put('/:id', (req, res) => {
  const { name, category, price } = req.body;

  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
  }
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  const part = updatePart(Number(req.params.id), { name, category, price });
  if (!part) return res.status(404).json({ error: 'Part not found' });
  res.json(part);
});

// DELETE /api/parts/:id
router.delete('/:id', (req, res) => {
  const result = deletePart(Number(req.params.id));
  if (result.error) return res.status(409).json(result);
  if (!result.deleted) return res.status(404).json({ error: 'Part not found' });
  res.json({ message: 'Part deleted successfully' });
});

export default router;
