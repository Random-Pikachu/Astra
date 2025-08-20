const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoId: { type: String, unique: true, required: true },
  name: String,
  path: String,
  status: { type: String, enum: ["active", "deleted", "moved"], default: "active" },
  packageManagers: [
    {
      ecosystem: String,
      packageFile: String,
      dependenciesCount: Number
    }
  ],
  lastScanned: Date
}, { timestamps: true });

module.exports = mongoose.model("Repo", RepoSchema);
