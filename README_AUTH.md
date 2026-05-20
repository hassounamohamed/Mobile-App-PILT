# 🚀 Mobile App - Authentication System

> A **pixel-perfect, production-ready** React Native/Expo authentication system compatible with the FlowPilot platform.

## Overview

This project includes a complete authentication system with 4 screens, reusable UI components, state management, and API integration. Everything is built with TypeScript, Zustand, and React Native Reanimated for smooth animations.

### ✨ Key Features

- ✅ **4 Complete Screens**: Login, Register, Forgot Password, Select Role
- ✅ **Beautiful UI**: Pixel-perfect FlowPilot platform design
- ✅ **Form Validation**: Real-time validation with error messaging
- ✅ **State Management**: Zustand with AsyncStorage persistence
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Animations**: Smooth transitions with Reanimated
- ✅ **Security**: Token-based authentication with refresh mechanism
- ✅ **Documentation**: Comprehensive guides and examples

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install
npx expo install @react-native-async-storage/async-storage
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Update `.env.local`:

```
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

### 3. Start Development Server

```bash
npm start
```

### 4. Run on Device

```bash
npm run ios          # iOS Simulator
npm run android      # Android Emulator
npm run web          # Web Browser
```

## 📁 Project Structure

```
src/
├── features/auth/          # Authentication system
│   ├── api.ts             # API calls
│   ├── store.ts           # Zustand store
│   ├── hooks.ts           # Custom hooks
│   └── screens/           # 4 auth screens
│
├── components/ui/         # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── TextInputField.tsx
│   ├── RadioButton.tsx
│   └── ...
│
├── constants/             # Colors, sizes, roles
├── types/                 # TypeScript types
└── lib/                   # Utilities (animations, theme)

app/
├── (auth)/               # Auth routes
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── select-role.tsx
└── (tabs)/               # Main app (existing)
```

## 🎨 Design System

**Colors** (from FlowPilot Platform):

- Primary: `#0066FF` (Bright Blue)
- Background: `#0F1319` (Dark)
- Text: `#FFFFFF` (White)
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)

**Spacing**: 4px, 8px, 12px, 16px, 24px, 32px

**Components**: Button, Card, TextInput, RadioButton, Checkbox, SocialButton

## 📚 Documentation

- **[AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)** - System architecture & API docs
- **[SETUP.md](./SETUP.md)** - Setup & configuration guide
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Code examples
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete implementation details

## 🔧 Using the Authentication System

### Login Example

```typescript
import { useAuth } from '@/features/auth';

export function MyComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigate to home
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Button
      label="Sign In"
      onPress={handleLogin}
      loading={isLoading}
    />
  );
}
```

### Check Authentication

```typescript
import { useIsAuthenticated, useUser } from '@/features/auth';

export function StatusBar() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  return (
    <Text>
      {isAuthenticated ? `Welcome, ${user?.fullName}` : 'Please login'}
    </Text>
  );
}
```

## 🛠 Technologies

| Tech         | Purpose            |
| ------------ | ------------------ |
| Expo Router  | Navigation         |
| Zustand      | State Management   |
| Axios        | HTTP Client        |
| AsyncStorage | Persistent Storage |
| NativeWind   | Tailwind CSS       |
| Reanimated   | Animations         |
| TypeScript   | Type Safety        |

## 📱 Screens

### 1. Login Screen

- Email & password input
- Remember me checkbox
- Forgot password link
- Google & GitHub login buttons
- Sign up link

### 2. Register Screen

- Full name, email, phone input
- Role selection grid (Dev, QA, PO, Scrum)
- Password validation
- Terms agreement
- Social login options

### 3. Forgot Password Screen

- Email input
- Success confirmation
- Back to login option
- Resend option

### 4. Select Role Screen

- Role selection (after OAuth)
- Continue button
- Role descriptions

## 🔐 Security

- Token-based authentication
- Secure token storage (AsyncStorage)
- Automatic token refresh
- Password strength validation
- Input sanitization
- Error handling

## 🚀 Deployment

The app is ready for:

- ✅ iOS (build with `eas build --platform ios`)
- ✅ Android (build with `eas build --platform android`)
- ✅ Web (run with `npm run web`)

## 📋 Checklist

Before deploying:

- [ ] Configure backend API endpoints
- [ ] Set up OAuth apps (Google, GitHub)
- [ ] Update environment variables
- [ ] Test all authentication flows
- [ ] Verify error handling
- [ ] Check form validation
- [ ] Test persistent login
- [ ] Verify logout functionality

## 🤝 Backend Integration

You need to implement these endpoints:

```
POST /auth/login
POST /auth/register
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/refresh
POST /auth/google
POST /auth/github
```

See [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for details.

## 🐛 Troubleshooting

**AsyncStorage not persisting?**

- Ensure `@react-native-async-storage/async-storage` is installed
- Check device/emulator storage settings

**API errors?**

- Verify `EXPO_PUBLIC_API_URL` in `.env.local`
- Check backend is running and accessible
- Look at network tab in dev tools

**Navigation issues?**

- Ensure routes exist in `app/(auth)/`
- Check `app/_layout.tsx` configuration
- Verify `useIsAuthenticated()` logic

## 📖 Learn More

- [Expo Router Docs](https://expo.dev/routing)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Docs](https://www.typescriptlang.org)

## 📞 Support

For questions or issues:

1. Check the documentation files
2. Review code examples in USAGE_EXAMPLES.md
3. Check the component implementations in `src/`
4. Review API configuration in `src/features/auth/api.ts`

## 📄 License

This project is part of the FlowPilot platform integration.

---

**Ready to start?** 👉 Read [SETUP.md](./SETUP.md) for detailed instructions!
