# Repository Guidelines

## Project Structure & Module Organization
This is an Expo React Native app using Expo Router. Route screens live in `app/`, with grouped flows such as `app/(auth)`, `app/(authenticated)/(tabs)`, `app/(authenticated)/rooms`, and `app/(authenticated)/profile`. Shared UI and feature components live in `components/`, organized by domain (`chat`, `rooms`, `home`, `ui`). Business logic and Firebase helpers live in `lib/`; reusable hooks are in `hook/`; app-wide providers are in `context/`; Firebase setup is in `config/`. Static images are under `assets/images`, category metadata is in `constants/`, and legal markdown content is in `docs/legal`.

## Build, Test, and Development Commands
Run `npm install` after pulling dependency changes. Use `npm start` to launch Expo Metro, `npm run ios` or `npm run android` for native builds, and `npm run web` for the web target. Run `npm run lint` before handing off changes; it uses `expo lint`. There is currently no dedicated `npm test` script, so document any manual verification performed in your PR.

## Coding Style & Naming Conventions
Use JavaScript/JSX functional components with React hooks. Keep indentation at two spaces and follow the existing NativeWind `className` styling approach for layout and colors. Components use `PascalCase` filenames when exported as UI components, hooks use `useSomething` naming, and route files follow Expo Router conventions such as `[roomId].jsx` and grouped folders in parentheses. Prefer existing helpers in `lib/`, `context/`, and `components/ui` before adding new abstractions.

## Testing Guidelines
No test framework is configured yet. When adding tests, place them near the relevant module or in a clear `__tests__` folder, and use `*.test.js` or `*.test.jsx` naming. For behavior touching Firebase, location, navigation, or notifications, include mocked dependencies and verify loading, error, and permission-denied states.

## Commit & Pull Request Guidelines
Recent commits use Conventional Commit-style prefixes, for example `feat:`, `fix:`, and `refactor:`. Keep commit subjects short and imperative. PRs should include a concise summary, linked issue when applicable, screenshots or recordings for UI changes, and the commands or devices used for verification.

## Security & Configuration Tips
Do not commit secrets or private keys. Runtime configuration is expected through `.env` values such as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and Firebase `EXPO_PUBLIC_FIREBASE_*` variables. Review `firestore.rules` when changing room, chat, user, or reporting data access.
