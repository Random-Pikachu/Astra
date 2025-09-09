const express = require("express");
const router = express.Router();
const {
  scanRepoDependencies,
  getVulnerablityOverview,
  getVulnerablityDetails,
} = require("../controllers/dependency.controller");
const Dependency = require("../models/dependency.model");
const { generateFixPrompt } = require("../utils/generatePrompt");
const { runGeminiPrompt } = require("../utils/gemini");
const Repo = require("../models/repo.model");

// POST /scan/repo
router.post("/scan/repo", async (req, res) => {
  try {
    const { repoCode } = req.body;
    if (!repoCode) {
      return res.status(400).json({ error: "repoCode is required" });
    }
    const repo = await scanRepoDependencies(repoCode);
    console.log(repo);
    res.json({ message: "Scan completed", repo });
  } catch (error) {
    console.error("Repo scan failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vulnerablity-overview/:repoCode", getVulnerablityOverview);
router.get(
  "/vulnerablity-details/:repoCode/:dependencyCode",
  getVulnerablityDetails
);

router.post("/fix", async (req, res) => {
  try {
    const { dependencyCode } = req.body;

    const vulnerabilities = await Dependency.findOne({ dependencyCode: dependencyCode }).select("vulnerabilities.vulnerabilityId vulnerabilities.summary vulnerabilities.details locations repoCode");
    
    vulnerabilities.vulnerabilities = vulnerabilities.vulnerabilities.map(vul => {
      if (vul.details && vul.details.length > 700) {
        vul.details = vul.details.substring(0, 700) + "...";
      }

      return vul
    })

    const repoDoc = await Repo.findOne({repoCode: vulnerabilities.repoCode}).select("path").lean();
    console.log(`repopath: ${repoDoc.path}`);
    let prompt = await generateFixPrompt(vulnerabilities);
    let response = await runGeminiPrompt(repoDoc.path, prompt);
    res.json({message:"Prompt generated" , prompt: prompt, response: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
