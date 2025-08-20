const mongoose = require('mongoose');
const { generateRandomCode } = require('../utils/randomCode');

const repoSchema = new mongoose.Schema({
    userCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    repoCode: {
        type: String,
        required: true,
        unique: true,
        default: () =>
            generateRandomCode({
                prefix: 'repo-'
            })
    },
    name: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    status: { 
        type: String, 
        enum: ["active", "deleted", "moved"], 
        default: "active" 
    },
    packageManagers: [
        {
          ecosystem: String,        // e.g., "npm", "pip"
          packageFile: String,      // e.g., package.json
          dependenciesCount: Number
        }
    ],
    lastScanned: Date,
})

module.exports = mongoose.model('Repo', repoSchema);