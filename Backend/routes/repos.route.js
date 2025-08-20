const express = require("express");
const Repo = require("../models/repo.model");
const { findManifestFiles, buildRepoData } = require("../utils/repoScaner");

const router = express.Router();

// POST /api/repos/scan
router.post("/store-directory", async (req, res) => {
  try {
    const { userCode, path: repoPath } = req.body;
    if (!userCode || !repoPath) {
      return res.status(400).json({ error: "userCode and path are required" });
    }

    // find dependency manifests
    const manifests = findManifestFiles(repoPath);
    if (manifests.length === 0) {
      return res.status(404).json({ error: "No supported manifest found in this repo" });
    }

    // build repo object
    const repoData = buildRepoData(userCode, repoPath, manifests);

    // create or update repo in DB
    let repo = await Repo.findOne({ repoCode: repoData.repoCode });
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
