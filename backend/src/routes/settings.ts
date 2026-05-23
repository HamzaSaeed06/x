import { Router } from 'express';
import { Settings } from '../models/Settings.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ _key: 'store' });
  if (!settings) {
    settings = await Settings.create({ _key: 'store' });
  }
  return settings;
}

// GET /api/settings
router.get('/', async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings.toObject());
  } catch {
    res.json({});
  }
});

// PATCH /api/admin/settings
router.patch('/admin', requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { _key: 'store' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings!.toObject());
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
