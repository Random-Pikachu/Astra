const Repo = require('../models/repo.model');
const Dependency = require('../models/dependency.model');
const { scanDependencyDetails } = require('../utils/saveRepo'); // Import the new function

async function scanRepoDependencies(repoCode) {
  console.log(`🚀 Starting dependency scanning for repo: ${repoCode}`);
  
  try {
    // Use the new efficient scanning approach
    const result = await scanDependencyDetails(repoCode);
    
    console.log(`✅ Scanning completed successfully:`);
    console.log(`   - Total dependencies: ${result.total}`);
    console.log(`   - Successfully processed: ${result.processed}`);
    console.log(`   - Errors: ${result.errors}`);
    
    // Return the repo with updated dependencies
    const repo = await Repo.findOne({ repoCode }).populate('dependencies');
    return repo;
    
  } catch (error) {
    console.error(`❌ Failed to scan dependencies for repo ${repoCode}:`, error.message);
    throw error;
  }
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
        _id: dep._id,
        dependencyCode: dep.dependencyCode,
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


const getVulnerablityDetails = async (req, res) => {
  try{
    const {repoCode, dependencyCode} = req.params;
    const repo = await Repo.findOne({ repoCode }).populate('dependencies');
    if (!repo) {
      throw new Error(`Repo with code ${repoCode} not found`);
    }
    const dependency = repo.dependencies.find(dep => dep.dependencyCode === dependencyCode);
    if (!dependency) {
      throw new Error(`Dependency with code ${dependencyCode} not found`);
    }

    // Filter out unwanted fields from dependency and vulnerabilities
    const filteredDependency = {
      repoCode: dependency.repoCode,
      ecosystem: dependency.ecosystem,
      dependencyName: dependency.dependencyName,
      dependencyVersion: dependency.dependencyVersion,
      dependencyCode: dependency.dependencyCode,
      vulnerabilities: dependency.vulnerabilities.map(vuln => ({
        vulnerabilityId: vuln.vulnerabilityId,
        summary: vuln.summary,
        details: vuln.details,
        severity: vuln.severity,
        references: vuln.references
      }))
    };

    res.json({message: 'Vulnerability details retrieved successfully', dependency: filteredDependency});

    
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to get vulnerability details' });
  }
}


module.exports = { scanRepoDependencies, getVulnerablityOverview, getVulnerablityDetails };
