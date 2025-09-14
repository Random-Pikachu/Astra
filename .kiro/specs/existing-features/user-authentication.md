# User Authentication System

**Implementation Date**: August 16-20, 2025  
**Status**: ✅ Completed  
**Files**: `Backend/config/passport.js`, `Backend/models/user.model.js`, `Backend/routes/auth.route.js`

## Overview

Dual authentication system supporting both Google OAuth and local username/password authentication with secure session management.

## Requirements (Retroactive Documentation)

### Requirement 1: Google OAuth Authentication
**User Story**: As a user, I want to sign in with my Google account, so that I can quickly access the application without creating a new password.

#### Acceptance Criteria
1. WHEN user clicks "Sign in with Google" THEN system SHALL redirect to Google OAuth consent screen
2. WHEN user grants permission THEN system SHALL create or retrieve user account using Google ID
3. WHEN authentication succeeds THEN system SHALL establish secure session and redirect to dashboard
4. IF user denies permission THEN system SHALL display appropriate error message

### Requirement 2: Local Authentication  
**User Story**: As a user, I want to create an account with username and password, so that I can use the application without relying on third-party services.

#### Acceptance Criteria
1. WHEN user provides valid email and password THEN system SHALL create new user account
2. WHEN user logs in with correct credentials THEN system SHALL authenticate and create session
3. WHEN password is provided THEN system SHALL hash password using bcrypt before storage
4. IF credentials are invalid THEN system SHALL return appropriate error message

### Requirement 3: Session Management
**User Story**: As a user, I want my login session to persist across browser sessions, so that I don't need to re-authenticate frequently.

#### Acceptance Criteria
1. WHEN user authenticates successfully THEN system SHALL create persistent session
2. WHEN user returns to application THEN system SHALL validate existing session
3. WHEN user logs out THEN system SHALL destroy session and clear authentication state
4. WHEN session expires THEN system SHALL redirect user to login page

## Implementation Details

### Database Schema
```javascript
const UserSchema = new mongoose.Schema({
  googleId: String,                    // For Google OAuth users
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: String,                    // For local auth users (hashed)
  userCode: {                         // Unique identifier
    type: String,
    required: true,
    unique: true,
    default: () => generateRandomCode({ prefix: 'user-' })
  },
  createdAt: { type: Date, default: Date.now }
});
```

### Authentication Strategies

#### Google OAuth Strategy
- **Provider**: Google OAuth 2.0
- **Scope**: Profile and email information
- **Callback**: `/auth/google/callback`
- **Session**: Passport.js session serialization

#### Local Strategy  
- **Fields**: Username/email and password
- **Validation**: bcrypt password comparison
- **Security**: Password hashing with salt rounds

### API Endpoints

#### Authentication Routes
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback
- `POST /auth/login` - Local authentication
- `POST /auth/signup` - User registration
- `POST /auth/logout` - Session termination
- `GET /auth/user` - Get current user info

### Security Features

#### Password Security
- **Hashing**: bcrypt with configurable salt rounds
- **Validation**: Minimum length and complexity requirements
- **Storage**: Never store plain text passwords

#### Session Security
- **Secret**: Configurable session secret
- **Storage**: Express-session with secure configuration
- **Expiration**: Configurable session timeout

#### Input Validation
- **Email**: Format validation and sanitization
- **Password**: Strength requirements
- **Username**: Character restrictions and uniqueness

## Frontend Integration

### Authentication Context
```typescript
// Frontend/src/contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication state management
};
```

### Protected Routes
- **Implementation**: `ProtectedRoute` component wrapper
- **Behavior**: Redirects unauthenticated users to login
- **State**: Integrates with Redux for user state management

### Login/Signup Pages
- **Design**: Modern UI with form validation
- **Features**: Real-time validation feedback
- **OAuth**: Google sign-in button integration
- **Error Handling**: User-friendly error messages

## Current Status

### ✅ Implemented Features
- Google OAuth 2.0 integration
- Local username/password authentication  
- Secure password hashing with bcrypt
- Session management with Passport.js
- User registration and login flows
- Protected route system
- Authentication state management
- User profile context

### 🔄 Potential Improvements
- **Two-Factor Authentication**: Add TOTP or SMS verification
- **Password Reset**: Email-based password recovery
- **Account Verification**: Email verification for new accounts
- **Social Logins**: Additional providers (GitHub, Microsoft)
- **Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Track authentication events

### 🐛 Known Issues
- None currently identified

## Testing Considerations

### Manual Testing Completed
- ✅ Google OAuth flow end-to-end
- ✅ Local registration and login
- ✅ Session persistence across browser restarts
- ✅ Logout functionality
- ✅ Protected route access control

### Automated Testing Needed
- Unit tests for authentication utilities
- Integration tests for auth endpoints
- E2E tests for complete authentication flows
- Security testing for common vulnerabilities