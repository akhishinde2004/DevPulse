const express = require('express');
const router = express.Router();
const {
  getProfile,
  getRepos,
  getCommits,
  getPRStats,
  getHeatmap,
} = require('../controllers/githubController');

router.get('/profile/:username', getProfile);
router.get('/repos/:username', getRepos);
router.get('/commits/:username', getCommits);
router.get('/prstats/:username', getPRStats);
router.get('/heatmap/:username', getHeatmap);

module.exports = router;
