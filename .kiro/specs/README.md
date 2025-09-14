# Specs Directory

This directory contains feature specifications for the Vulnerability Scanner project. Each spec follows the structured approach of Requirements → Design → Tasks.

## Existing Features (Documented Retroactively)

Based on the codebase analysis, the following features have been implemented:

### Core Features
- **User Authentication System** - Google OAuth and local authentication
- **Repository Management** - Add, scan, and manage code repositories  
- **Dependency Scanning** - Automatic detection of package manifests (npm, pip, etc.)
- **Vulnerability Detection** - Integration with OSV.dev API for security analysis
- **Real-time Updates** - Socket.io for live scanning progress
- **Dashboard Interface** - Modern React UI with repository overview
- **Statistics & Analytics** - Vulnerability metrics and treemap visualizations

## Project Timeline

**Project Start Date**: August 16, 2025
**Kiro Integration**: September 14, 2025

## Spec Creation Guidelines

When creating new specs, follow the standard workflow:
1. **Requirements** - User stories and acceptance criteria in EARS format
2. **Design** - Architecture, components, and technical decisions  
3. **Tasks** - Implementation checklist with specific coding tasks

Each spec should be in its own subdirectory: `.kiro/specs/{feature-name}/`