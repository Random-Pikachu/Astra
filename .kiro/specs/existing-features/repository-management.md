# Repository Management System

**Implementation Date**: August 20-25, 2025  
**Status**: ✅ Completed  
**Files**: `Backend/utils/repoScaner.js`, `Backend/controllers/repo.controller.js`, `Backend/models/repo.model.js`

## Overview

Comprehensive system for scanning, managing, and tracking code repositories with automatic package manager detection and dependency analysis.

## Requirements (Retroactive Documentation)

### Requirement 1: Repository Scanning
**User Story**: As a developer, I want to add my code repositories to the system, so that I can track their dependencies and vulnerabilities.

#### Acceptance Criteria
1. WHEN user provides repository path THEN system SHALL scan directory for supported package managers
2. WHEN manifest files are found THEN system SHALL extract dependency information
3. WHEN scanning completes THEN system SHALL store repository metadata in database
4. IF no manifests found THEN system SHALL return appropriate error message

### Requirement 2: Package Manager Support
**User Story**: As a developer working with multiple technologies, I want the system to support various package managers, so that I can scan repositories regardless of technology stack.

#### Acceptance Criteria
1. WHEN repository contains package.json THEN system SHALL detect npm ecosystem
2. WHEN repository contains requirements.txt OR pyproject.toml OR Pipfile THEN system SHALL detect pip ecosystem
3. WHEN repository contains composer.json THEN system SHALL detect PHP ecosystem
4. WHEN repository contains Gemfile THEN system SHALL detect Ruby ecosystem
5. WHEN repository contains Cargo.toml THEN system SHALL detect Rust ecosystem

### Requirement 3: Repository Management
**User Story**: As a user, I want to view and manage my repositories, so that I can organize my projects and remove outdated ones.

#### Acceptance Criteria
1. WHEN user accesses dashboard THEN system SHALL display list of user's repositories
2. WHEN user clicks repository THEN system SHALL show detailed dependency information
3. WHEN user deletes repository THEN system SHALL remove repository and associated data
4. WHEN user rescans repository THEN system SHALL update dependency information

## Implementation Details

### Database Schema
```javascript
const repoSchema = new mongoose.Schema({
  userCode: { type: String, required: true },
  repoCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateRandomCode({ prefix: 'repo-' })
  },
  name: { type: String, required: true },
  path: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["active", "deleted", "moved"], 
    default: "active" 
  },
  packageManagers: [{
    ecosystem: String,
    packageFile: String,
    dependenciesCount: Number
  }],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dependency" }],
  lastScanned: Date
});
```

### Scanning Algorithm

#### Directory Traversal
```javascript
function findManifestFiles(dir) {
  const SUPPORTED_MANIFESTS = {
    "package.json": "npm",
    "requirements.txt": "pip", 
    "pyproject.toml": "pip",
    "Pipfile": "pip",
    "composer.json": "php",
    "Gemfile": "ruby",
    "Cargo.toml": "rust"
  };
  
  const IGNORED_DIRS = new Set([
    "node_modules", "venv", ".venv", "env", 
    ".git", "dist", "build", ".cache"
  ]);
  
  // Recursive directory walking with ignore patterns
}
```

#### Dependency Extraction
- **npm**: Parses package.json for dependencies and devDependencies
- **pip**: Reads requirements.txt line by line
- **composer**: Extracts from composer.json require section
- **ruby**: Processes Gemfile syntax
- **rust**: Parses Cargo.toml dependencies

### API Endpoints

#### Repository Operations
- `POST /api/repos/store-directory` - Add new repository
- `GET /api/repos/:userCode` - List user repositories
- `DELETE /api/repos/:userCode/:repoCode` - Remove repository
- `GET /api/repos/stats/:userCode` - Repository statistics

### Error Handling

#### File System Errors
- **Permission Issues**: Graceful handling of access denied
- **Path Validation**: Verify directory exists and is readable
- **Malformed Files**: Continue scanning if individual files fail

#### Data Validation
- **Path Sanitization**: Prevent directory traversal attacks
- **Input Validation**: Validate repository names and paths
- **Duplicate Detection**: Handle duplicate repository additions

## Frontend Integration

### Dashboard Interface
```typescript
// Frontend/src/pages/Dashboard.tsx
const Dashboard: React.FC = () => {
  const { repositories, loading, error } = useRepositories(userCode);
  
  const handleAddRepository = async (repositoryData: RepositoryData) => {
    await apiService.storeRepository(repositoryData);
    await fetchRepositories(); // Refresh list
  };
  
  return (
    <div className="dashboard">
      <RepositoryList repositories={repositories} />
      <AddRepositoryModal onAdd={handleAddRepository} />
    </div>
  );
};
```

### Repository Components
- **RepositoryCard**: Display repository information and actions
- **AddRepositoryModal**: Form for adding new repositories
- **RepositoryStats**: Show dependency counts and scan dates
- **ActionButtons**: Edit, delete, and rescan functionality

## Real-time Features

### Scanning Progress
- **Socket.io Events**: Real-time progress updates during scanning
- **Progress Indicators**: Visual feedback for long-running operations
- **Status Updates**: Live status changes (scanning, complete, error)

### Live Updates
- **Repository List**: Automatic refresh when repositories change
- **Dependency Counts**: Real-time updates as scanning progresses
- **Error Notifications**: Immediate feedback for scan failures

## Current Status

### ✅ Implemented Features
- Multi-ecosystem package manager support (npm, pip, composer, ruby, rust)
- Recursive directory scanning with intelligent ignore patterns
- Dependency extraction and counting
- Repository metadata storage and management
- User-specific repository isolation
- Real-time scanning progress via Socket.io
- Repository CRUD operations (Create, Read, Delete)
- Dashboard interface with repository cards
- Search and filtering capabilities
- Repository statistics and analytics

### 🔄 Potential Improvements
- **Git Integration**: Extract repository information from .git directory
- **Branch Support**: Track dependencies across different branches
- **Monorepo Support**: Handle repositories with multiple package managers
- **Dependency Graphs**: Visualize dependency relationships
- **Historical Tracking**: Track dependency changes over time
- **Batch Operations**: Bulk repository management actions

### 🐛 Known Issues
- **Large Repositories**: Performance impact on very large codebases
- **Symlinks**: May not properly handle symbolic links
- **Network Drives**: Potential issues with network-mounted directories

## Performance Considerations

### Optimization Strategies
- **Selective Scanning**: Skip known build/cache directories
- **Parallel Processing**: Concurrent manifest file processing
- **Caching**: Cache scan results to avoid redundant operations
- **Incremental Updates**: Only rescan changed files when possible

### Resource Management
- **Memory Usage**: Efficient file reading for large manifest files
- **CPU Usage**: Balanced scanning speed vs system responsiveness
- **Disk I/O**: Minimize file system operations through smart caching

## Security Considerations

### Path Security
- **Directory Traversal**: Prevent access to unauthorized directories
- **Path Validation**: Sanitize and validate all file paths
- **Permission Checks**: Verify read access before scanning

### Data Privacy
- **User Isolation**: Ensure users can only access their repositories
- **Sensitive Files**: Avoid scanning files that might contain secrets
- **Audit Trail**: Log repository access and modifications

## Testing Considerations

### Manual Testing Completed
- ✅ Repository scanning across all supported ecosystems
- ✅ Directory traversal with various folder structures
- ✅ Error handling for invalid paths and permissions
- ✅ Repository management operations (add, delete, rescan)
- ✅ Real-time progress updates during scanning

### Automated Testing Needed
- Unit tests for scanning algorithms
- Integration tests for repository operations
- Performance tests for large repositories
- Security tests for path validation
- E2E tests for complete repository workflows