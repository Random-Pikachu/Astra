// services/osvService.js
const axios = require('axios');

const OSV_API_URL = 'https://api.osv.dev/v1/query';

async function fetchVulnerabilities(ecosystem, packageName, version) {
    try {
        const response = await axios.post(OSV_API_URL, {
            package: {
                ecosystem:ecosystem,
                name: packageName,
            },
            version:version,
        });

        return response.data.vulns || []; 
    } catch (error) {
        return [];
    }
}

module.exports = { fetchVulnerabilities };
