const Repo = require('../models/repo.model');
const Dependency = require('../models/dependency.model');
const { scanDependencyDetails } = require('../utils/saveRepo'); // Import the new function

async function scanRepoDependencies(repoCode) {
  
  try {

    const result = await scanDependencyDetails(repoCode);
    
    
    
    // Return the repo with updated dependencies
    const repo = await Repo.findOne({ repoCode }).populate('dependencies');
    return repo;
    
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to get vulnerability overview' });
  }
}


const getVulnerablityDetails = async (req, res) => {
  try {
    const { repoCode, dependencyCode } = req.params;
    const repo = await Repo.findOne({ repoCode }).populate('dependencies');
    if (!repo) {
      throw new Error(`Repo with code ${repoCode} not found`);
    }
    const dependency = repo.dependencies.find(dep => dep.dependencyCode === dependencyCode);
    if (!dependency) {
      throw new Error(`Dependency with code ${dependencyCode} not found`);
    }

    // Filter out unwanted fields from dependency and vulnerabilities, include locations
    const filteredDependency = {
      repoCode: dependency.repoCode,
      ecosystem: dependency.ecosystem,
      dependencyName: dependency.dependencyName,
      dependencyVersion: dependency.dependencyVersion,
      dependencyCode: dependency.dependencyCode,
      locations: Array.isArray(dependency.locations) ? dependency.locations : [],
      vulnerabilities: dependency.vulnerabilities.map(vuln => ({
        vulnerabilityId: vuln.vulnerabilityId,
        summary: vuln.summary,
        details: vuln.details,
        severity: vuln.severity,
        references: vuln.references
      }))
    };

    res.json({ message: 'Vulnerability details retrieved successfully', dependency: filteredDependency });

  } catch (err) {
    res.status(500).json({ error: 'Failed to get vulnerability details' });
  }
}

const getVulnerabilityStats = async (req, res) => {
  try{
    const {repoCode} = req.params;
    const repo = await Repo.findOne({repoCode}).select("name");
    if (!repo) {
      throw new Error(`Repo with code ${repoCode} not found`);
    }
    const dependencies = await Dependency.find({repoCode});
    const vulnerabilityStats = dependencies.map(dep => ({
      dependencyCode: dep.dependencyCode,
      dependencyName: dep.dependencyName,
      dependencyVersion: dep.dependencyVersion,
      severity: (() => {
        if (Array.isArray(dep.vulnerabilities) && dep.vulnerabilities.length > 0) {
          const severityOrder = { critical: 4, high: 3, medium: 2, moderate: 2, low: 1, unknown: 0 };
          const maxVuln = dep.vulnerabilities.reduce((max, curr) => {
            const currSev = (curr.severity || '').toLowerCase();
            const maxSev = (max.severity || '').toLowerCase();
            return (severityOrder[currSev] || 0) > (severityOrder[maxSev] || 0) ? curr : max;
          }, dep.vulnerabilities[0]);
          return maxVuln.severity || 'No Vulnerability';
        }
        return 'No Vulnerability';
      })(),
      vulnerabilitiesCount: dep.vulnerabilities.length
    }));
    res.json({message: 'Vulnerability stats retrieved successfully', vulnerabilityStats, repoName: repo.name});
  }catch(err){
    res.status(500).json({ error: 'Failed to get vulnerability stats' });
  }
}


module.exports = { scanRepoDependencies, getVulnerablityOverview, getVulnerablityDetails, getVulnerabilityStats };
