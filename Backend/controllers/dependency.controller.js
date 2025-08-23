const Repo = require('../models/Repo');
const { fetchVulnerabilities } = require('../services/osvService'); // OSV POST request

async function scanRepoDependencies(repoCode) {
  const repo = await Repo.findOne({ repoCode }).populate('dependencies', 'dependencyName dependencyVersion ecosystem');
  if (!repo) {
    throw new Error(`Repo with code ${repoCode} not found`);
  }

  for (const dep of repo.dependencies) {
    const vulns = await fetchVulnerabilities(dep.ecosystem, dep.dependencyName, dep.dependencyVersion);

    const formattedVulns = vulns.map(vuln => {
      let severity = 'UNKNOWN';
      if (vuln.affected && vuln.affected.length > 0) {
        severity = vuln.affected[0].ecosystem_specific?.severity || 'UNKNOWN';
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

    dep.vulnerabilities = formattedVulns;
    dep.scannedAt = new Date();
    await dep.save();
  }

  repo.lastScanned = new Date();
  await repo.save();

  return repo;
}

module.exports = { scanRepoDependencies };
