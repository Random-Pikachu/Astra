const { log } = require("console");
const fs = require("fs");
const path = require("path");

const SUPPORTED_MANIFESTS = {
  "package.json": "npm",
  "requirements.txt": "pip",
  "pyproject.toml": "pip",
  Pipfile: "pip",
  "composer.json": "php",
  Gemfile: "ruby",
  "Cargo.toml": "rust",
};

const IGNORED_DIRS = new Set([
  "node_modules",
  "venv",
  ".venv",
  "env",
  ".git",
  "dist",
  "build",
  ".cache",
]);

function findManifestFiles(dir) {
  try {
    let manifests = [];
    function walk(currentPath) {
      try {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
          try {
            const fullPath = path.join(currentPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              if (!IGNORED_DIRS.has(file)) {
                walk(fullPath);
              }
            } else if (SUPPORTED_MANIFESTS[file]) {
              manifests.push(fullPath);
            }
          } catch (fileError) {
            console.error(`Error processing file ${file}:`, fileError);
            // Continue with other files
          }
        }
      } catch (dirError) {
        console.error(`Error reading directory ${currentPath}:`, dirError);
        // Continue with other directories
      }
    }
    walk(dir);
    return manifests;
  } catch (error) {
    console.error(`Error in findManifestFiles for ${dir}:`, error);
    return [];
  }
}

function extractDependencies(filePath) {
  try {
    const fileName = path.basename(filePath);
    const ecosystem = SUPPORTED_MANIFESTS[fileName];
    let count = 0;
    let pkg;
    let cleaned = {};
    if (fileName === "package.json") {
      pkg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      // console.log(pkg.dependencies);
      // console.log(typeof pkg.dependencies);

      cleaned = {};
      if (pkg.dependencies && typeof pkg.dependencies === "object") {
        for (const [dep, version] of Object.entries(pkg.dependencies)) {
          cleaned[String(dep)] = String(version || "").replace(/^[^\d]*/, "");
        }
      }

      if (pkg.devDependencies && typeof pkg.devDependencies === "object") {
        for (const [dep, version] of Object.entries(pkg.devDependencies)) {
          cleaned[String(dep)] = String(version || "").replace(/^[^\d]*/, "");
        }
      }
      // console.log(cleaned);

      count =
        Object.keys(pkg.dependencies || {}).length +
        Object.keys(pkg.devDependencies || {}).length;
    } else if (fileName === "requirements.txt") {
      const lines = fs.readFileSync(filePath, "utf-8").split("\n");
      count = lines.filter((l) => l.trim() && !l.startsWith("#")).length;
    }

    return { ecosystem, packageFile: fileName, dependencies: cleaned, dependenciesCount: count };
  } catch (error) {
    console.error(`Error extracting dependencies from ${filePath}:`, error);
    const fileName = path.basename(filePath);
    const ecosystem = SUPPORTED_MANIFESTS[fileName];
    return { ecosystem, packageFile: fileName, dependencies: {} };
  }
}

function buildRepoData(userCode, repoPath, manifestFiles, repoName) {
  const packageManagers = [];
  let allDependencies = {}; 

  for (const manifest of manifestFiles) {
    const { ecosystem, packageFile, dependencies, dependenciesCount } =
      extractDependencies(manifest);

    packageManagers.push({
      ecosystem,
      packageFile,
      dependenciesCount,
    });

    allDependencies = { ...allDependencies, ...dependencies };
  }

  return {
    userCode,
    name: repoName,
    path: repoPath,
    status: "active",
    packageManagers,
    rawDependencies: allDependencies,
    lastScanned: new Date(),
    repoCode: `repo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

module.exports = { findManifestFiles, buildRepoData };
