import { Router } from 'express';
import { getAllConfigurations, getConfigurationById, createConfiguration, updateConfiguration, deleteConfiguration } from '../models/configurations.js';

const router = Router();

// GET /api/configurations
router.get('/', (req, res) => {
  const configs = getAllConfigurations();
  res.json(configs);
});

// GET /api/configurations/:id
router.get('/:id', (req, res) => {
  const config = getConfigurationById(Number(req.params.id));
  if (!config) return res.status(404).json({ error: 'Configuration not found' });
  res.json(config);
});

// POST /api/configurations
router.post('/', (req, res) => {
  const { name, partIds } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Configuration name is required' });
  }
  if (!partIds || !Array.isArray(partIds)) {
    return res.status(400).json({ error: 'partIds must be an array of part IDs' });
  }
  if (partIds.length !== 8) {
    return res.status(400).json({ error: 'Must select exactly 8 parts (one per category)' });
  }

  const result = createConfiguration({ name: name.trim(), partIds });
  if (result.error) return res.status(400).json(result);
  res.status(201).json(result);
});

// PUT /api/configurations/:id
router.put('/:id', (req, res) => {
  const { name, partIds } = req.body;

  if (partIds && (!Array.isArray(partIds) || partIds.length !== 8)) {
    return res.status(400).json({ error: 'partIds must be an array of exactly 8 part IDs' });
  }

  const result = updateConfiguration(Number(req.params.id), { name: name?.trim(), partIds });
  if (!result) return res.status(404).json({ error: 'Configuration not found' });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// DELETE /api/configurations/:id
router.delete('/:id', (req, res) => {
  const result = deleteConfiguration(Number(req.params.id));
  if (!result.deleted) return res.status(404).json({ error: 'Configuration not found' });
  res.json({ message: 'Configuration deleted successfully' });
});

export default router;
