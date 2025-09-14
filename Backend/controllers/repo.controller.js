
const { findManifestFiles, buildRepoData } = require("../utils/repoScaner");
const { saveScannedRepo } = require("../utils/saveRepo");
const Repo = require("../models/repo.model");
const User = require("../models/user.model");
const Dependency = require("../models/dependency.model");

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
    res.status(500).json({ error: "Failed to scan repo" });
  }
};

exports.getRepoList = async (req, res) => {
    try {
        const {userCode} = req.params;
        const repos = await Repo.find({ userCode });
        res.json(repos);
    } catch (err) {
        res.status(500).json({ error: "Failed to get repo list" });
    }
}

exports.removeRepo = async(req, res) => { 
    try{
        const {userCode, repoCode} = req.params;
        const user = await User.findOne({userCode});
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        const repo = await Repo.findOne({repoCode});
        if(!repo){
            return res.status(404).json({error: "Repo not found"});
        }
        await Repo.findByIdAndDelete(repo._id);
        await Dependency.deleteMany({repoCode: repo.repoCode});
        res.json({message: "Repo removed successfully"});
    }catch(err){
        res.status(500).json({ error: "Failed to remove repo" });
    }
}


exports.viewReposStats = async (req, res) => {
    try{
        const {userCode} = req.params;
        const repo = await Repo.find({userCode}).populate('dependencies');
        if(!repo){ 
            return res.status(404).json({error: "Repos not found"});
        }

        const repoStats = repo.map(r => {
            let totalVulnerabilities = 0;
            const severityCounts = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                unknown: 0
            };

            (r.dependencies || []).forEach(dependency => {
                if (dependency && Array.isArray(dependency.vulnerabilities)) {
                    totalVulnerabilities += dependency.vulnerabilities.length;
                    dependency.vulnerabilities.forEach(vuln => {
                        const sev = (vuln.severity || '').toLowerCase();
                        if (severityCounts.hasOwnProperty(sev)) {
                            severityCounts[sev]++;
                        } else {
                            severityCounts.unknown++;
                        }
                    });
                }
            });

            const ecosystem = r.packageManagers.map(pm => pm.ecosystem);

            return {
                repo: r,
                totalVulnerabilities,
                ecosystem: ecosystem,
                severityCounts
            };
        });

       
        const allEcosystems = new Set();
        repo.forEach(r => {
            if (Array.isArray(r.packageManagers)) {
                r.packageManagers.forEach(pm => {
                    if (pm && pm.ecosystem) {
                        allEcosystems.add(pm.ecosystem);
                    }
                });
            }
        });
        const distinctPackageManagers = Array.from(allEcosystems);

        const mostVulnerableRepo = repoStats.length > 0
            ? repoStats.reduce((max, curr) => curr.totalVulnerabilities > max.totalVulnerabilities ? curr : max, repoStats[0])
            : null;

        const repoWithHighestSeverity = repoStats.length > 0
            ? repoStats.reduce((max, curr) => {
                const currHighCritical = curr.severityCounts.critical + curr.severityCounts.high;
                const currTotal = curr.totalVulnerabilities || 1;
                const maxHighCritical = max.severityCounts.critical + max.severityCounts.high;
                const maxTotal = max.totalVulnerabilities || 1;
                const currRatio = currHighCritical / currTotal;
                const maxRatio = maxHighCritical / maxTotal;
                return currRatio > maxRatio ? curr : max;
            }, repoStats[0])
            : null;
        
        

        const response = {
            message: "Repos stats retrieved successfully",
            repoStats: repoStats,
            mostVulnerableRepo: mostVulnerableRepo,
            repoWithHighestSeverity: repoWithHighestSeverity,
            distinctPackageManagers: distinctPackageManagers
        };

        
        res.json(response);
    
    }catch(err){
        res.status(500).json({ error: "Failed to view repos stats" });
    }
}