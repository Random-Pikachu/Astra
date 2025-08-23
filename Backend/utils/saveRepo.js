const Repo = require("../models/Repo");
const Dependency = require("../models/Dependency");

async function saveScannedRepo(repoData) {
  const repo = new Repo({
    userCode: repoData.userCode,
    name: repoData.name,
    path: repoData.path,
    status: repoData.status,
    packageManagers: repoData.packageManagers,
    lastScanned: repoData.lastScanned
  });

  await repo.save();

  const dependencies = await Dependency.insertMany(
    repoData.rawDependencies.map(dep => ({
      repoCode: repo._id, 
      dependencyName: dep.dependencyName,
      dependencyVersion: dep.dependencyVersion,
      vulnerabilities: [] 
    }))
  );

  repo.dependencies = dependencies.map(d => d._id);
  await repo.save();

  return repo;
}

module.exports = { saveScannedRepo };
