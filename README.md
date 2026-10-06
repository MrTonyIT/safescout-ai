# Milo — KidsSafe AI (The Secret Explorer Academy)

Nền tảng học kỹ năng an toàn và phản xạ sinh tồn qua tình huống tương tác dành cho trẻ em (5–12 tuổi) cùng phụ huynh, tích hợp trợ thủ hoạt hình 3D **Đội Trưởng Milo (Captain Milo)** và động cơ đánh giá phản xạ.

> **Trạng thái phát triển**: Dự án đang ở giai đoạn **nghiên cứu & nguyên mẫu phát triển nâng cao (Advanced Research Prototype & Preview)**. Đã có bộ kiểm thử tự động nội bộ (70/70 tests đạt), giao diện web xem thử và 12 bài học nháp có nguồn đối chiếu. **Chưa phát hành chính thức cho cộng đồng**: Chưa có hội đồng chuyên gia sư phạm/y tế duyệt toàn bộ giáo trình thực tế và chưa nghiệm thu trên thiết bị di động thật (iOS/Android Native).

---

## 1. Tính năng đã triển khai & Giới hạn hiện tại

### Đã triển khai (Implemented & Verified)
- **Hệ thống nhân vật Đội Trưởng Milo (3D Mascot System)**:
  - 4 biểu cảm & tư thế tách nền trong suốt 100% (`mobile/assets/milo_rescue_pup.png`, `milo_thinking.png`, `milo_timing.png`, `milo_backpack.png`).
  - Hoạt hình nhún nhảy theo nguyên lý Disney/Duolingo (Squash & Stretch, Breathe Loop, Reaction Cues) tương thích 60FPS trên nền tảng Web & Mobile.
- **Quy trình Onboarding 4 bước (`OnboardingScreen.tsx`)**:
  - Bước 1: Chọn độ tuổi (5-6, 7-8, 9-10, 11+ Tuổi).
  - Bước 2: Nguồn biết đến (kèm tư thế Milo suy nghĩ).
  - Bước 3: Lựa chọn thời gian rèn luyện hàng ngày (15, 30, 45 phút kèm tư thế Milo cầm đồng hồ bấm giờ).
  - Bước 4: Kích hoạt Balo cứu hộ & thông báo (kèm tư thế Milo cầm Balo và ngón tay Like).
  - Lưu trạng thái hoàn tất vào `AsyncStorage` (`milo_has_onboarded_v1`).
- **Mặt nạ hướng dẫn Spotlight Tour (`SpotlightTourGuide.tsx`)**:
  - Công nghệ đục lỗ SVG Cutout Mask trong suốt 100% trên nền mờ tối `#071936` (opacity 0.84).
  - 3 tầng sóng hào quang Neon vàng (`aura1`, `aura2`, `aura3`) lan tỏa đồng tâm.
  - Tọa độ căn tâm thích ứng responsive trên cả màn hình di động và máy tính qua 5 bước: Ải 1, Thanh 10 Quần Xã, Tab Quét AI, Tab SOS, Tab Ba Mẹ.
- **Bản đồ thế giới 10 Quần xã (World Map & Journey)**:
  - Đường cong chữ S (Cubic Bezier) cuộn dọc 2200px nối qua các Ải sinh tồn.
  - Bục đảo nổi 2.5D dạng Vector SVG, hiệu ứng sóng radar đồng tâm tại ải hoạt động.
- **Cổng Phụ Huynh & Bảo mật gia đình (Family & Parent Gate)**:
  - Bàn phím số bảo vệ bằng mã PIN 4 chữ số (mã hóa mật khẩu bằng `bcrypt`).
  - Quản lý phiên đăng nhập, cookie an toàn, mã khôi phục một lần.
  - Hỗ trợ xuất và xóa dữ liệu theo chuẩn bảo vệ quyền riêng tư của trẻ.
- **Bộ 12 bài học nháp có đối chiếu nguồn (`content/milo-12/`)**:
  - 12 bài tình huống tiếng Việt và 24 câu hỏi phản xạ với dữ liệu nguồn từ các tổ chức an toàn (xem chi tiết tại `content/milo-12/sources.json` và `docs/research-2026-09-27/12-BAI-CHO-DUYET.md`).
- **Sao lưu & Phục hồi cơ sở dữ liệu**:
  - Tự động sao lưu SQLite có mã hóa và xác thực toàn vẹn (`scripts/encrypted-backup.cjs`).

### Giới hạn hiện tại (Current Limitations & Pending Work)
- **Chưa duyệt giáo trình chính thức**: Nội dung 12 bài nháp mới chỉ phục vụ kiểm thử nội bộ. Hệ thống chặn nội dung chưa được duyệt khỏi tài khoản gia đình thông thường.
- **Camera AI Vision & Trò chuyện**: API `/ai/scan-environment` và `/ai/chat` được tích hợp qua SDK `@google/genai` (Google Gemini 2.0). Nếu chưa cấu hình `GEMINI_API_KEY`, hệ thống tự động chạy ở chế độ **Safe Fallback Engine** (trả về dữ liệu kịch bản mô phỏng ngoại tuyến an toàn, không gọi API trả phí).
- **Phần cứng thiết bị thật (Native iOS/Android)**: Chưa đóng gói và nghiệm thu trên Google Play Store / Apple App Store; các kiểm thử hiện tại chạy trên môi trường Expo Web và bộ giả lập trình duyệt Chromium/Edge.

---

## 2. Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ chính |
| :--- | :--- |
| **Backend Framework** | NestJS 10.4.15 (Node.js 22 LTS) |
| **Cơ sở dữ liệu** | SQLite 3 (Dev/Preview) / PostgreSQL (Hỗ trợ cấu hình qua Prisma) |
| **ORM** | Prisma ORM 5.22.0 |
| **AI Vision Engine** | Google Gemini 2.0 Multimodal API (`@google/genai`) + Safe Fallback Mock |
| **Frontend Mobile/Web** | React Native 0.76.9 + Expo SDK 52 + React Native Web 0.19.13 |
| **Vector & Đồ họa** | `react-native-svg` 15.8.0, `lucide-react-native` |
| **Âm thanh & Rung** | `expo-av`, bộ âm thanh PCM nội bộ, `spatialHaptics` |
| **Kiểm thử tự động** | Node.js Test Runner tích hợp (`node --test`), Puppeteer/Chrome Browser Checks |

---

## 3. Cấu trúc thư mục (Directory Structure)

```text
kidproject/
├── .github/workflows/          # CI pipeline kiểm tra typecheck, test, build và browser check
├── content/milo-12/            # Dữ liệu 12 bài học an toàn nháp và nguồn tham chiếu
├── docs/                       # Tài liệu nghiên cứu, kiểm toán UI và bằng chứng kiểm thử
├── mobile/                     # Mã nguồn ứng dụng di động & web Expo React Native
│   ├── assets/                 # Hình ảnh mascot 3D trong suốt, icon, âm thanh
│   ├── src/components/         # UI components (Mascot, Spotlight, Island Nodes, Modals)
│   ├── src/screens/            # Các màn hình (Onboarding, WorldMap, QuestTest, Scanner, SOS)
│   ├── src/services/           # Logic client (API client, Voice TTS, Sound, Storage)
│   └── src/theme/              # Hệ màu sắc nhận diện thương hiệu
├── prisma/                     # Prisma schema, migration history và seed data
├── scripts/                    # Scripts tiện ích (preview runner, backup, review packet)
├── src/                        # Mã nguồn backend NestJS
│   ├── modules/ai/             # Gemini AI Vision & Safety Scanner
│   ├── modules/family/         # Quản lý tài khoản gia đình & xác thực
│   ├── modules/learning/       # Journey Map, bài học & chấm điểm phản xạ
│   ├── modules/parent/         # Cổng phụ huynh, mã PIN & phát cảnh báo SOS
│   └── modules/prisma/         # Kết nối cơ sở dữ liệu Prisma Service
├── test/                       # 70 bài kiểm thử tự động bao quát toàn bộ luồng nghiệp vụ
├── .env.example                # Mẫu biến môi trường an toàn
└── package.json                # Dependencies và câu lệnh scripts chính
```

---

## 4. Yêu cầu môi trường & Cài đặt (Prerequisites & Installation)

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 20 hoặc 22 LTS (khuyến nghị Node.js 22).
- **npm**: Phiên bản 10 trở lên.
- **Trình duyệt**: Google Chrome hoặc Microsoft Edge (nếu muốn chạy kiểm thử giao diện `npm run test:browser`).

### Bước 1: Sao chép mã nguồn & Cài đặt gói phụ thuộc
```bash
# Clone repository
git clone https://github.com/MrTonyIT/kidproject.git
cd kidproject

# Cài đặt thư viện Backend
npm ci

# Cài đặt thư viện Frontend Mobile
cd mobile
npm ci
cd ..
```

### Bước 2: Khởi tạo biến môi trường & Cơ sở dữ liệu
```bash
# Tạo file môi trường từ mẫu
cp .env.example .env

# Sinh Prisma Client
npm run prisma:generate

# Đẩy schema lên SQLite cục bộ
npm run prisma:push

# Nạp dữ liệu mẫu ban đầu
npm run prisma:seed
```

---

## 5. Chạy dự án & Xem thử (Running & Preview)

### Chế độ xem thử nhanh (Preview Mode)
Dự án có sẵn script khởi chạy độc lập một môi trường xem thử (tự động tạo database cô lập và khởi động web client):

```bash
# Xem thử giao diện bản đồ và trải nghiệm bài học
npm run preview:curriculum
```
Sau đó mở trình duyệt tại: **http://localhost:8081**

Để thử nghiệm tính năng tài khoản gia đình:
```bash
npm run preview -- --family
```

### Chạy đồng thời 2 terminal (Development Mode)
- **Terminal 1 (Backend NestJS)**:
  ```bash
  npm run start:dev
  # API chạy tại: http://localhost:3000
  # Swagger API Docs: http://localhost:3000/api/docs
  ```
- **Terminal 2 (Frontend Expo Web)**:
  ```bash
  cd mobile
  npx expo start --web
  # Web app chạy tại: http://localhost:8081
  ```

---

## 6. Kiểm thử tự động & Xác minh chất lượng (Testing & Verification)

Dự án có bộ kiểm thử tự động kiểm tra chặt chẽ các kịch bản logic an toàn:

```bash
# 1. Kiểm tra kiểu dữ liệu TypeScript toàn dự án (Backend)
npm run typecheck

# 2. Kiểm tra kiểu dữ liệu TypeScript (Frontend Mobile)
cd mobile && npx tsc --noEmit && cd ..

# 3. Chạy 70 bài kiểm thử logic (Workflow, Family HTTP, Backup, Curriculum, Audio, Maze)
npm test

# 4. Kiểm tra build sản phẩm Backend
npm run build

# 5. Kiểm tra build bản xuất Web Expo
cd mobile && npx expo export --platform web --output-dir ../scratch/ci-web && cd ..
```

### Kết quả kiểm thử thực tế đã chạy:
- `npm run typecheck`: **0 errors**.
- `mobile typecheck`: **0 errors**.
- `npm test`: **70 passing**, 0 failing (thời gian ~30s).
- `npm run build`: Build NestJS hoàn tất thành công.

---

## 7. Bằng chứng hình ảnh & Tài liệu tham chiếu (Evidence & Docs)

Các báo cáo kiểm thử và ảnh chụp màn hình thực tế được lưu trữ tại thư mục `docs/`:
- [`docs/ui-implementation-2026-09-27/STATUS.md`](docs/ui-implementation-2026-09-27/STATUS.md): Hiện trạng giao diện ải sinh tồn và các gate kiểm soát.
- [`docs/research-2026-09-27/12-BAI-CHO-DUYET.md`](docs/research-2026-09-27/12-BAI-CHO-DUYET.md): Chi tiết 12 bài học an toàn nháp và đối chiếu nguồn gốc.
- [`docs/completion-2026-09-27/VAN-HANH.md`](docs/completion-2026-09-27/VAN-HANH.md): Hướng dẫn vận hành và quản lý dữ liệu.

---

## 8. Giấy phép (License)

Hiện tại dự án **chưa có file LICENSE chính thức**. Toàn bộ quyền sở hữu mã nguồn thuộc về tác giả [@MrTonyIT](https://github.com/MrTonyIT).
