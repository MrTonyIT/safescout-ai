# Milo — route thực tế và tài nguyên của lát cắt UI

Ngày kiểm tra: **27/09/2026**. Đọc trực tiếp navigator, màn hình, renderer, file ảnh và các snapshot trong workspace. Tài liệu này mô tả mã đang được nối vào ứng dụng; không tự xác nhận bản store, quyền tài sản hay việc mọi màn đã qua kiểm thử.

## 1. Màn nào thực sự đang chạy

Nguồn quyết định: `mobile/src/navigation/AppNavigator.tsx`. Tên route cũ không có nghĩa component cũ vẫn chạy.

| Route | Component thực tế | Phạm vi hiện tại |
|---|---|---|
| `Onboarding` | `WelcomeScreen` trong `LearningFlow.tsx`, hoặc `FamilyScreen` khi server mở chế độ gia đình | Bản nội bộ dùng màn chào có Milo và nhãn thử nghiệm; chế độ gia đình dùng thiết lập/đăng nhập thật |
| `WorldMap` | `LearningHomeScreen` trong `LearningFlow.tsx` | Giao diện mới dùng `GameShell`, `JourneyMap`, tìm bài, tiếp tục, tình trạng bài chờ gửi |
| `QuestTest` | `LessonScreen` trong `LearningFlow.tsx` | Cảnh mở đầu → lựa chọn → kết quả/lời giải; có `LessonScene` riêng cho H01 và `ResultSummary` |
| `Family` | `FamilyScreen` khi server mở gia đình, ngược lại `UnavailableScreen` | Chưa được thay toàn bộ bằng hệ mỹ thuật game mới |
| `Scanner`, `Inventory`, `Sos`, `ParentAuth`, `ParentDashboard` | `UnavailableScreen` | Chưa mở; không phải scanner, kho đồ, cứu hộ hay dashboard cũ đang hoạt động |

Các file `WorldMapScreen.tsx`, `QuestTestScreen.tsx`, `OnboardingScreen.tsx`, `InventoryScreen.tsx`, `ScannerScreen.tsx`, `SosScreen.tsx` và hai màn Parent cũ vẫn còn. Navigator hiện không dùng chúng để thực hiện tính năng tương ứng. Các minigame cũ cũng chưa được nối lại vào luồng học.

## 2. Sổ renderer và tài nguyên đang dùng

| Tài nguyên / renderer | Nguồn quan sát và nơi dùng | Trạng thái cần hiểu đúng |
|---|---|---|
| `components/game/LessonScene.tsx` | Tranh SVG mới viết bằng mã trong đợt này; phòng khách, cốc nóng, sách, trẻ và người lớn; dùng trong `LessonScreen` khi scene là `home-hot-cup` | Một cảnh H01 với hai biến thể `observe`/`help`, không phải 12 cảnh đã vẽ xong. Không tải ảnh ngoài, không có hotspot chấm đáp án. Hình có ý nghĩa an toàn vẫn cần duyệt cùng bài |
| Hàm `Scenery` trong `components/game/JourneyMap.tsx` | SVG cảnh trời, đồi, cây, mây mới viết trong đợt này; đường hành trình cũng vẽ bằng SVG | Đây là hàm nội bộ, không có file riêng tên `Scenery.tsx`. Cảnh tĩnh, không phải engine 3D hay hoạt cảnh đã đo 60 fps |
| `components/CartoonIslandStageNode.tsx` | SVG đảo nổi kế thừa từ dự án; `JourneyMap` gọi lại để thể hiện chặng | Giữ chi tiết đảo quen thuộc. Có trong snapshot ban đầu, nhưng điều đó không tự chứng minh lịch sử tác giả/quyền ngoài dự án; cần hồ sơ chủ dự án trước phát hành |
| `components/game/MiloCompanion.tsx` | Renderer mới, React Native Animated; dùng ở map, cảnh chung và kết quả | Sáu **trạng thái trình bày** dựa trên **hai ảnh PNG có sẵn**, không phải sáu pose mới hoặc rig xương sáu trạng thái |
| `assets/milo_rescue_pup.png` | 1024×1024, **982.214 byte**; pose chính của MiloCompanion và ảnh màn chào | Ảnh kế thừa, chưa có thêm chứng cứ tác giả/giấy phép. Quyền phát hành **CHƯA XÁC MINH** |
| `assets/milo_thinking.png` | 1024×1024, **834.390 byte**; pose suy nghĩ/giải thích của MiloCompanion | Ảnh kế thừa, chưa có thêm chứng cứ tác giả/giấy phép. Quyền phát hành **CHƯA XÁC MINH** |
| `components/game/GameKit.tsx` | Bộ màu, nút, khung, khoảng cách/chữ và safe area mới cho lát cắt | Bộ UI dùng chung bước đầu; chưa áp cho toàn bộ màn cũ và khu gia đình |
| `components/game/ResultSummary.tsx` | Vòng điểm SVG, icon sao, Milo và trạng thái receipt | Hình dùng số liệu kết quả server; kết quả nội dung đã rút dùng trạng thái lịch sử, không nhận thưởng giả |
| Icon `lucide-react-native` | Icon điều hướng/chủ đề/sao/trạng thái đã có trong thư viện cài | LICENSE cục bộ ghi ISC và phần kế thừa Feather/MIT; cần giữ notice tương ứng khi phân phối. Không phải icon vẽ riêng cho toàn bộ Milo |
| `assets/milo-mark.svg`, icon/adaptive-icon/splash/favicon PNG | Bộ dấu M/sách từ đợt trước, cấu hình trong `app.json` vẫn tham chiếu PNG | Chưa đồng nhất hoàn toàn với mascot cún; chưa kiểm tra mask/splash trên bản cài. Không gọi đây là bộ store assets hoàn thiện |

Các tranh SVG mới là sản phẩm mã trong workspace của đợt triển khai; không sử dụng hình sách/nhân vật của tổ chức giáo dục làm tài sản giao diện. Nhận định này không thay việc chủ dự án duyệt mỹ thuật, nội dung và hồ sơ phát hành.

**Cập nhật sổ nguồn:** `mobile/assets/ASSET-SOURCES.md` đã được sửa để phản ánh hai ảnh Milo đang nằm trong bundle. Phiên bản trước nói chỉ có icon chữ M là mô tả trước khi phục hồi game, không còn mô tả bản hiện tại.

## 3. Sáu trạng thái Milo thực chất là gì

| State | Ảnh nguồn | Hành vi trong renderer |
|---|---|---|
| `idle` | `milo_rescue_pup.png` | Nhịp dịch chuyển/co giãn nhỏ có khoảng nghỉ |
| `guiding` | `milo_rescue_pup.png` | Phản ứng ngắn khi đổi state |
| `thinking` | `milo_thinking.png` | Nhịp nhỏ có khoảng nghỉ |
| `encouraging` | `milo_rescue_pup.png` | Phản ứng nhẹ khi đổi state, không tự cấp XP |
| `explaining` | `milo_thinking.png` | Phản ứng ngắn khi đổi state |
| `paused` | `milo_rescue_pup.png` | Tĩnh |

Renderer đọc giảm chuyển động, `active`, `visible` và AppState; có cleanup animation và fallback chữ “Milo” khi ảnh lỗi. Đây là bằng chứng thiết kế mã, chưa tự chứng minh vòng đời trên mọi thiết bị. Các state có trong API không có nghĩa tất cả đã xuất hiện ở mọi màn. Phiên bản này chưa có lip-sync, rig mặt hay sáu ảnh biểu cảm độc lập.

Panel `ExperienceSettings` có giảm chuyển động; tiếng hiệu ứng và rung mặc định báo chưa dùng trong bản thử. Giọng đọc câu hỏi là điều khiển riêng của luồng học; chưa gọi tổng thể audio native đã hoàn thành.

## 4. Phần legacy được giữ, chưa chạy trong lát cắt

- `GameJourney.tsx` là bản map/mission header phục hồi trước; `LearningFlow.tsx` hiện nhập map mới từ `components/game/JourneyMap`.
- Các renderer `MiloAvatar.tsx`, `MiloAvatar2D.tsx`, `MiloSkeletalCharacter.tsx` và hệ `BiomeBackground`, `BiomeDecorations`, `FloatingParticles` không được nhập bởi bộ game mới hiện tại.
- Các minigame `SmokeEscapeMazeGame`, `HazardSortingGame`, `FirstAidBandageGame`, dock/header cũ, treasure chest và overlay diễn tập vẫn còn mã. Chưa nên quảng bá là đã hoàn thiện/tích hợp chỉ vì tồn tại file.
- Ảnh `milo_backpack`, `milo_timing`, các biến thể JPG và rescue-pup-v2 vẫn còn trong assets; không được hai đường màn mới/MiloCompanion nhập. Chưa có native binary để kết luận thành phần asset chính xác trong bản store.

## 5. Baseline còn nguyên để đối chiếu

Đợt kiểm kê này không sửa hoặc xóa snapshot. Đường dẫn đã kiểm tra tồn tại:

| Vị trí | Nội dung / bằng chứng |
|---|---|
| `D:/kidproject/scratch/workflow-baseline-2026-09-26T11-18-01-319Z/` | Snapshot giai đoạn đầu, có `manifest.json`. Kiểm tra lại **85 file được kê: 85 khớp SHA-256, 0 sai khác** so với manifest. Đây là kiểm tra tính nguyên vẹn snapshot, không nói mã hiện tại giống snapshot |
| `D:/kidproject/scratch/before-completion-2026-09-27/` | Bản trước đợt hoàn thiện: có mobile, prisma, scripts, src, test |
| `D:/kidproject/scratch/before-game-restoration-2026-09-27/` | Có AppNavigator, LearningFlow, LearningUI trước phục hồi game |
| `D:/kidproject/scratch/before-ui-workflow-2026-09-27/` | Có GameJourney, LearningFlow, LearningUI trước lát cắt UI mới; là điểm so sánh trực tiếp của đợt này |
| `D:/kidproject/docs/ui-workflow-2026-09-27/` | Ảnh map 320/390/768/1440, lesson 390, `ui-evidence.json` từ kiểm toán trước |
| `D:/kidproject/docs/game-restoration-2026-09-27/game-map-390.png` | Ảnh bản đồ ở lần phục hồi trước |

Không restore cả snapshot cũ lên dữ liệu/schema hiện tại chỉ để quay lại giao diện. Nếu cần quay presentation, chọn đúng file/component và giữ hợp đồng ID, version, receipt, quyền và queue đã sửa.

## 6. Gate trước mở rộng/phát hành

Đã có: route map rõ, một cảnh H01 riêng, cảnh map, renderer Milo thống nhất cho lát cắt và snapshot đối chiếu. Còn thiếu: chủ dự án chốt ba màn, hồ sơ quyền hai ảnh Milo, bộ pose/model sheet hoàn chỉnh, cảnh riêng cho 11 bài còn lại, icon/splash thống nhất, ghi nhận nội dung minh họa được duyệt và kiểm thử native/thiết bị. Không gắn dấu “đủ quyền phát hành” hoặc “đã hoàn thành đồ họa toàn app” khi các mục đó chưa có bằng chứng.
