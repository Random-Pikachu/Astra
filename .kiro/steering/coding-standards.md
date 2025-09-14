# Coding Standards and Best Practices

## Code Quality Guidelines

### JavaScript/TypeScript Standards

#### Variable Declarations
- Use `const` by default, `let` when reassignment is needed
- Avoid `var` declarations
- Use descriptive variable names that explain purpose
- Group related variables together

```javascript
// Good
const userRepository = new UserRepository();
const scanResults = await vulnerabilityScanner.scan(dependencies);

// Avoid
var x = new UserRepository();
let results = await scanner.scan(deps);
```

#### Function Design
- Keep functions small and focused on single responsibility
- Use async/await instead of Promise chains
- Include proper error handling with try/catch blocks
- Add JSDoc comments for complex functions

```javascript
/**
 * Scans repository for dependency vulnerabilities
 * @param {string} repoPath - Path to repository
 * @param {string} userCode - User identifier
 * @returns {Promise<ScanResult>} Scan results with vulnerabilities
 */
async function scanRepositoryVulnerabilities(repoPath, userCode) {
  try {
    const manifests = findManifestFiles(repoPath);
    return await processVulnerabilities(manifests);
  } catch (error) {
    logger.error('Repository scan failed:', error);
    throw new Error(`Scan failed: ${error.message}`);
  }
}
```

### React Component Standards

#### Component Structure
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Keep components focused and reusable
- Use custom hooks for complex state logic

```typescript
interface DashboardProps {
  userCode: string;
  onRepositoryAdd: (repo: Repository) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userCode, onRepositoryAdd }) => {
  const { repositories, loading, error } = useRepositories(userCode);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="dashboard-container">
      {/* Component content */}
    </div>
  );
};
```

#### State Management
- Use Redux Toolkit for global state
- Keep local state with useState for component-specific data
- Use useEffect with proper dependency arrays
- Implement proper cleanup for subscriptions

### Database and API Standards

#### Mongoose Schema Design
- Use proper validation and required fields
- Implement default values where appropriate
- Add indexes for frequently queried fields
- Use consistent naming with camelCase

```javascript
const dependencySchema = new mongoose.Schema({
  repoCode: {
    type: String,
    required: true,
    index: true
  },
  dependencyName: {
    type: String,
    required: true,
    trim: true
  },
  vulnerabilities: [vulnerabilitySchema],
  scannedAt: {
    type: Date,
    default: Date.now
  }
});
```

#### API Response Format
- Use consistent response structure
- Include proper HTTP status codes
- Provide meaningful error messages
- Add request/response logging

```javascript
// Success Response
{
  message: "Operation completed successfully",
  data: { /* response data */ },
  timestamp: "2025-09-14T10:30:00Z"
}

// Error Response  
{
  error: "Descriptive error message",
  code: "ERROR_CODE",
  details: { /* additional error context */ }
}
```

## Security Standards

### Input Validation
- Validate all user inputs on both client and server
- Sanitize data before database operations
- Use parameterized queries to prevent injection
- Implement rate limiting for API endpoints

### Authentication & Authorization
- Use secure session management
- Implement proper password hashing with bcrypt
- Validate user permissions for all operations
- Use HTTPS in production environments

### Environment Configuration
- Store sensitive data in environment variables
- Use different configurations for development/production
- Never commit secrets to version control
- Implement proper secret rotation strategies

## Performance Guidelines

### Database Optimization
- Use appropriate indexes for query patterns
- Implement pagination for large result sets
- Use aggregation pipelines for complex queries
- Monitor query performance and optimize slow operations

### Frontend Performance
- Implement code splitting for large applications
- Use React.memo for expensive component renders
- Optimize bundle size with proper imports
- Implement proper loading states and error boundaries

### Real-time Features
- Use Socket.io efficiently with proper event handling
- Implement connection management and reconnection logic
- Avoid excessive event emissions
- Use rooms/namespaces for targeted updates

## Testing Standards

### Unit Testing
- Write tests for utility functions and business logic
- Mock external dependencies and APIs
- Use descriptive test names that explain behavior
- Aim for good test coverage on critical paths

### Integration Testing
- Test API endpoints with proper request/response validation
- Test database operations with test databases
- Verify authentication and authorization flows
- Test error handling scenarios

## Documentation Standards

### Code Documentation
- Add JSDoc comments for public functions and classes
- Document complex algorithms and business logic
- Include usage examples for utility functions
- Keep documentation up-to-date with code changes

### API Documentation
- Document all endpoints with request/response examples
- Include authentication requirements
- Specify error codes and their meanings
- Provide integration examples for common use cases

## Git and Version Control

### Commit Standards
- Use descriptive commit messages with clear intent
- Follow conventional commit format when possible
- Keep commits focused on single changes
- Include issue references where applicable

### Branch Management
- Use feature branches for new development
- Keep main branch stable and deployable
- Use pull requests for code review
- Delete merged branches to keep repository clean

## Error Handling Patterns

### Backend Error Handling
```javascript
// Controller level error handling
exports.scanRepository = async (req, res) => {
  try {
    const result = await repositoryService.scan(req.body);
    res.json({ message: 'Scan completed', data: result });
  } catch (error) {
    logger.error('Repository scan failed:', error);
    res.status(500).json({ 
      error: 'Scan failed', 
      details: error.message 
    });
  }
};
```

### Frontend Error Handling
```typescript
// Component level error handling
const [error, setError] = useState<string | null>(null);

const handleRepositoryAdd = async (repoData: RepositoryData) => {
  try {
    setError(null);
    await apiService.addRepository(repoData);
    // Handle success
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};
```