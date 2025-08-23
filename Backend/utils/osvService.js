// services/osvService.js
const axios = require('axios');

const OSV_API_URL = 'https://api.osv.dev/v1/query';

async function fetchVulnerabilities(ecosystem, packageName, version) {
    try {
        const response = await axios.post(OSV_API_URL, {
            package: {
                ecosystem,
                name: packageName,
            },
            version,
        });

        return response.data.vulns || []; 
    } catch (error) {
        console.error(`Error fetching vulnerabilities for ${packageName}@${version}:`, error.message);
        return [];
    }
}

module.exports = { fetchVulnerabilities };
