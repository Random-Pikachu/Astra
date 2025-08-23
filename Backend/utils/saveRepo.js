const Repo = require("../models/repo.model");
const Dependency = require("../models/dependency.model");

async function saveScannedRepo(repoData) {
  const repo = new Repo({
    userCode: repoData.userCode,
    name: repoData.name,
    path: repoData.path,
    status: repoData.status,
    packageManagers: repoData.packageManagers,
    lastScanned: repoData.lastScanned,
    repoCode: repoData.repoCode
  });

  console.log(repoData);
  await repo.save();

  // For now, we'll skip dependency creation since rawDependencies is not populated
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
