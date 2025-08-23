const express = require('express');
const router = express.Router();
const { scanRepoDependencies } = require('../controllers/dependencyController');

// POST /scan/repo
router.post('/scan/repo', async (req, res) => {
  try {
    const { repoCode } = req.body;
    if (!repoCode) {
      return res.status(400).json({ error: 'repoCode is required' });
    }

    const repo = await scanRepoDependencies(repoCode);
    res.json({ message: 'Scan completed', repo });
  } catch (error) {
    console.error('Repo scan failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
