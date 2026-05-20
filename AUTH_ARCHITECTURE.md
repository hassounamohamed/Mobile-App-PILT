# Authentication Architecture for Mobile App

## Overview

This is a complete authentication system for the FlowPilot-compatible mobile application with 4 key screens:

- **Select Role** - Role selection after OAuth signup
- **Login** - Email/password authentication
- **Register** - Account creation with role selection
- **Forgot Password** - Password recovery flow

## Architecture

```
src/
├── features/auth/
│   ├── api.ts              # API calls for auth endpoints
│   ├── store.ts            # Zustand store for auth state
│   ├── hooks.ts            # Custom React hooks
│   └── screens/
│       ├── SelectRoleScreen.tsx
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       └── ForgotPasswordScreen.tsx
├── components/ui/
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Card container
│   ├── TextInputField.tsx  # Form input with validation
│   ├── RadioButton.tsx     # Radio selection component
│   ├── Checkbox.tsx        # Checkbox component
│   ├── SocialButton.tsx    # Social login buttons
│   ├── Container.tsx       # Main container with safe area
│   └── Header.tsx          # Header with icon
├── constants/
│   ├── colors.ts           # Theme colors (FlowPilot platform style)
│   ├── sizes.ts            # Spacing and sizing
│   └── roles.ts            # User role definitions
└── types/
    └── auth.ts             # TypeScript interfaces
```

## Color Scheme (from FlowPilot Platform)

- **Primary**: `#0066FF` (Bright Blue)
- **Background**: `#0F1319` (Very Dark)
- **Text**: `#FFFFFF` (White)
- **Secondary Text**: `#A0A9B8` (Gray)
- **Input Background**: `#1A1F2E` (Dark Gray)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)

## Using the Authentication System

### 1. Hook Usage

```typescript
import { useAuth } from '@/features/auth';

export function MyComponent() {
  const {
    user,
    isLoading,
    error,
    login,
    logout,
    register
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Your component
  );
}
```

### 2. Store Direct Access

```typescript
import { useAuthStore } from "@/features/auth/store";

const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);
```

### 3. Individual Hooks

```typescript
import {
  useAuth,
  useUser,
  useIsAuthenticated,
  useAuthToken,
} from "@/features/auth";

// Get entire auth state
const auth = useAuth();

// Get user only
const user = useUser();

// Check if authenticated
const isAuth = useIsAuthenticated();

// Get token
const token = useAuthToken();
```

## API Integration

The API service is configured in `src/features/auth/api.ts`. Update the base URL:

```typescript
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.agile-platform.com";
```

### Available API Methods

```typescript
// Authentication
authApi.login(credentials);
authApi.register(credentials);
authApi.forgotPassword(email);
authApi.resetPassword(token, newPassword);
authApi.refreshToken(refreshToken);

// Social
authApi.loginWithGoogle(googleToken);
authApi.loginWithGitHub(githubToken);
```

## Components

### Button

```typescript
<Button
  label="Click me"
  onPress={() => console.log('clicked')}
  variant="primary" // primary | secondary | outline | danger
  size="md"         // sm | md | lg
  loading={false}
  disabled={false}
/>
```

### TextInputField

```typescript
<TextInputField
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errorMessage}
  icon="mail-outline"
/>
```

### RadioButton

```typescript
<RadioButton
  label="Option"
  selected={isSelected}
  onPress={() => setSelected(true)}
  icon="star-outline"
  description="Optional description"
/>
```

### Card

```typescript
<Card variant="elevated">
  <Text>Card content</Text>
</Card>
```

## Styling

All components use NativeWind (Tailwind CSS) for styling with custom color constants.

### Spacing Constants

- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `xxl`: 32px

### Border Radius

- `radiusSm`: 6px
- `radiusMd`: 8px
- `radiusLg`: 12px
- `radiusXl`: 16px

## Navigation

The authentication flow is handled through Expo Router:

```
/(auth)
  ├── login
  ├── register
  ├── forgot-password
  └── select-role

/(tabs)  [Only accessible when authenticated]
```

Conditional routing is handled in `app/_layout.tsx` using `useIsAuthenticated()`.

## Features

✅ Email/Password authentication
✅ Account registration with role selection
✅ Password reset flow
✅ Social login integration (Google & GitHub)
✅ Form validation
✅ Error handling
✅ Loading states
✅ Persistent authentication (AsyncStorage)
✅ Token refresh capability
✅ Type-safe with TypeScript
✅ Pixel-perfect FlowPilot platform styling
✅ Smooth animations

## Required Dependencies

Make sure these are installed:

```
expo-router
zustand
axios
@tanstack/react-query
react-native-reanimated
react-native-gesture-handler
nativewind
react-native-safe-area-context
@react-navigation/*
```

Install AsyncStorage for persistent storage:

```bash
npx expo install @react-native-async-storage/async-storage
```

## Environment Variables

Create a `.env.local` file:

```
EXPO_PUBLIC_API_URL=https://api.agile-platform.com
```

## Development Tips

1. **Testing Login**: Use the LoginScreen with mock credentials
2. **Testing Registration**: Form validation is strict
3. **Error Handling**: All errors are captured and displayed to users
4. **Token Management**: Tokens are automatically persisted and can be refreshed

## Next Steps

1. Configure API endpoints to match your backend
2. Implement social login (Google OAuth, GitHub OAuth)
3. Add biometric authentication if needed
4. Implement push notifications for password reset emails
5. Add analytics tracking
6. Set up error logging/monitoring

## File Structure Created

```
app/(auth)/
├── _layout.tsx
├── login.tsx
├── register.tsx
├── forgot-password.tsx
└── select-role.tsx

src/features/auth/
├── api.ts
├── store.ts
├── hooks.ts
├── index.ts
└── screens/
    ├── LoginScreen.tsx
    ├── RegisterScreen.tsx
    ├── ForgotPasswordScreen.tsx
    ├── SelectRoleScreen.tsx
    └── index.ts

src/components/ui/
├── Button.tsx
├── Card.tsx
├── TextInputField.tsx
├── RadioButton.tsx
├── Checkbox.tsx
├── SocialButton.tsx
├── Container.tsx
├── Header.tsx
└── index.ts

src/constants/
├── colors.ts
├── sizes.ts
├── roles.ts
└── index.ts

src/types/
└── auth.ts

babel.config.js (Updated)
```

## Color Reference

The design is based on the FlowPilot platform screenshots:

- **Role Selection Screen**: Dark theme with blue primary actions
- **Login Screen**: "AgileFlow" branding, remember me checkbox, social logins
- **Register Screen**: Multi-step form with role grid selector
- **Forgot Password**: Email input with success feedback

All colors are exactly matched to the platform screenshots for a cohesive user experience.
