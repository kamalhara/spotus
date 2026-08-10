# SpotUs - AI Agent Context & Repository Guidelines

This file serves as the core context for AI agents working on the `spot-us` codebase. It outlines the tech stack, app architecture, coding conventions, and deployment processes.

## App Overview

**SpotUs** is a React Native mobile application built with Expo. It is a location-based chat and community app where users can discover and join global or nearby rooms, chat in real-time, and share media.

## Tech Stack & Core Dependencies

- **Framework:** React Native + Expo (SDK ~54)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind (v4, Tailwind CSS for React Native) + Global CSS
- **Backend & Database:** Firebase (Firestore for real-time DB/chat, `geofire-common` for location querying)
- **Authentication:** Clerk (`@clerk/expo`)
- **Media Uploads:** Cloudinary (via custom upload script)
- **Mapping & Location:** `react-native-maps`, `react-native-map-clustering`, `expo-location`
- **Fonts:** Google Fonts via Expo (`Inter`, `Outfit`, `Plus Jakarta Sans`)

## Project Structure & Module Organization

- **`app/`**: Route screens using Expo Router conventions.
  - `app/(auth)`: Clerk authentication flows (Login, Sign up).
  - `app/(authenticated)/(tabs)`: Main bottom tab navigation.
  - `app/(authenticated)/rooms`: Room-specific screens and chat interfaces.
  - `app/(authenticated)/profile`: User profile management.
- **`components/`**: Shared UI and feature components organized by domain (`chat/`, `rooms/`, `home/`, `ui/`). Use `PascalCase` filenames for components.
- **`lib/`**: Core business logic and service integrations.
  - Includes: `createRoom.js`, `joinRoom.js`, `getNearbyRoom.js`, `syncUser.js`, `chatSeen.js`, `uploadCloudinary.js`, `location.js`.
- **`hook/`**: Custom reusable React hooks (`useSomething` naming convention).
- **`context/`**: React Context providers for global state (e.g., Theme, Auth State, Location State).
- **`config/`**: Setup and initialization for third-party services (Firebase, Clerk).
- **`constants/`**: App-wide constants, category metadata, theme colors.
- **`assets/images/`**: Static image assets.
- **`docs/legal/`**: Legal markdown content (Privacy Policy, Terms).

## Build, Test, and Development Commands

- **Install Dependencies:** `npm install`
- **Start Metro Bundler:** `npm start`
- **Run Native Builds:** `npm run ios` or `npm run android`
- **Run Web Target:** `npm run web`
- **Linting:** `npm run lint` (Uses `expo lint`, run before committing changes)

## Coding Style & Naming Conventions

1. **Components:** Use functional components with React Hooks. File names must be `PascalCase.jsx` or `.tsx` when exporting UI components.
2. **Styling:** Use NativeWind `className` prop. Rely on `tailwind.config.js` and `global.css` for design tokens instead of generic inline styles.
3. **Routing:** Follow Expo Router conventions (`[roomId].jsx` for dynamic segments, `_layout.jsx` for nested layouts).
4. **Abstraction:** Prefer existing helpers in `lib/`, hooks in `hook/`, and shared UI in `components/ui/` before creating new ones. Keep indentation at 2 spaces.

## Testing Guidelines

- No formal test framework (Jest/Detox) is currently configured.
- When adding tests in the future, place them near the relevant module or in a clear `__tests__` folder using `*.test.js(x)` naming.
- **Manual Verification:** Document manual tests in PRs. For behavior touching Firebase, Location, Navigation, or Notifications, verify loading states, error handling, and permission-denied scenarios (mock dependencies if possible).

## Database & Backend Rules (Firebase)

- All Firestore access must be governed by `firestore.rules`.
- Carefully review `firestore.rules` when modifying data structures for `users`, `rooms`, `chats`, or `reports` to ensure proper access control.
- Real-time location queries use `geofire-common` hashes.

## Security & Configuration

- **DO NOT** commit secrets, private keys, or `.env` files.
- Configuration relies on `.env` values such as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_FIREBASE_*`, and potentially Cloudinary secrets.
- Always use the `EXPO_PUBLIC_` prefix for variables needed on the client-side.

## Commit & Pull Request Guidelines

- Use **Conventional Commits** (e.g., `feat:`, `fix:`, `refactor:`, `chore:`).
- Keep commit subjects short, imperative, and descriptive.
- PRs must include a concise summary, linked issue numbers, screenshots/recordings for UI changes, and details on verification steps taken

### Design System Principles (React Native + NativeWind)

#### I. Visual Foundation (Design Tokens & Global Styles)

- **Source of Truth:** All design decisions must be implemented by configuring `tailwind.config.js` and using `global.css`. Do not define hardcoded color values or sizes in components.
- **Colors:** Use Tailwind color classes (e.g., `bg-primary`, `text-muted`, `border-ring`). Custom colors are defined in `tailwind.config.js` (e.g., `primary`, `accent`, `destructive`, `ring`, `foreground`).
- **Typography:** Use Google Fonts as specified in `tailwind.config.js` (`Inter`, `Outfit`, `Plus Jakarta Sans`).
  - Use font size utilities (e.g., `text-lg`, `font-semibold`).
  - **Bold Text:** Must use the `font-bold` class or `font-semibold`, **not** `fontWeight: 'bold'` in inline styles.
- **Borders:** Use `rounded-md` for general UI. Use `rounded-lg` or `rounded-xl` for large containers like cards and modals.
- **Shadows:** Use `shadow-xl` for high-emphasis elements (cards, floating action buttons) and `shadow-lg` for modals.

#### II. Reusable Component Patterns

- **Buttons:**
  - **Primary:** `bg-primary text-primary-foreground font-bold rounded-md`.
  - **Text-only (Flat):** Use `text-primary` instead of a background.
  - **Outline:** Use `border border-primary text-primary`.
  - _Note:_ Do not set `fontWeight: 'bold'` inline; rely on Tailwind classes (`font-semibold`, `font-bold`).
- **Cards:** Use `bg-card text-card-foreground rounded-lg shadow-xl`. Apply `p-4` for padding.
- **Glass/Frosted UI:** Use the `glass` utility class defined in `global.css` (e.g., `glass p-6`).
- **Input Fields:** Use `bg-input text-input-foreground border border-border` for the input container.

#### III. Navigation Patterns

- **Headers:** Use `bg-header-background text-header-foreground`.
- **Back Buttons:** Use `Ionicons` and ensure they are styled with `text-primary` and `font-bold` when necessary.
- **`ScreenWrapper` Component:** Always wrap screen content in `components/ui/ScreenWrapper` to ensure consistent safe area handling and background styling across the app.
