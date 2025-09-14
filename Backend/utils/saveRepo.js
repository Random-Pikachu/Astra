const Repo = require("../models/repo.model");
const Dependency = require("../models/dependency.model");
const { fetchVulnerabilities } = require("./osvService");
const { getImports, initParsers } = require("./locationGetter");
const { findManifestFiles, buildRepoData } = require("./repoScaner");

async function saveScannedRepo(repoData) {
  // Initialize parsers for location detection (optional)
  console.log("inside saveScannedRepo");
  let parsersInitialized = false;
  try {
    await initParsers();
    parsersInitialized = true;
    console.log("Parsers initialized successfully");
  } catch (initError) {
    console.log(
      "Failed to initialize parsers (location detection will be skipped):",
      initError.message
    );
    console.log("Error details:", initError);
  }

  const repo = new Repo({
    userCode: repoData.userCode,
    name: repoData.name,
    path: repoData.path,
    status: repoData.status,
    packageManagers: repoData.packageManagers,
    lastScanned: repoData.lastScanned,
    repoCode: repoData.repoCode,
  });

  console.log(repoData);
  await repo.save();

  // Create dependencies and scan for vulnerabilities
  const dependencies = [];

  for (const [name, version] of Object.entries(repoData.rawDependencies)) {
    // Find the ecosystem based on the package file
    let ecosystem = "npm"; // default
    if (repoData.packageManagers && repoData.packageManagers.length > 0) {
      const packageManager = repoData.packageManagers.find(
        (pm) =>
          pm.packageFile === "package.json" ||
          pm.packageFile === "requirements.txt" ||
          pm.packageFile === "pyproject.toml" ||
          pm.packageFile === "Pipfile" ||
          pm.packageFile === "composer.json" ||
          pm.packageFile === "Gemfile" ||
          pm.packageFile === "Cargo.toml"
      );
      if (packageManager) {
        ecosystem = packageManager.ecosystem;
      }
    }

    // Create dependency
    const dependency = new Dependency({
      repoCode: repo.repoCode, // Use the string repoCode instead of ObjectId
      ecosystem: ecosystem, // Add ecosystem field
      dependencyName: name,
      dependencyVersion: version,
      vulnerabilities: [],
    });

    // Scan for vulnerabilities using OSV API
    try {
      const vulns = await fetchVulnerabilities(ecosystem, name, version);

      // Format vulnerabilities
      const formattedVulns = vulns.map((vuln) => {
        let severity = "UNKNOWN";
        if (vuln) {
          severity =
            vuln.database_specific?.severity ||
            vuln.ecosystem_specific?.severity ||
            "UNKNOWN";
          console.log(severity);
          // console.log(vuln.ecosystem_specific?.severity);
        }

        return {
          vulnerabilityId: vuln.id,
          summary: vuln.summary || "No summary available",
          details: vuln.details || "No details available",
          severity,
          references: vuln.references || [],
          affected: vuln.affected || [],
          publishedAt: vuln.published ? new Date(vuln.published) : new Date(),
          modifiedAt: vuln.modified ? new Date(vuln.modified) : null,
        };
      });

      dependency.vulnerabilities = formattedVulns;
      dependency.scannedAt = new Date();
    } catch (error) {
      console.error(
        `Error scanning vulnerabilities for ${name}@${version}:`,
        error
      );
      // Continue with empty vulnerabilities if scanning fails
    }

    await dependency.save();

    // Get locations where dependency is used
    if (parsersInitialized) {
      try {
        let language = "javascript";
        if (
          dependency.ecosystem.toLowerCase() === "pypi" ||
          dependency.ecosystem.toLowerCase() === "pip"
        ) {
          language = "python";
        }
        const locations = getImports(
          repoData.path,
          language,
          dependency.dependencyName
        );
        dependency.locations = locations || [];
        await dependency.save(); // Save again with locations
        console.log(`Found ${locations?.length || 0} locations for ${name}`);
      } catch (locationError) {
        console.warn(
          `Location detection failed for ${name}@${version}:`,
          locationError.message
        );
        dependency.locations = []; // Set empty array if location detection fails
        await dependency.save(); // Still save the dependency
      }
    } else {
      console.log(
        `Skipping location detection for ${name} - parsers not initialized`
      );
      dependency.locations = [];
      await dependency.save();
    }

    dependencies.push(dependency._id);
  }

  repo.dependencies = dependencies;
  await repo.save();

  return repo;
}

async function scanDependencyDetails(repoCode) {
  // Re-scan dependencies for an existing repo without creating a new Repo entry
  let parsersInitialized = false;
  try {
    await initParsers();
    parsersInitialized = true;
  } catch (initError) {
    console.log(
      "Failed to initialize parsers (location detection will be skipped):",
      initError.message
    );
  }

  const repo = await Repo.findOne({ repoCode });
  if (!repo) {
    throw new Error(`Repo with code ${repoCode} not found`);
  }

  const manifests = findManifestFiles(repo.path);
  const repoData = buildRepoData(repo.userCode, repo.path, manifests, repo.name);

  // Update repo metadata
  repo.packageManagers = repoData.packageManagers || [];
  repo.lastScanned = new Date();
  await repo.save();

  // Replace dependencies in place
  await Dependency.deleteMany({ repoCode: repo.repoCode });

  const newDependencyIds = [];
  let processedCount = 0;
  let errorCount = 0;

  for (const [dependencyName, dependencyVersion] of Object.entries(
    repoData.rawDependencies || {}
  )) {
    let ecosystem = "npm";
    if (Array.isArray(repo.packageManagers) && repo.packageManagers.length > 0) {
      const pm = repo.packageManagers.find(
        (p) =>
          p.packageFile === "package.json" ||
          p.packageFile === "requirements.txt" ||
          p.packageFile === "pyproject.toml" ||
          p.packageFile === "Pipfile" ||
          p.packageFile === "composer.json" ||
          p.packageFile === "Gemfile" ||
          p.packageFile === "Cargo.toml"
      );
      if (pm) ecosystem = pm.ecosystem;
    }

    const dependency = new Dependency({
      repoCode: repo.repoCode,
      ecosystem,
      dependencyName,
      dependencyVersion,
      vulnerabilities: [],
    });

    try {
      const vulns = await fetchVulnerabilities(ecosystem, dependencyName, dependencyVersion);
      const formattedVulns = (vulns || []).map((vuln) => {
        let severity = "UNKNOWN";
        if (vuln) {
          severity =
            vuln.database_specific?.severity ||
            vuln.ecosystem_specific?.severity ||
            "UNKNOWN";
        }
        return {
          vulnerabilityId: vuln.id,
          summary: vuln.summary || "No summary available",
          details: vuln.details || "No details available",
          severity,
          references: vuln.references || [],
          affected: vuln.affected || [],
          publishedAt: vuln.published ? new Date(vuln.published) : new Date(),
          modifiedAt: vuln.modified ? new Date(vuln.modified) : null,
        };
      });
      dependency.vulnerabilities = formattedVulns;
      dependency.scannedAt = new Date();
    } catch (scanError) {
      console.error(
        `Error scanning vulnerabilities for ${dependencyName}@${dependencyVersion}:`,
        scanError
      );
      errorCount++;
    }

    await dependency.save();

    if (parsersInitialized) {
      try {
        let language = "javascript";
        if (
          dependency.ecosystem.toLowerCase() === "pypi" ||
          dependency.ecosystem.toLowerCase() === "pip"
        ) {
          language = "python";
        }
        const locations = getImports(repo.path, language, dependency.dependencyName);
        dependency.locations = locations || [];
        await dependency.save();
      } catch (locationError) {
        console.warn(
          `Location detection failed for ${dependencyName}@${dependencyVersion}:`,
          locationError.message
        );
      }
    } else {
      dependency.locations = [];
      await dependency.save();
    }

    newDependencyIds.push(dependency._id);
    processedCount++;
  }

  repo.dependencies = newDependencyIds;
  await repo.save();

  return {
    total: Object.keys(repoData.rawDependencies || {}).length,
    processed: processedCount,
    errors: errorCount,
  };
}

module.exports = { saveScannedRepo, scanDependencyDetails };
