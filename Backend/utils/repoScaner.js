const fs = require("fs");
const path = require("path");

const SUPPORTED_MANIFESTS = {
  "package.json": "npm",
  "requirements.txt": "pip",
  "pyproject.toml": "pip",
  "Pipfile": "pip",
  "composer.json": "php",
  "Gemfile": "ruby",
  "Cargo.toml": "rust"
};

const IGNORED_DIRS = new Set([
  "node_modules",
  "venv",
  ".venv",
  "env",
  ".git",
  "dist",
  "build",
  ".cache"
]);

function findManifestFiles(dir) {
  let manifests = [];
  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!IGNORED_DIRS.has(file)) {
          walk(fullPath);
        }
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

function buildRepoData(userCode, repoPath, manifestFiles, repoName) {
  const packageManagers = [];
  let allDependencies = [];

  for (const manifest of manifestFiles) {
    const { ecosystem, packageFile, dependencies } =
      extractDependencies(manifest);

    packageManagers.push({
      ecosystem,
      packageFile,
      dependenciesCount: dependencies.length
    });

    allDependencies = [...allDependencies, ...dependencies];
  }

  return {
    userCode,
    name: repoName,
    path: repoPath,
    status: "active",
    packageManagers,
    rawDependencies: allDependencies, 
    lastScanned: new Date()
  };
}


module.exports = { findManifestFiles, buildRepoData };
