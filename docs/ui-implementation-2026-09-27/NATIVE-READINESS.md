# Milo — kiểm tra đường chạy iOS/Android, chặng V1

Ngày kiểm tra: **27/09/2026**. Phạm vi: đọc cấu hình/mã đang có và kiểm tra công cụ cục bộ trên máy Windows; không đọc `.env`, không cài/nâng thư viện, không tạo bản ký, không gửi mã lên dịch vụ build và không phát hành.

**Kết luận: hiện có thể tiếp tục làm và kiểm tra lát cắt giao diện trên web. Chưa có đủ công cụ để build Android tại máy này, và chưa có môi trường để build iOS tại chỗ. V1 mới hoàn thành khảo sát; gate “build native chạy được” CHƯA ĐẠT.**

## 1. Bằng chứng công cụ và cấu hình

| Mục | Kết quả quan sát | Ý nghĩa |
|---|---|---|
| Hệ điều hành | Windows, PowerShell | Có thể chuẩn bị Android local; iOS local cần máy macOS/Xcode |
| Node | `v24.19.0` | Công cụ JavaScript hiện có; chưa xác nhận bộ native toolchain với phiên bản này |
| Java | `java version 1.8.0_51`, Java Runtime Environment | Chỉ phát hiện JRE 8; không đủ cho đường Android hiện đại |
| JDK | Không tìm thấy `javac`; `JAVA_HOME` trống; thư mục Java thông thường chỉ có `jre1.8.0_51` | Cần JDK phù hợp; tài liệu Expo hướng dẫn JDK 17 |
| Android | Không tìm thấy `adb`, `emulator`, `gradle` trên PATH; `ANDROID_HOME`/`ANDROID_SDK_ROOT` trống | Chưa thể build/cài/thử Android trong phiên kiểm tra |
| Đường SDK thông thường | Không tồn tại `%LOCALAPPDATA%/Android/Sdk`, `C:/Program Files/Android/Android Studio`, `D:/Android`, `D:/Android/Sdk` | Không khẳng định máy hoàn toàn không có SDK ở một đường tùy chỉnh chưa khai báo; không có SDK sử dụng được đã xác minh |
| iOS | Không tìm thấy `xcodebuild`, `pod`; máy Windows | Không build iOS local ở máy hiện tại |
| Expo thực cài | `52.0.49`; React `18.3.1`; React Native `0.76.9` | Đọc trực tiếp package đã cài; chưa nâng SDK |
| Dự án native | Không có `mobile/android`, `mobile/ios` | Đây là dự án Expo chưa sinh native project tại workspace, không tự nó là lỗi |
| Development build | Chưa có `expo-dev-client` trong dependencies/thư mục cài | Chưa có dev client được kiểm chứng; thiếu package này không phải bằng chứng mọi kiểu native build đều bất khả thi |
| EAS | Chưa có `eas.json`, không tìm thấy `eas` trên PATH | Chưa xác minh tài khoản/cloud project/credentials; không khởi chạy cloud build |
| Định danh | iOS `com.kidssafe.explorer`, Android `com.kidssafe.explorer` | Có cấu hình, chưa xác nhận quyền sở hữu/đăng ký store |
| Màn hình | `orientation: portrait`, `ios.supportsTablet: true` | iPad vẫn nằm trong phạm vi khai báo, cần thử thực tế |

Lệnh kiểm tra chỉ đọc: tìm công cụ trên PATH, kiểm tra tồn tại các đường nêu trên, `java -version`, đọc JSON package/config và `EXPO_OFFLINE=1 expo install --check`. Lệnh cuối trả về **“Dependencies are up to date” đồng thời cảnh báo “Dependency validation is unreliable in offline-mode”**. Đây chỉ là kiểm tra phiên bản cục bộ, không phải build hay kiểm tra runtime.

Nguồn hướng dẫn công cụ: [Expo Android Studio Emulator](https://docs.expo.dev/workflow/android-studio-emulator/), [Expo iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/), [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/). Các trang hiện hành có thể mô tả SDK mới hơn; không sao chép yêu cầu compile/target SDK mới vào SDK 52 mà bỏ qua release notes.

## 2. Các điểm phải giải quyết trước native

| ID | Bằng chứng mã hiện tại | Ảnh hưởng và việc phải làm |
|---|---|---|
| N01 — Navigation | `mobile/package.json` dùng `@react-navigation/native` 6.x, native-stack thực cài 6.11.0; screens thực cài 4.4.0. README của screens đã cài, dòng 142, nêu v4 hỗ trợ native-stack v7 | Đây là cặp ngoài hỗ trợ được nhà cung cấp ghi nhận. Cần chốt và nâng đồng bộ navigation phù hợp trong nhánh/snapshot riêng, rồi build; không coi việc web mở được là bằng chứng native tương thích |
| N02 — Phiên và Origin | `FamilyAccessGuard` từ chối mọi mutation không có Origin thuộc allowlist, kể cả nộp bài nội bộ. API client chưa có giao thức native riêng. Đăng nhập dùng cookie HttpOnly/SameSite Strict | Native client phải có cơ chế phiên rõ ràng, được thử đăng nhập/đăng xuất/hết hạn/khởi động lại. Không gỡ kiểm tra Origin của web để làm native chạy. Nếu dùng token native, thiết kế phát hành/thu hồi/luân phiên token, nơi lưu an toàn và kiểm tra quyền ở server trước khi bật |
| N03 — Địa chỉ API | `api.ts` mặc định Android `http://10.0.2.2:3000`, nền tảng khác `http://localhost:3000`; có `EXPO_PUBLIC_API_URL`. Server `listen` tại `127.0.0.1` | Địa chỉ Android hiện tại hướng tới emulator, không phải mọi điện thoại. iPhone thật không truy cập được backend trên PC bằng localhost. Chọn đường debug riêng hoặc HTTPS staging trước khi thử máy; bản store dùng API HTTPS và không chứa khóa bí mật trong biến public |
| N04 — Giọng đọc | `voice.ts` chỉ thực hiện và báo khả dụng khi `Platform.OS === 'web'`, dùng `window.speechSynthesis`; chưa có expo-speech trong dependencies | Native hiện chưa có TTS hoạt động từ service này. Cần adapter native, kiểm tra giọng Việt có/không có, thao tác bật/tắt và dừng khi màn đóng/background; văn bản luôn dùng được |
| N05 — Hiệu ứng âm/rung | `sound.ts` tạo tiếng bằng Web Audio; nhánh native chỉ gọi haptics. `spatialHaptics.ts` có timer chưa quản lý toàn vòng đời và preference ở RAM | Cần audio adapter thực sự cho native nếu bật tiếng; kiểm kê asset âm, mute/volume riêng. Hủy nhịp rung/timer khi blur/background, lưu preference, tránh rung cảnh báo gây sợ. Việc đã cài expo-av không đồng nghĩa app đã phát âm native |
| N06 — Lưu và xuất dữ liệu | Luồng mới dùng AsyncStorage cho draft/queue theo userId. `exportFile.ts` trả `false` trên native. `FamilyScreen` có một số hành động tải file vẫn gọi helper web | Chưa có chia sẻ/lưu file native. Cần adapter export cùng thông báo thành công/thất bại thật. Không lưu credential mới vào AsyncStorage. Kiểm tra dữ liệu thiết bị/backup OS/xóa tài khoản theo chính sách trước bản công khai |
| N07 — Resume/ngoại tuyến | Queue hiện có serial Promise và Web Locks khi browser hỗ trợ; retry dựa timer/online event web. Mở bài vẫn cần xác nhận online theo version | Cần thử AppState, force-stop, mất mạng, chuyển hồ sơ, phiên hết hạn trên native. Không hứa “học hoàn toàn offline”. Native không có Web Locks của browser; đánh giá concurrency theo mô hình runtime thật |
| N08 — Quyền trong binary | Có expo-camera, expo-image-picker, expo-notifications và expo-av trong dependencies; màn scanner/SOS đang không khả dụng trong navigator | Ẩn route không chứng minh binary không chứa module/quyền. Rà manifest/Info.plist sinh ra, plugin, permission và privacy manifest sau prebuild; loại module không cần cho bản MVP có kiểm soát |
| N09 — Safe area/Back/tablet | Có SafeAreaProvider ở App nhưng Frame cũ dùng SafeAreaView từ react-native; orientation portrait, supportsTablet true | Thử notch, gesture bar, bàn phím, nút Back, chữ lớn, VoiceOver/TalkBack và iPad. Không đánh dấu đạt bằng kích thước browser giả lập |
| N10 — Icon/splash | Cấu hình trỏ tới icon/adaptive-icon/splash PNG 1024×1024, favicon 64×64. Chưa có native binary để xem mask/splash | Kích thước file có thật; chưa chứng minh hình crop đúng trên store/device. Ảnh cún cũ còn thiếu hồ sơ quyền theo sổ asset hiện tại; trước phát hành cần kiểm tra các asset thực sự được bundle |

Tham chiếu nội bộ: `mobile/src/navigation/AppNavigator.tsx`, `mobile/src/services/api.ts`, `mobile/src/services/voice.ts`, `mobile/src/services/sound.ts`, `mobile/src/services/spatialHaptics.ts`, `mobile/src/services/lessonDraft.ts`, `mobile/src/services/attemptQueue.ts`, `mobile/src/services/exportFile.ts`, `src/common/guards/family-access.guard.ts`, `src/modules/family/family.controller.ts`, `src/main.ts`, `mobile/assets/ASSET-SOURCES.md`. Đây là trạng thái khảo sát trước các thay đổi UI song song; khi hoàn tất lát cắt cần cập nhật trạng thái từng Nxx bằng kết quả thật.

## 3. Đường build khả thi tiếp theo

### Android trước, một lát cắt H01

1. Chốt SDK đích và cặp navigation được hỗ trợ; tạo snapshot/nhánh có khả năng quay lại. Nếu nâng Expo, nâng từng SDK và kiểm tra thay đổi tương thích; không cập nhật tất cả gói lên mới nhất trong đợt làm mỹ thuật. [Hướng dẫn nâng SDK của Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
2. Chuẩn bị JDK 17 và Android Studio/SDK theo SDK đã chốt, cấu hình môi trường, kết nối emulator hoặc máy Android được phép dùng. Đoạn khảo sát này chưa thực hiện cài đặt.
3. Chuẩn bị development build của dự án, sinh native project trong bản làm việc có snapshot; kiểm tra manifest và module trước khi cài. Có thể dùng Expo CLI `run:android` khi toolchain sẵn sàng. Không cần cài Gradle toàn cục nếu dự án dùng wrapper được sinh đúng.
4. Chốt API test và phiên native; dùng DB thử và dữ liệu tổng hợp. Hoàn thành map → H01 → nộp → nhận receipt → reload/resume. Giữ bài chưa duyệt ở chế độ nội bộ.
5. Ghi thiết bị, OS, build/hash, phiên bản SDK và log. Chỉ sau khi debug chạy mới tạo release build để đo startup/frame time/memory/pin; không lấy số đo web thay cho native.

### iOS

- Đường local: máy macOS với Xcode và dependencies iOS phù hợp, sau đó development build/simulator rồi iPhone thật.
- Đường cloud: EAS có thể biên dịch iOS từ máy Windows; cần chốt tài khoản, project, profile build, quyền gửi mã và credentials phù hợp. Chưa khởi tạo hoặc sử dụng dịch vụ đó trong đợt này. Có file build chưa đủ chứng minh trải nghiệm iPhone đạt. [Tài liệu development build](https://docs.expo.dev/develop/development-builds/introduction/)

Không có việc UI nào trong V2/V3 tự thay thế các điều kiện ký, tài khoản store, nội dung đã duyệt, thử thiết bị và hồ sơ riêng tư.

## 4. Biên bản nghiệm thu V1 cần bổ sung

| Bằng chứng cần có | Hiện tại |
|---|---|
| APK/development build cài và mở trên Android | CHƯA CÓ |
| Bản iOS cài và mở trên simulator/iPhone | CHƯA CÓ |
| Network/auth không cần nới quyền web, POST nộp bài thật thành công | CHƯA THỬ NATIVE |
| Receipt, draft, queue, đổi trẻ, đăng xuất/khởi động lại | CHƯA THỬ NATIVE |
| Giọng Việt, không có giọng, mute, rung, background/resume | CHƯA THỬ NATIVE |
| Navigation Back, safe area, font 200%, VoiceOver/TalkBack, bàn phím | CHƯA THỬ NATIVE |
| Permission/SDK inventory từ binary sinh thật | CHƯA CÓ |
| 20 vòng mở/đóng, 10 vòng background/resume, trace release | CHƯA CÓ |
| Icon/splash/adaptive mask nhìn đúng trên máy thật | CHƯA THỬ |

**Quyết định cho lát cắt giao diện hiện tại:** dùng React Native View/Text/Pressable, SVG và Animated cho hiệu ứng đơn giản; tránh đưa thêm runtime rig nặng khi chưa có kết quả native. Có thể xây adapter/state/lifecycle ở mức mã và kiểm tra web ngay. Chưa tuyên bố app đã sẵn sàng App Store/Google Play hoặc V1 đã qua gate.
