const express = require("express");
const router = express.Router();
const {
  scanRepoDependencies,
  getVulnerablityOverview,
  getVulnerablityDetails,
} = require("../controllers/dependency.controller");
const Dependency = require("../models/dependency.model");
const { generateFixPrompt } = require("../utils/generatePrompt");

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

router.post("/generate-fix-prompt", async (req, res) => {
  try {
    const { dependencyCode } = req.body;

    const vulnerabilities = await Dependency.findOne({ dependencyCode: dependencyCode }).select("vulnerabilities.vulnerabilityId vulnerabilities.summary vulnerabilities.details locations");
    

    vulnerabilities.vulnerabilities = vulnerabilities.vulnerabilities.map(vul => {
      if (vul.details && vul.details.length > 700) {
        vul.details = vul.details.substring(0, 700) + "...";
      }

      return vul
    })
    
    let prompt = await generateFixPrompt(vulnerabilities);
    res.json({message:"Prompt generated" , prompt: prompt });
  } catch (error) {
    console.error("Prompt generation failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
