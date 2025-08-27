const Repo = require('../models/repo.model');
const Dependency = require('../models/dependency.model');
const { fetchVulnerabilities } = require('../utils/osvService'); // OSV POST request

async function scanRepoDependencies(repoCode) {
  const repo = await Repo.findOne({ repoCode }).populate('dependencies', 'dependencyName dependencyVersion ecosystem');
  if (!repo) {
    throw new Error(`Repo with code ${repoCode} not found`);
  }

  for (const dep of repo.dependencies) {
    const vulns = await fetchVulnerabilities(dep.ecosystem, dep.dependencyName, dep.dependencyVersion);

    const formattedVulns = vulns.map(vuln => {
      let severity = 'UNKNOWN';
      if (vuln) {
        severity = vuln.database_specific?.severity || vuln.ecosystem_specific?.severity;
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

    dep.vulnerabilities = formattedVulns;
    dep.scannedAt = new Date();
    await dep.save();
  }

  repo.lastScanned = new Date();
  await repo.save();

  return repo;
}

const getVulnerablityOverview = async (req, res) => {
  try{
    const {repoCode} = req.params;
    const repo = await Repo.findOne({ repoCode }).populate('dependencies');
    if (!repo) {
      throw new Error(`Repo with code ${repoCode} not found`);
    }

    const dependencies = repo.dependencies;
    const vulnerabilityOverview = dependencies
      .filter(dep => dep?.vulnerabilities?.length > 0)
      .map(dep => ({
        dependencyName: dep.dependencyName,
        dependencyVersion: dep.dependencyVersion,
        vulnerabilities: dep.vulnerabilities,
        ecosystem: dep.ecosystem,
        scannedAt: dep.scannedAt
      }));

    res.json({message: 'Vulnerability overview retrieved successfully', vulnerabilityOverview}  );
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to get vulnerability overview' });
  }
}




module.exports = { scanRepoDependencies, getVulnerablityOverview };
