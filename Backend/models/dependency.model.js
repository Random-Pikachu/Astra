const mongoose = require("mongoose");
const { generateRandomCode } = require("../utils/randomCode");

// References schema
const referenceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

// Affected package schema
const affectedSchema = new mongoose.Schema(
  {
    package: {
      name: { type: String, required: true },
      ecosystem: { type: String, required: true },
    },
    versions: [String],
    ecosystem_specific: {
      severity: { type: String },
    },
  },
  { _id: false }
);

// Vulnerability schema aligned with OSV query-by-version response
const vulnerabilitySchema = new mongoose.Schema(
  {
    vulnerabilityId: { type: String, required: true }, // maps to "id"
    summary: { type: String, required: true },
    details: { type: String, required: true },
    severity: { type: String, default: "UNKNOWN" }, // extracted from affected
    references: [referenceSchema],
    affected: [affectedSchema],
    publishedAt: { type: Date, required: true },
    modifiedAt: { type: Date },
  },
  { _id: false }
);

// Dependency schema
const dependencySchema = new mongoose.Schema({
  repoCode: {
    type: String,
    required: true,
  },
  scanCode: {
    type: String,
    // required: true,
    unique: true,
    default: () => generateRandomCode({ prefix: "scan-" }),
  },
  scannedAt: { type: Date, default: Date.now },
  ecosystem: { type: String, required: true }, // Add ecosystem field back
  dependencyName: { type: String, required: true },
  dependencyVersion: { type: String, required: true },
  vulnerabilities: [vulnerabilitySchema],
  dependencyCode: {
    type: String,
    // required: true,
    unique: true,
    default: () => generateRandomCode({ prefix: "dependency-" }),
  },
});

module.exports = mongoose.model("Dependency", dependencySchema);
