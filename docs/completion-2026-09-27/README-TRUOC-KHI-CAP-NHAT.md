> BẢN LƯU LỊCH SỬ, KHÔNG MÔ TẢ TÍNH NĂNG HIỆN TẠI. Các lời hứa bên dưới có mục chưa triển khai hoặc đang đóng. Xem README tại gốc dự án và báo cáo ngày 27/09/2026.

# 🛡️ THE SECRET EXPLORER ACADEMY (KIDSSAFE AI)
### *Học Viện Thám Hiểm Bí Mật - Nền Tảng Rèn Luyện Kỹ Năng Sinh Tồn & Phản Xạ An Toàn Dành Cho Trẻ Em (5 - 12 Tuổi)*

---

## 📖 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

**KidsSafe AI (The Secret Explorer Academy)** là ứng dụng giáo dục an toàn và phản xạ sinh tồn cao cấp dành cho trẻ em từ 5 đến 12 tuổi, kết hợp:
1. **Gamification chuẩn Duolingo**: Bản đồ thế giới 10 Quần xã (Biomes), lộ trình đường cong chữ S mượt mà qua các Ải sinh tồn với đồ họa 2.5D/3D hoạt hình phong cách Pixar/Disney.
2. **Trợ thủ AI - Đội Trưởng Milo (Captain Milo)**: Chú cún cứu hộ lượng tử 3D thông minh, biết biểu cảm, cử động theo ngữ cảnh (Squash & Stretch Animation), hướng dẫn đàm thoại và soi chiếu nguy cơ bằng AI Camera.
3. **Phản xạ sinh tồn khẩn cấp (Emergency SOS Reflex)**: Còi cứu hộ, đèn chớp khẩn cấp, hướng dẫn Hug-a-Tree khi lạc, định vị GPS tức thời gửi tới phụ huynh.
4. **Cổng Phụ Huynh Bảo Mật (Parent Gate & Dashboard)**: Khóa PIN bảo vệ, quản lý thời gian chơi (Sleep Lock), theo dõi phân tích điểm phản xạ và báo cáo an toàn chi tiết.

---

## 🏗️ 2. KIẾN TRÚC CÔNG NGHỆ (TECH STACK)

### Frontend (Mobile & Web)
- **Framework**: React Native `0.76.9` + Expo `~52.0.0` + React Native Web `~0.19.13`
- **Ngôn ngữ**: TypeScript 100%
- **Đồ họa & Vector**: `react-native-svg` (15.8.0), kết hợp công thức toán học SVG Masking cho Spotlight Tour
- **Animation Engine**: React Native `Animated` với 12 nguyên lý hoạt hình Disney/Duolingo (Squash & Stretch, Anticipation, Inertia, Easing)
- **Biểu tượng**: `lucide-react-native`
- **Âm thanh & Rung**: `expo-av` (nhạc nền, âm thanh pop, fanfare chúc mừng), `spatialHaptics`
- **Lưu trữ Offline**: `@react-native-async-storage/async-storage`

### Backend (API & Engine)
- **Framework**: NestJS `10.4.15` (Modular Architecture)
- **Database & ORM**: PostgreSQL / SQLite thông qua **Prisma ORM** `5.22.0`
- **Trí Tuệ Nhân Tạo (AI Vision)**: Google Gemini API 2.0 (`@google/genai`) kết hợp Safe Fallback Engine
- **Tài liệu API**: Swagger UI tại `http://localhost:3000/api/docs`
- **Bảo mật**: `bcrypt` (mã hóa mã PIN phụ huynh), `class-validator`, `class-transformer`

---

## 📁 3. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY TREE)

```text
d:/kidproject/
├── prisma/
│   ├── schema.prisma              # Database Schema (Users, Zones, Stages, Lessons, Parent Gate)
│   └── seed.ts                    # Dữ liệu mẫu 10 Vùng Đất & các câu hỏi phản xạ sinh tồn
├── src/                           # Backend NestJS Source Code
│   ├── app.module.ts              # Root NestJS Module
│   ├── main.ts                    # Entry point backend, Swagger config, CORS
│   ├── common/                    # Filters, Interceptors, Base interfaces
│   └── modules/
│       ├── ai/                    # Gemini AI Vision & Chat Assistant Module
│       ├── learning/              # Journey Map, Checkpoints & Reflex Test Grading
│       ├── parent/                # Parent PIN Gate, Dashboard & Emergency Dispatch
│       └── prisma/                # Prisma Service & Database Connection
├── mobile/                        # Frontend Expo React Native Source Code
│   ├── App.tsx                    # Entry point ứng dụng, Auth & Navigation Router
│   ├── assets/                    # Assets hình ảnh Mascot Milo 3D Transparent PNG
│   │   ├── milo_rescue_pup.png    # Milo 3D vẫy chào vui vẻ (Chuẩn/Bước 1 Onboarding)
│   │   ├── milo_thinking.png      # Milo 3D đưa tay lên cằm suy nghĩ + Dấu hỏi (Bước 2)
│   │   ├── milo_timing.png        # Milo 3D cầm đồng hồ bấm giờ đắn đo (Bước 3)
│   │   └── milo_backpack.png      # Milo 3D cầm Balo Cứu Hộ và giơ Like 👍 (Bước 4)
│   └── src/
│       ├── components/            # UI Components tái sử dụng
│       │   ├── MiloAvatar2D.tsx   # Mascot Core Component: Squash & Stretch Animation, Props
│       │   ├── SpotlightTourGuide.tsx # In-App Tour 5 bước đục lỗ SVG Mask trong suốt 100%
│       │   ├── CartoonIslandStageNode.tsx # Đảo nổi 2.5D chứa nút số Ải & 3 sao
│       │   ├── BottomNavBar.tsx   # Thanh Dock bo góc 24px (Bản đồ, Quét AI, Balo, SOS, Ba mẹ)
│       │   ├── BiomeBackground.tsx # Nền trời & mây động theo từng quần xã
│       │   ├── BiomeDecorations2D.tsx # Chi tiết môi trường (Hố hang, Lửa trại, Rương báu, Nấm)
│       │   ├── TopHeader.tsx      # Thanh thông tin Level, XP, Streak lửa, Huy hiệu
│       │   ├── DailyDrillModal.tsx # Popup thử thách phản xạ hàng ngày
│       │   ├── PanicCalmerModal.tsx # Bài tập thở 4-7-8 giúp bé bình tĩnh
│       │   └── SleepLockModal.tsx # Màn hình khóa giờ đi ngủ của phụ huynh
│       ├── screens/               # Màn hình chính
│       │   ├── OnboardingScreen.tsx # Luồng Onboarding 4 bước của Đội Trưởng Milo
│       │   ├── WorldMapScreen.tsx # Bản đồ 10 Quần xã sinh tồn, đường cong chữ S 2200px
│       │   ├── QuestTestScreen.tsx # Màn thi phản xạ trắc nghiệm đếm ngược
│       │   ├── ScannerScreen.tsx  # Camera AI soi đồ vật & nhận diện nguy cơ
│       │   ├── SosScreen.tsx      # Màn hình Cứu Hộ SOS khẩn cấp (Còi hú, Đèn chớp, GPS)
│       │   ├── InventoryScreen.tsx # Balo Lượng Tử chứa 10 Bộ Huy Hiệu Mảnh Ghép
│       │   ├── ParentAuthScreen.tsx # Bàn phím số nhập mã PIN phụ huynh
│       │   └── ParentDashboardScreen.tsx # Bảng điều khiển phụ huynh & Báo cáo an toàn
│       ├── services/              # Dịch vụ logic client
│       │   ├── api.ts             # Axios HTTP Client kết nối NestJS Backend
│       │   ├── voice.ts           # Speech TTS Engine đọc lời thoại Đội Trưởng Milo
│       │   ├── sound.ts           # Audio SFX Engine (Pop, Success, Fanfare, Alert)
│       │   ├── spatialHaptics.ts  # Rung phản hồi xúc giác
│       │   └── i18n.ts            # Đa ngôn ngữ (Tiếng Việt & English)
│       ├── theme/                 # Bảng màu chuẩn & typography
│       └── types/                 # TypeScript interfaces (Navigation, Curriculum, User)
├── package.json                   # Backend Dependencies
└── mobile/package.json            # Mobile Dependencies
```

---

## 🌟 4. CÁC TÍNH NĂNG CỐT LÕI (CORE FEATURES BREAKDOWN)

### 4.1. Luồng Onboarding 4 Bước Của Đội Trưởng Milo (`OnboardingScreen.tsx`)
- **Bước 1 (Chọn độ tuổi)**: 4 lựa chọn chunky 3D:
  - `5 - 6 Tuổi` (Mầm Non & Lớp 1)
  - `7 - 8 Tuổi` (Lớp 2 - Lớp 3)
  - `9 - 10 Tuổi` (Lớp 4 - Lớp 5)
  - `11+ Tuổi` (Tiền Trung Học)
- **Bước 2 (Nguồn biết đến)**: YouTube/TikTok, Thầy cô/Trường học, Ba mẹ giới thiệu, Bạn bè.
  - Mascot tự động chuyển sang dáng **Milo Suy Nghĩ** (`milo_thinking.png`) với đám mây dấu hỏi `❓`.
- **Bước 3 (Thời gian rèn luyện mỗi ngày)**: 15 phút, 30 phút, 45 phút.
  - Mascot tự động chuyển sang dáng **Milo Cầm Đồng Hồ Bấm Giờ** (`milo_timing.png`).
- **Bước 4 (Kích hoạt Balo & Thông báo)**:
  - Mascot tự động chuyển sang dáng **Milo Cầm Balo Cứu Hộ & Like 👍** (`milo_backpack.png`).
- **Lưu trạng thái**: Ghi vào `AsyncStorage` (`milo_has_onboarded_v1: true`) để không lặp lại khi mở lại app, chuyển hướng trực tiếp vào `WorldMapScreen` kèm kích hoạt Spotlight Tour.

### 4.2. Màn Mờ Hướng Dẫn Spotlight Focus (`SpotlightTourGuide.tsx`)
- **Công nghệ True SVG Cutout Mask**: Đục lỗ trong suốt $100\%$ xuyên qua lớp nền tối `#071936` (opacity 0.84), đối tượng bên trong lỗ sáng rực rỡ và rõ nét, không bị lem mờ.
- **3 Tầng Sóng Hào Quang Vàng (Golden Aura Waves)**: 3 vòng sóng Neon vàng liên tục lan tỏa so le (0ms, 600ms, 1200ms) ở tần số 60FPS.
- **Cơ chế bắt buộc**: Người dùng không thể chạm vào nền đen để bỏ qua mà **bắt buộc phải nhấn nút "TIẾP THEO ➜"**.
- **Căn chỉnh chính tâm 100% trên cả Điện Thoại & PC**:
  - `Bước 1`: Ải 1 Thử Thách Sinh Tồn (Vòng tròn ôm khít huy hiệu cờ Ải 1).
  - `Bước 2`: 10 Vùng Đất Phiêu Lưu (Khung chữ nhật bo góc 18px ôm trọn thanh quần xã).
  - `Bước 3`: Quét AI Balo Milo (Vòng tròn tại Tab Quét AI).
  - `Bước 4`: Cứu Hộ Khẩn Cấp SOS (Vòng tròn tại Tab Cứu Hộ).
  - `Bước 5`: Cổng Ba Mẹ (Vòng tròn tại Tab Ba Mẹ).

### 4.3. Bản Đồ 10 Vùng Đất & Đường Cong Chữ S 2200px (`WorldMapScreen.tsx`)
- Bản đồ cuộn dọc mượt mà với đường cong Cubic Bezier nối chính xác qua 10 Ải thử thách.
- Bục đảo nổi 2.5D dạng Vector SVG (Thảm cỏ xanh, tầng đất nâu, rễ cây rủ, huy hiệu Ải và sao xếp hạng).
- Chú cún Milo đứng trực tiếp trên Ải đang mở kèm mũi tên vàng nhún nhảy (`ChevronDown`) và 3 vòng sóng Radar lan tỏa đồng tâm.
- Thanh chuyển nhanh 10 Quần xã (Rừng Nhiệt Đới, Sa Mạc, Băng Giá, Đô Thị, Núi Cao...).

### 4.4. Đội Trưởng Milo 3D & Animation Engine (`MiloAvatar2D.tsx`)
- **Mascot Master Asset**: Chú cún cứu hộ 3D phong cách Disney Pixar / PAW Patrol với mũ bảo hộ vàng, đèn pin lượng tử, áo phao cam và còi sinh tồn.
- **Nguyên lý hoạt hình Squash & Stretch**:
  - `IDLE`: Thở phập phồng nhẹ nhàng, bóng dưới chân co giãn nhịp nhàng.
  - `POINTING_DOWN`: Nghiêng người về phía trước, nhún người chỉ xuống Ải 1.
  - `LOOKING_UP`: Ngước mắt nhìn lên trên khám phá 10 vùng đất.
  - `SCANNING`: Lắc lư tập trung, radar xoay 360 độ.
  - `EMERGENCY_SOS`: Rung lắc khẩn cấp, đèn chớp nhịp nhanh.
  - `CHEERING / SALUTING`: Nhún lấy đà (Anticipation) ➜ Bung người nhảy lên cao ➜ Tiếp đất êm ái (Bounce Landing).

### 4.5. Camera AI Vision Scanner (`ScannerScreen.tsx`)
- Tích hợp camera điện thoại hoặc tải ảnh từ thư viện.
- Gửi ảnh qua API `POST /ai/scan-environment` để Gemini AI phân tích mức độ an toàn (SAFE, CAUTION, DANGER), chỉ rõ nguy cơ tiềm ẩn và đưa ra mẹo sinh tồn tức thì.

### 4.6. Trắc Nghiệm Phản Xạ Có Giới Hạn Thời Gian (`QuestTestScreen.tsx`)
- Bộ câu hỏi tương tác với thanh đếm ngược thời gian (`CountdownBar`).
- Xử lý các tình huống: Hỏa hoạn, động đất, đuối nước, điện giật, người lạ tiếp cận...
- Tự động chấm điểm, tính số sao (1-3 sao), lưu Mistake Log để phụ huynh kiểm tra.

### 4.7. Cổng Phụ Huynh & Khóa PIN (`ParentAuthScreen.tsx`, `ParentDashboardScreen.tsx`)
- Bàn phím số nhập mã PIN 4 chữ số chống trẻ em tự ý truy cập.
- Bảng báo cáo chỉ số an toàn, thời gian rèn luyện trong ngày, biểu đồ radar kỹ năng.
- Trình mô phỏng tình huống thoát hiểm khẩn cấp cho gia đình (`FamilyDrillSimulatorModal`).

---

## 🗄️ 5. CƠ SỞ DỮ LIỆU PRISMA (DATA MODELS SCHEMA)

```prisma
datasource db {
  provider = "sqlite" // Hỗ trợ chuyển đổi sang postgresql dễ dàng
  url      = env("DATABASE_URL")
}

// 1. User & Hồ Sơ Bé
model User {
  id                String               @id @default(cuid())
  nickname          String
  avatarUrl         String?
  age               Int                  @default(7)
  ageGroup          String               @default("EARLY_EXPLORER")
  explorerLevel     Int                  @default(1)
  totalSafetyScore  Int                  @default(0)
  totalBadges       Int                  @default(0)
  parentGate        ParentGate?
  lessonProgress    UserLessonProgress[]
  testResults       TestResult[]
  mistakeLogs       MistakeLog[]
  userBadges        UserBadge[]
}

// 2. Cổng Quản Lý Phụ Huynh
model ParentGate {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  pinHash                 String   // Mã PIN hash qua bcrypt
  parentEmail             String?
  parentPhone             String?
  dailyTimeLimitMinutes   Int      @default(30)
  emergencyContactEnabled Boolean  @default(true)
  weeklyReportEnabled     Boolean  @default(true)
  user                    User     @relation(fields: [userId], references: [id])
}

// 3. 10 Quần Xã Sinh Tồn (Zones)
model Zone {
  id          String   @id @default(cuid())
  zoneNumber  Int      @unique
  title       String
  description String
  iconName    String
  themeColor  String   @default("#004E89")
  unlockLevel Int      @default(1)
  stages      Stage[]
  badges      Badge[]
}

// 4. Các Ải Trong Quần Xã (Stages)
model Stage {
  id          String   @id @default(cuid())
  zoneId      String
  stageNumber Int
  title       String
  description String
  zone        Zone     @relation(fields: [zoneId], references: [id])
  lessons     Lesson[]
}

// 5. Bài Học & Câu Hỏi Phản Xạ (Lessons & Checkpoints)
model Lesson {
  id              String       @id @default(cuid())
  stageId         String
  lessonNumber    Int
  title           String
  description     String
  durationMinutes Int          @default(5)
  rewardXp        Int          @default(100)
  checkpoints     Checkpoint[]
}

model Checkpoint {
  id                 String         @id @default(cuid())
  lessonId           String
  checkpointNumber   Int
  title              String
  passScoreThreshold Int            @default(80)
  timeLimitSeconds   Int            @default(60)
  questions          TestQuestion[]
  testResults        TestResult[]
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
  options          QuestionOption[]
}

// 6. Kết Quả & Nhật Ký Lỗi Sai (Test Results & Mistake Logs)
model TestResult {
  id               String       @id @default(cuid())
  userId           String
  checkpointId     String
  score            Int
  isPassed         Boolean
  timeTakenSeconds Int
  mistakeLogs      MistakeLog[]
}

model MistakeLog {
  id               String   @id @default(cuid())
  testResultId     String
  userId           String
  questionId       String
  selectedOptionId String?
  responseTimeMs   Int
  miloGuidance     String
}
```

---

## 📡 6. DANH SÁCH REST API BACKEND

| Method | Endpoint | Mô Tả |
| :--- | :--- | :--- |
| **`GET`** | `/learning/journey-map?userId={id}` | Lấy bản đồ 10 Vùng đất và tiến độ các ải của học viên |
| **`GET`** | `/learning/checkpoints/:id?userId={id}` | Lấy bộ câu hỏi phản xạ của 1 checkpoint cụ thể |
| **`POST`** | `/learning/checkpoints/:id/submit` | Nộp bài kiểm tra trắc nghiệm phản xạ, chấm điểm & thưởng huy hiệu |
| **`POST`** | `/ai/scan-environment` | Upload ảnh (tối đa 4MB) để Gemini Vision AI quét nguy hiểm môi trường |
| **`POST`** | `/ai/chat` | Trò chuyện văn bản trực tiếp với Đội Trưởng Milo |
| **`GET`** | `/ai/health` | Kiểm tra trạng thái AI Engine & Gemini API Key |
| **`POST`** | `/parent/verify-pin` | Xác thực mã PIN 4 số của phụ huynh |
| **`POST`** | `/parent/update-pin` | Cập nhật mã PIN mới cho phụ huynh |
| **`POST`** | `/parent/emergency-alert` | Phát cảnh báo khẩn cấp SOS Live kèm tọa độ GPS |
| **`GET`** | `/parent/emergency-alerts?userId={id}` | Lấy lịch sử các cảnh báo khẩn cấp của bé |
| **`GET`** | `/parent/safety-report?userId={id}` | Lấy báo cáo thống kê an toàn và biểu đồ kỹ năng |
| **`POST`** | `/parent/settings` | Cập nhật giới hạn giờ chơi và thông báo khẩn cấp |

---

## ⚙️ 7. HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL (GETTING STARTED)

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18+ hoặc 20+
- **Package Manager**: `npm`

### Bước 1: Cài Đặt Dependencies
```bash
# Cài đặt backend dependencies
cd d:/kidproject
npm install

# Cài đặt mobile dependencies
cd d:/kidproject/mobile
npm install
```

### Bước 2: Khởi Tạo Cơ Sở Dữ Liệu
```bash
cd d:/kidproject
# Generate Prisma Client & Push SQLite Schema
npx prisma generate
npx prisma db push

# Nạp dữ liệu mẫu 10 Vùng đất & bài học
npm run prisma:seed
```

### Bước 3: Chạy Backend Server
```bash
cd d:/kidproject
npm run start:dev
# Backend chạy tại: http://localhost:3000
# Swagger API Docs: http://localhost:3000/api/docs
```

### Bước 4: Chạy Frontend Mobile (Expo Web)
```bash
cd d:/kidproject/mobile
npx expo start --web
# Giao diện mở tại: http://localhost:8081
```

---

## 🎯 8. GHI CHÚ QUAN TRỌNG CHO BƯỚC PHÁT TRIỂN TIẾP THEO

1. **Về Hình Ảnh Mascot Milo**:
   - Tất cả ảnh Milo hiện tại nằm tại `mobile/assets/` gồm 4 file PNG trong suốt $100\%$:
     - `milo_rescue_pup.png`: Dáng vẫy chào vui vẻ
     - `milo_thinking.png`: Dáng đưa tay lên cằm suy nghĩ + dấu hỏi
     - `milo_timing.png`: Dáng cầm đồng hồ bấm giờ
     - `milo_backpack.png`: Dáng cầm balo cứu hộ + ngón tay Like 👍
   - Khi tạo thêm tư thế mới, chỉ cần đặt ảnh PNG trong suốt vào thư mục `mobile/assets/` và gọi qua prop `customImage` của `MiloAvatar2D`.
2. **Về Spotlight Tour Guide**:
   - Sử dụng SVG Mask Cutout (`spotlightHoleMask`) trong `SpotlightTourGuide.tsx`.
   - Vùng spotlight được tính toán theo độ co giãn Flexbox của màn hình (`cw = Math.min(w - 40, 420)`), tuyệt đối không dùng tọa độ hardcode tĩnh để tránh lệch trên các thiết bị khác nhau.
3. **Về Kết Nối AI Gemini**:
   - Cấu hình biến môi trường `GEMINI_API_KEY` trong file `.env` ở thư mục gốc. Nếu chưa có key, hệ thống tự động chạy ở chế độ **Safe Fallback Engine** với dữ liệu kịch bản mẫu mà không gây crash ứng dụng.
