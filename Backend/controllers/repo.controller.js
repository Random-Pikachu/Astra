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
    console.error(err);
    res.status(500).json({ error: "Failed to scan repo" });
  }
};

exports.getRepoList = async (req, res) => {
    try {
        const {userCode} = req.params;
        const repos = await Repo.find({ userCode });
        res.json(repos);
    } catch (err) {
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: "Failed to remove repo" });
    }
}