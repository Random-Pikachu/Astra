const mongoose = require('mongoose');
const { generateRandomCode } = require('../utils/randomCode');

const vulnerabilitySchema = new mongoose.Schema({
        vulnerabilityId: {
            type: String,
            required: true,
        },
        vulnerabilityName: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        references: {
            type: String,
            required: true,
        },
        publishedAt: {
            type: Date,
        required: true,
    },
})

const dependencySchema = new mongoose.Schema({
    repoCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repo',
        required: true,
    },
    scanCode: {
        type: String,
        required: true,
        unique: true,
        default: () =>
            generateRandomCode({
                prefix: 'scan-'
            })
    },
    scannedAt: {
        type: Date,
        default: Date.now,
    },
    ecosystem: {
        type: String,
        required: true,
    },
    dependencyName: { 
        type: String, 
        required: true,
    },
    dependencyVersion: {
        type: String,
        required: true,
    },
    vulnerabilities: [vulnerabilitySchema]
})

module.exports = mongoose.model('Dependency', dependencySchema);