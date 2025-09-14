# Project Context and Standards

## Project Overview

**Project Name**: Vulnerability Scanner & Repository Management System  
**Project Start**: August 16, 2025  
**Kiro Integration**: September 14, 2025  
**Architecture**: Full-stack web application with Electron desktop support

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Google OAuth + Local)
- **Real-time**: Socket.io for live updates
- **Security**: bcrypt for password hashing
- **External APIs**: OSV.dev for vulnerability data

### Frontend  
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Desktop**: Electron for cross-platform app
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Material-UI icons, HeroUI components
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization

## Core Functionality

### Repository Management
- Scan local directories for supported package managers
- Support for npm, pip, composer, ruby gems, rust cargo
- Track repository metadata and scanning history
- Real-time scanning progress with Socket.io

### Vulnerability Analysis  
- Integration with OSV.dev API for security data
- Dependency version checking against vulnerability databases
- Severity classification (Critical, High, Medium, Low)
- Detailed vulnerability reports with references

### User Experience
- Modern dark theme with custom CSS variables
- Responsive design for desktop and web
- Real-time notifications and progress tracking
- Interactive data visualizations and treemaps

## Development Standards

### Code Organization
- **Backend**: MVC pattern with controllers, models, routes, utils
- **Frontend**: Component-based architecture with hooks and contexts
- **Database**: Mongoose schemas with proper validation
- **API**: RESTful endpoints with consistent error handling

### Security Practices
- Environment variables for sensitive configuration
- Password hashing with bcrypt
- Session management with express-session
- Input validation and sanitization
- CORS configuration for cross-origin requests

### Performance Considerations
- Efficient dependency scanning with file system optimization
- Caching strategies for vulnerability data
- Optimized database queries with proper indexing
- Real-time updates without polling overhead

## File Structure Patterns

### Backend Structure
```
Backend/
├── config/          # Passport and other configurations
├── controllers/     # Request handlers and business logic
├── db/             # Database connection utilities
├── models/         # Mongoose schemas and models
├── routes/         # Express route definitions
├── utils/          # Helper functions and services
└── index.js        # Application entry point
```

### Frontend Structure  
```
Frontend/
├── src/
│   ├── components/  # Reusable UI components
│   ├── contexts/    # React contexts for state
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Route-level components
│   ├── services/    # API service layer
│   └── store/       # Redux store configuration
├── electron/        # Electron main and preload scripts
└── public/          # Static assets
```

## Naming Conventions

### Variables and Functions
- **camelCase** for JavaScript/TypeScript variables and functions
- **PascalCase** for React components and classes
- **kebab-case** for file names and directories
- **UPPER_SNAKE_CASE** for constants and environment variables

### Database Fields
- **camelCase** for MongoDB field names
- **Code suffix** for unique identifiers (userCode, repoCode, etc.)
- **Timestamps** using standard Date objects with descriptive names

### API Endpoints
- **RESTful** patterns: GET /api/repos, POST /api/repos/store-directory
- **Descriptive** action names: /scan-dependencies, /fix-vulnerabilities
- **Consistent** error response format with message and error fields

## Integration Guidelines

When adding new features:

1. **Follow existing patterns** for file organization and naming
2. **Use established utilities** like randomCode generation and socket events  
3. **Maintain consistency** with the current UI design system
4. **Add proper error handling** and user feedback mechanisms
5. **Consider real-time updates** where appropriate using Socket.io
6. **Follow security practices** for data validation and authentication