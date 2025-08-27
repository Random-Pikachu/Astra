const Repo = require("../models/repo.model");
const Dependency = require("../models/dependency.model");
const { fetchVulnerabilities } = require("./osvService");

async function saveScannedRepo(repoData) {
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
    let ecosystem = 'npm'; // default
    if (repoData.packageManagers && repoData.packageManagers.length > 0) {
      const packageManager = repoData.packageManagers.find(pm => 
        pm.packageFile === 'package.json' || 
        pm.packageFile === 'requirements.txt' || 
        pm.packageFile === 'pyproject.toml' || 
        pm.packageFile === 'Pipfile' || 
        pm.packageFile === 'composer.json' || 
        pm.packageFile === 'Gemfile' || 
        pm.packageFile === 'Cargo.toml'
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
      const formattedVulns = vulns.map(vuln => {
        if (vuln) {
          severity = vuln.database_specific?.severity || vuln.ecosystem_specific?.severity || 'UNKNOWN';
          console.log(vuln.database_specific?.severity);
          console.log(vuln.ecosystem_specific?.severity);
        }

        return {
          vulnerabilityId: vuln.id,
          summary: vuln.summary || 'No summary available',
          details: vuln.details || 'No details available',
          severity,
          references: vuln.references || [],
          affected: vuln.affected || [],
          publishedAt: vuln.published ? new Date(vuln.published) : new Date(),
          modifiedAt: vuln.modified ? new Date(vuln.modified) : null
        };
      });
      
      dependency.vulnerabilities = formattedVulns;
      dependency.scannedAt = new Date();
    } catch (error) {
      console.error(`Error scanning vulnerabilities for ${name}@${version}:`, error);
      // Continue with empty vulnerabilities if scanning fails
    }
    
    await dependency.save();
    dependencies.push(dependency._id);
  }

  repo.dependencies = dependencies;
  await repo.save();

  return repo;
}

module.exports = { saveScannedRepo };
