const express = require("express");
const Repo = require("../models/repo");
const { findManifestFiles, buildRepoData } = require("../utils/repoScanner");

const router = express.Router();

// POST /api/repos/scan
router.post("/scan", async (req, res) => {
  try {
    const { userId, path: repoPath } = req.body;
    if (!userId || !repoPath) {
      return res.status(400).json({ error: "userId and path are required" });
    }

    // find dependency manifests
    const manifests = findManifestFiles(repoPath);
    if (manifests.length === 0) {
      return res.status(404).json({ error: "No supported manifest found in this repo" });
    }

    // build repo object
    const repoData = buildRepoData(userId, repoPath, manifests);

    // create or update repo in DB
    let repo = await Repo.findOne({ repoId: repoData.repoId });
    if (repo) {
      repo.set(repoData);
      await repo.save();
    } else {
      repo = new Repo(repoData);
      await repo.save();
    }

    res.json({ message: "Repo scanned successfully", repo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scan repo" });
  }
});

module.exports = router;
