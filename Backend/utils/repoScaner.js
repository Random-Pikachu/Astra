const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SUPPORTED_MANIFESTS = {
  "package.json": "npm",
  "requirements.txt": "pip",
  "pyproject.toml": "pip",
  "Pipfile": "pip",
  "composer.json": "php",
  "Gemfile": "ruby",
  "Cargo.toml": "rust"
};

function findManifestFiles(dir) {
  let manifests = [];
  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (SUPPORTED_MANIFESTS[file]) {
        manifests.push(fullPath);
      }
    }
  }
  walk(dir);
  return manifests;
}

function extractDependencies(filePath) {
  const fileName = path.basename(filePath);
  const ecosystem = SUPPORTED_MANIFESTS[fileName];
  let count = 0;

  if (fileName === "package.json") {
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    count =
      Object.keys(pkg.dependencies || {}).length +
      Object.keys(pkg.devDependencies || {}).length;
  } else if (fileName === "requirements.txt") {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    count = lines.filter(l => l.trim() && !l.startsWith("#")).length;
  }

  return { ecosystem, packageFile: fileName, dependenciesCount: count };
}

function buildRepoData(userId, repoPath, manifestFiles) {
  const repoName = path.basename(repoPath);
  const repoId = crypto.createHash("md5").update(repoPath).digest("hex");
  const packageManagers = manifestFiles.map(extractDependencies);

  return {
    userId,
    repoId,
    name: repoName,
    path: repoPath,
    status: "active",
    packageManagers,
    lastScanned: new Date()
  };
}

module.exports = { findManifestFiles, buildRepoData };
