const { findManifestFiles, buildRepoData } = require("../utils/repoScaner");
const { saveScannedRepo } = require("../utils/saveRepo");

exports.storeRepo = async (req, res) => {
  try {
    const { userCode, path: repoPath, name: repoName } = req.body;
    if (!userCode || !repoPath) {
      return res.status(400).json({ error: "userCode and path are required" });
    }

    const manifests = findManifestFiles(repoPath);
    if (manifests.length === 0) {
      return res
        .status(404)
        .json({ error: "No supported manifest found in this repo" });
    }

    const repoData = buildRepoData(userCode, repoPath, manifests, repoName);
    const repo = await saveScannedRepo(repoData);
    res.json({ message: "Repo scanned successfully", repo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scan repo" });
  }
};
