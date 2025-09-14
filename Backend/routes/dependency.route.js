const express = require("express");
const router = express.Router();
const {
  scanRepoDependencies,
  getVulnerablityOverview,
  getVulnerablityDetails,
  getVulnerabilityStats,
} = require("../controllers/dependency.controller");
const Dependency = require("../models/dependency.model");
const { generateFixPrompt } = require("../utils/generatePrompt");
const { runGeminiPrompt } = require("../utils/gemini");
const Repo = require("../models/repo.model");
const { getIO } = require("../utils/socket");

// POST /scan/repo
router.post("/scan/repo", async (req, res) => {
  try {
    const { repoCode } = req.body;
    if (!repoCode) {
      return res.status(400).json({ error: "repoCode is required" });
    }
    const repo = await scanRepoDependencies(repoCode);
    res.json({ message: "Scan completed", repo });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vulnerablity-overview/:repoCode", getVulnerablityOverview);
router.get(
  "/vulnerablity-details/:repoCode/:dependencyCode",
  getVulnerablityDetails
);

router.post("/fix", async (req, res) => {
  const { dependencyCode } = req.body;
  const io = getIO();
  const channelId = req.body.channelId || dependencyCode;
  try {
    const vulnerabilities = await Dependency.findOne({ dependencyCode: dependencyCode }).select("vulnerabilities.vulnerabilityId vulnerabilities.summary vulnerabilities.details locations repoCode");

    vulnerabilities.vulnerabilities = vulnerabilities.vulnerabilities.map(vul => {
      if (vul.details && vul.details.length > 700) {
        vul.details = vul.details.substring(0, 700) + "...";
      }
      return vul;
    });

    const repoDoc = await Repo.findOne({repoCode: vulnerabilities.repoCode}).select("path").lean();

    let prompt;
    try {
      prompt = await generateFixPrompt(vulnerabilities);
    } catch (e) {
      // Stream prompt generation error to the client for better UX
      try { io.to(channelId).emit('fix-progress', { channelId, type: 'error', message: `[error] prompt generation failed: ${e?.response?.data?.error?.message || e.message}`, meta: null, ts: Date.now() }); } catch (_) {}
      throw e;
    }

    let response = await runGeminiPrompt(repoDoc.path, prompt, { io, channelId });

    try { io.to(channelId).emit('fix-progress', { channelId, type: 'info', message: 'Rescanning repository for vulnerabilities...', meta: null, ts: Date.now() }); } catch (_) {}
    const updatedRepo = await scanRepoDependencies(vulnerabilities.repoCode);
    try { io.to(channelId).emit('fix-progress', { channelId, type: 'complete', message: 'Rescan complete. Database updated for existing repo.', meta: null, ts: Date.now() }); } catch (_) {}

    res.json({message:"Fix applied and rescanned", prompt: prompt, response: response, repo: updatedRepo });
  } catch (error) {
    // Also stream a terminal error to the UI so the modal shows something actionable
    try { io.to(channelId).emit('fix-progress', { channelId, type: 'error', message: `[error] ${error.message || 'Internal server error'}` , meta: null, ts: Date.now() }); } catch (_) {}
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vulnerabilityStats/:repoCode", getVulnerabilityStats);

module.exports = router;
