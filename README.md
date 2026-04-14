# SpotUs

SpotUs is a location-based social discovery and real-time chat application built with React Native and Expo. It allows users to discover active rooms within a specific radius, join dynamic conversations based on interests, and organically build trust with other users to unlock direct messaging capabilities.

## Features

- **Location-Based Discovery**: Find nearby chat rooms using a dynamic radius slider.
- **Interest-Based Rooms**: Create and join rooms categorized by topics like Music, Tech, Coffee, Local Events, and more.
- **Dual Trust System**: A unique reputation mechanism where users must build "Room Trust" (by participating in public rooms) to unlock Direct Messaging, preventing spam and fostering organic connections.
- **Real-Time Chat**: Fast, reliable messaging powered by Firebase Firestore with read receipts, typing indicators, and immediate synchronization.
- **Premium Human UI**: A heavily polished, tactile user interface utilizing NativeWind. Features squircle avatars, fluid spring animations, and comprehensive haptic feedback.
- **Secure Authentication**: Passwordless OTP, Google OAuth, and Apple Sign-In powered by Clerk.

## Tech Stack

- **Framework**: React Native with Expo (Expo Router)
- **Styling**: NativeWind (Tailwind CSS)
- **Backend & Database**: Firebase Firestore
- **Authentication**: Clerk (Core 2/3)
- **Key Libraries**: `@gorhom/bottom-sheet`, `expo-haptics`, `react-native-reanimated`

## Getting Started

### Prerequisites

- Node.js (v18+)
- EAS CLI (`npm install -g eas-cli`)
- A Clerk Account
- A Firebase Project

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:your-private-org/spotus.git
   cd spotus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` or `.env.local` file in the root directory and add your keys (contact the repository admin if you do not have these):
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## License & Copyright

This is a **private repository**. All rights reserved. No part of this codebase may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright owner. See the [LICENSE](LICENSE) file for details.
