# SafeScout AI — The Autonomous Child Safety & Survival Reflex Academy

[![Node.js](https://img.shields.io/badge/NODE.JS-20_%7C_22_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NESTJS-10.4.15-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![React Native](https://img.shields.io/badge/REACT_NATIVE-0.76.9-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/EXPO-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)

[![Prisma](https://img.shields.io/badge/PRISMA-5.22.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![SQLite](https://img.shields.io/badge/SQLITE-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Google Gemini](https://img.shields.io/badge/GOOGLE_GEMINI-2.0_MULTIMODAL-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Vector SVG](https://img.shields.io/badge/VECTOR_SVG-2.5D_RENDER-FF6B35?style=for-the-badge&logo=svg&logoColor=white)](https://github.com/software-mansion/react-native-svg)

[![Tests](https://img.shields.io/badge/TESTS-70_PASSING-00C853?style=for-the-badge&logo=checkmarx&logoColor=white)](test/)
[![CI](https://img.shields.io/badge/CI-PASSING-00C853?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows/internal-checks.yml)
[![Mascot](https://img.shields.io/badge/MASCOT-CAPTAIN_MILO_3D-F59E0B?style=for-the-badge&logo=paw&logoColor=white)](mobile/assets/)
[![License](https://img.shields.io/badge/LICENSE-MIT-0284C7?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

An intelligent, gamified survival reflex and child safety education platform designed for children aged 5–12 and their families. Powered by **Captain Milo**—a high-fidelity 3D Rescue Golden Pup AI companion—and an automated reflex testing engine.

> **Project Status**: **Advanced Research & Preview Stage**. Validated with automated test suites (70/70 passing tests), isolated end-to-end browser verification, and a 12-lesson research curriculum draft with verified safety sources. Pre-release state: Full mobile builds for Apple App Store / Google Play and official pedagogy board endorsements are pending.

---

## 📑 Table of Contents
- [Overview & Core Mission](#1-overview--core-mission)
- [Key Features & Capabilities](#2-key-features--capabilities)
- [Technology Stack](#3-technology-stack)
- [Repository Structure](#4-repository-structure)
- [Captain Milo 3D Mascot System](#5-captain-milo-3d-mascot-system)
- [Database Architecture (Prisma)](#6-database-architecture-prisma)
- [Backend REST API Specification](#7-backend-rest-api-specification)
- [Installation & Getting Started](#8-installation--getting-started)
- [Running & Previewing](#9-running--previewing)
- [Automated Testing & Verification](#10-automated-testing--verification)
- [License & Attribution](#11-license--attribution)

---

## 1. Overview & Core Mission

Children face diverse safety challenges in real-world environments—from kitchen hazards, electrical dangers, and natural disasters to public space separation and online privacy. Traditional instruction is often passive and easily forgotten during panic.

**SafeScout AI** transforms safety education into an engaging, interactive adventure:
1. **Gamified Reflex Training**: Children learn emergency protocols through bite-sized, timed interactive challenges with instant feedback.
2. **AI Multimodal Hazard Analysis**: Real-time camera scanner identifies domestic and outdoor dangers using Google Gemini 2.0.
3. **Physical Rescue Companion**: Captain Milo guides, demonstrates, and cheers children using animated Disney/Duolingo-inspired physics.
4. **Zero-Knowledge Parent Portal**: Secure PIN-gated gateway with encrypted emergency beacons, screen time limits, and skill radar analytics.

---

## 2. Key Features & Capabilities

### 🌟 Implemented & Fully Verified
- **Captain Milo 3D Mascot Engine (`mobile/assets/`)**:
  - 4 context-specific, 100% transparent PNG poses with zero border artifacts (Corner Alpha = 0, Center Alpha = 255):
    - `milo_rescue_pup.png`: Cheerful waving greeting pose (Idle / Stage / Standard).
    - `milo_thinking.png`: Pensive pose with chin rest and floating question mark `❓`.
    - `milo_timing.png`: Holding a stopwatch `⏱️` for practice duration selection.
    - `milo_backpack.png`: Holding the Quantum First-Aid Backpack with a thumbs-up `👍`.
  - 60FPS Squash & Stretch animation loops (breathe, anticipation, jump bounce, and contextual floating badges).
- **4-Step Narrative Onboarding (`OnboardingScreen.tsx`)**:
  - Step 1: Age group selection (`5-6`, `7-8`, `9-10`, `11+ Years`).
  - Step 2: Referral channel selection (dynamically triggers Milo's thinking pose).
  - Step 3: Daily training time commitment (15, 30, or 45 minutes; triggers Milo's stopwatch pose).
  - Step 4: Survival backpack & notification activation (triggers Milo's thumbs-up backpack pose).
  - State persisted via `AsyncStorage` (`milo_has_onboarded_v1: true`).
- **Spotlight Tour Guide (`SpotlightTourGuide.tsx`)**:
  - SVG Cutout Mask (`spotlightHoleMask`) with 100% crystal-clear transparency inside the spotlight aperture.
  - 3-tier staggered Golden Aura ripple waves (`aura1`, `aura2`, `aura3`) expanding at 60FPS.
  - Exact mathematical centering across both mobile and desktop viewports across 5 steps:
    1. Stage 1 Challenge Node & Victory Flag.
    2. 10 Adventure Biomes selector bar.
    3. AI Vision Scanner dock tab.
    4. Emergency SOS dock tab.
    5. Parent Portal dock tab.
- **2200px S-Curve World Map (`WorldMapScreen.tsx`)**:
  - Vertical scrolling canvas with smooth Cubic Bezier pathing.
  - 10 floating 2.5D island nodes with foliage, rock strata, and 3-star rating badges.
  - Active stage anchor with Milo standing, bouncing golden arrow indicator, and 3 concentric radar rings.
  - Quick-switch bar for 10 biomes (Wilderness, Urban Safety, Home Security, Water Safety, Disasters, etc.).
- **Multimodal AI Hazard Scanner (`ScannerScreen.tsx`)**:
  - Live camera integration and photo upload analyzed via `POST /ai/scan-environment`.
  - Hazard classification (`SAFE`, `CAUTION`, `DANGER`) with automated offline fallback mode.
- **Emergency SOS Siren & GPS Beacon (`SosScreen.tsx`)**:
  - One-touch emergency siren, flashing strobe flashlight, and 3-blast rescue whistle.
  - Live GPS beacon dispatched to parents via `POST /parent/emergency-alert`.
  - Offline "Hug-a-Tree" survival protocols.
- **Parent Gate & Family Dashboard (`ParentAuthScreen.tsx`, `ParentDashboardScreen.tsx`)**:
  - 4-digit numeric keypad with `bcrypt` hash verification.
  - Screen time regulation, sleep lockout timers, and family emergency drill simulator.
- **Curriculum & Reflex Testing Engine (`QuestTestScreen.tsx`)**:
  - Countdown reflex timer, single-choice and ordering question formats, and detailed mistake logging.

---

## 3. Technology Stack

### Frontend Architecture
- **Framework**: React Native `0.76.9` + Expo `~52.0.0` + React Native Web `~0.19.13`
- **Language**: TypeScript 100% (`strict: true`)
- **Vector Graphics**: `react-native-svg` (15.8.0)
- **Animation System**: React Native `Animated` with 12 Disney Animation principles (Squash & Stretch, Easing)
- **Icons**: `lucide-react-native`
- **Audio & Haptics**: `expo-av`, local PCM audio generator, `spatialHaptics`
- **State & Storage**: `@react-native-async-storage/async-storage` + Offline Attempt Queue

### Backend Architecture
- **Framework**: NestJS `10.4.15` (Modular architecture)
- **Database & ORM**: SQLite (Development / Preview) / PostgreSQL (Production) via Prisma ORM `5.22.0`
- **AI Vision Engine**: Google Gemini 2.0 Multimodal API (`@google/genai`) with Safe Fallback Engine
- **Documentation**: Swagger UI at `http://localhost:3000/api/docs`
- **Security**: `bcrypt` (PIN hashing), `class-validator`, `class-transformer`

---

## 4. Repository Structure

```text
kidproject/
├── .github/workflows/          # CI Pipeline: Typecheck, 70 Tests, Build, Browser checks
├── content/milo-12/            # 12 Research curriculum lessons & safety source references
├── docs/                       # Research papers, UI audits, and browser test evidence
├── mobile/                     # Expo React Native Frontend Application
│   ├── assets/                 # Transparent 3D Mascot renders, audio, and branding
│   │   ├── milo_rescue_pup.png # Standard welcoming 3D mascot render
│   │   ├── milo_thinking.png   # Thinking 3D mascot render with question mark
│   │   ├── milo_timing.png     # Stopwatch-holding 3D mascot render
│   │   └── milo_backpack.png   # Backpack-holding thumbs-up 3D mascot render
│   └── src/
│       ├── components/         # Reusable UI components (MiloAvatar2D, Spotlight, Nodes)
│       ├── screens/            # Application screens (Onboarding, WorldMap, Scanner, SOS)
│       ├── services/           # Client services (API client, Voice TTS, Audio SFX)
│       ├── theme/              # Color palette & styling constants
│       └── types/              # TypeScript curriculum and navigation definitions
├── prisma/                     # Database schema, migrations, and seed scripts
├── scripts/                    # Utility scripts (Preview server, encrypted backup, audio)
├── src/                        # NestJS Backend Application
│   ├── modules/ai/             # Gemini AI Vision & Safety Scanner
│   ├── modules/family/         # Family accounts, multi-profiles & session tokens
│   ├── modules/learning/       # Journey Map, Checkpoints & Reflex Test Grading
│   ├── modules/parent/         # Parent Gate, PIN auth & SOS alert dispatcher
│   └── modules/prisma/         # Prisma client service
├── test/                       # 70 automated test suites covering all business workflows
├── .env.example                # Safe environment configuration template
├── LICENSE                     # Official MIT License
└── package.json                # Project dependencies, build, and test scripts
```

---

## 5. Captain Milo 3D Mascot System

Captain Milo is an Eurasian River Otter and Golden Rescue Pup hybrid character designed following Disney and Pixar animation guidelines:
- **3D Proportions**: Chibi aesthetic (Head-to-body ratio 1:2.2), large expressive brown eyes, tactile clay texture finish.
- **Rescue Gear**:
  - High-impact quantum safety helmet with an interactive headlamp (Warm Amber = Idle, Pulsing Cyan = Scanning, Flashing Red = SOS Alert).
  - High-visibility Neon Orange (`#FF6B35`) and Rescue Navy (`#004E89`) safety life vest with reflective silver stripes.
  - Emergency whistle and quantum first-aid rescue backpack.
- **Animation States**:
  - `IDLE`: Organic breathing loop with synchronized ground drop shadow scaling.
  - `POINTING_DOWN`: Forward lean and downward gesture for map progression.
  - `THINKING`: Head tilt with resting chin paw and thought bubble.
  - `CHEERING`: Anticipation squat followed by a vertical celebratory leap.

---

## 6. Database Architecture (Prisma)

```prisma
datasource db {
  provider = "sqlite" // Can be switched to "postgresql" via DATABASE_URL
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. User & Learner Profile
model User {
  id                String               @id @default(cuid())
  nickname          String
  avatarUrl         String?
  age               Int                  @default(7)
  ageGroup          String               @default("EARLY_EXPLORER")
  explorerLevel     Int                  @default(1)
  totalSafetyScore  Int                  @default(0)
  totalBadges       Int                  @default(0)
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  parentGate        ParentGate?
  lessonProgress    UserLessonProgress[]
  testResults       TestResult[]
  mistakeLogs       MistakeLog[]
  userBadges        UserBadge[]

  @@map("users")
}

// 2. Parent Security Gateway
model ParentGate {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  pinHash                 String   // Hashed with bcrypt
  parentEmail             String?
  parentPhone             String?
  dailyTimeLimitMinutes   Int      @default(30)
  emergencyContactEnabled Boolean  @default(true)
  weeklyReportEnabled     Boolean  @default(true)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("parent_gates")
}

// 3. 10 Survival Zones (Biomes)
model Zone {
  id          String   @id @default(cuid())
  zoneNumber  Int      @unique
  title       String
  description String
  iconName    String
  themeColor  String   @default("#004E89")
  unlockLevel Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  stages Stage[]
  badges Badge[]

  @@map("zones")
}

// 4. Survival Challenge Stages
model Stage {
  id          String   @id @default(cuid())
  zoneId      String
  stageNumber Int
  title       String
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  zone    Zone     @relation(fields: [zoneId], references: [id], onDelete: Cascade)
  lessons Lesson[]

  @@unique([zoneId, stageNumber])
  @@map("stages")
}

// 5. Lessons & Reflex Checkpoints
model Lesson {
  id              String       @id @default(cuid())
  stageId         String
  lessonNumber    Int
  title           String
  description     String
  durationMinutes Int          @default(5)
  rewardXp        Int          @default(100)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  stage        Stage                @relation(fields: [stageId], references: [id], onDelete: Cascade)
  checkpoints  Checkpoint[]
  userProgress UserLessonProgress[]

  @@unique([stageId, lessonNumber])
  @@map("lessons")
}

model Checkpoint {
  id                 String         @id @default(cuid())
  lessonId           String
  checkpointNumber   Int
  title              String
  passScoreThreshold Int            @default(80)
  timeLimitSeconds   Int            @default(60)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  lesson      Lesson         @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions   TestQuestion[]
  testResults TestResult[]

  @@unique([lessonId, checkpointNumber])
  @@map("checkpoints")
}

model TestQuestion {
  id               String           @id @default(cuid())
  checkpointId     String
  questionNumber   Int
  promptText       String
  questionType     String           @default("SINGLE_CHOICE")
  hazardLevel      String           @default("SAFE")
  timeLimitSeconds Int              @default(5)
  explanation      String
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  checkpoint  Checkpoint       @relation(fields: [checkpointId], references: [id], onDelete: Cascade)
  options     QuestionOption[]
  mistakeLogs MistakeLog[]

  @@unique([checkpointId, questionNumber])
  @@map("test_questions")
}

model QuestionOption {
  id             String       @id @default(cuid())
  testQuestionId String
  optionText     String
  isCorrect      Boolean      @default(false)
  displayOrder   Int          @default(0)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  testQuestion TestQuestion @relation(fields: [testQuestionId], references: [id], onDelete: Cascade)

  @@map("question_options")
}
```

---

## 7. Backend REST API Specification

| Module | Method | Endpoint | Parameters / Payload | Description |
| :--- | :---: | :--- | :--- | :--- |
| **Learning** | `GET` | `/learning/journey-map` | `userId`: string | Retrieves 10 biomes, unlocked stages, and scores |
| **Learning** | `GET` | `/learning/checkpoints/:id` | `id`: string, `userId`: string | Retrieves reflex test questions for a checkpoint |
| **Learning** | `POST` | `/learning/checkpoints/:id/submit` | `{ userId, answers, timeTaken }` | Submits test answers, computes stars, awards XP |
| **AI Vision** | `POST` | `/ai/scan-environment` | FormData: `image` (max 4MB), `childAge` | Gemini AI hazard detection and survival advice |
| **AI Vision** | `POST` | `/ai/chat` | `{ userId, message }` | Direct text chat dialogue with Captain Milo |
| **AI Vision** | `GET` | `/ai/health` | None | Health check for AI Engine & Gemini API Key |
| **Parent** | `POST` | `/parent/verify-pin` | `{ userId, pin }` | Verifies parent 4-digit PIN |
| **Parent** | `POST` | `/parent/update-pin` | `{ userId, currentPin, newPin }` | Updates parent access PIN |
| **Parent** | `POST` | `/parent/emergency-alert` | `{ userId, alertType, lat, lng }` | Dispatches real-time SOS beacon with GPS |
| **Parent** | `GET` | `/parent/emergency-alerts` | `userId`: string | Fetches learner's past emergency alerts |
| **Parent** | `GET` | `/parent/safety-report` | `userId`: string | Fetches safety skill analytics & time reports |
| **Parent** | `POST` | `/parent/settings` | `{ userId, dailyLimitMinutes, ... }` | Configures screen limits and emergency contacts |

---

## 8. Installation & Getting Started

### System Prerequisites
- **Node.js**: Version 20 or 22 LTS (Node.js 22 recommended).
- **npm**: Version 10 or higher.
- **Browser**: Google Chrome or Microsoft Edge (for automated browser checks).

### Step 1: Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/MrTonyIT/kidproject.git
cd kidproject

# Install backend dependencies
npm ci

# Install mobile/web frontend dependencies
cd mobile
npm ci
cd ..
```

### Step 2: Environment Setup & Database Initialization
```bash
# Copy safe environment configuration
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Push schema to local SQLite database
npm run prisma:push

# Seed initial curriculum and zone datasets
npm run prisma:seed
```

---

## 9. Running & Previewing

### Quick Isolated Preview Mode
The repository provides self-contained preview runners that launch ephemeral databases with isolated browsers:

```bash
# Preview curriculum map and interactive lessons
npm run preview:curriculum
```
Open **http://localhost:8081** in your browser.

To test family accounts with multi-profile authentication:
```bash
npm run preview -- --family
```

### Dual-Terminal Development Mode
- **Terminal 1 (Backend NestJS)**:
  ```bash
  npm run start:dev
  # API running at: http://localhost:3000
  # Swagger Docs at: http://localhost:3000/api/docs
  ```
- **Terminal 2 (Frontend Expo Web)**:
  ```bash
  cd mobile
  npx expo start --web
  # Client running at: http://localhost:8081
  ```

---

## 10. Automated Testing & Verification

The project includes an extensive automated test suite covering safety rules, state hydration, audio lifecycles, and cryptographic backups:

```bash
# 1. Backend TypeScript Typecheck
npm run typecheck

# 2. Frontend TypeScript Typecheck
cd mobile && npx tsc --noEmit && cd ..

# 3. Execute 70 automated test suites
npm test

# 4. Compile Backend NestJS Build
npm run build

# 5. Export Web Distribution
cd mobile && npx expo export --platform web --output-dir ../scratch/ci-web && cd ..
```

### Verified Benchmark Results:
- `npm run typecheck`: **0 errors**.
- `mobile typecheck`: **0 errors**.
- `npm test`: **70 passing**, 0 failing (~30 seconds execution time).
- `npm run build`: Production bundle compiled to `dist/` with zero warnings.

---

## 11. License & Attribution

Distributed under the **[MIT License](LICENSE)**. See `LICENSE` for details.

Developed with ❤️ by **Đỗ Hiệp Luân ([@MrTonyIT](https://github.com/MrTonyIT))** & the **SafeScout AI Team**.
