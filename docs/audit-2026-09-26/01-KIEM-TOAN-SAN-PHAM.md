# Kiểm toán KidsSafe AI — 26/09/2026

> Bản ghi trước đợt sửa đầu, giữ để truy vết. Trạng thái hiện tại và đối chiếu đủ 50 mục nằm trong [Báo cáo kiểm toán sau sửa](05-BAO-CAO-KIEM-TOAN-SAU-SUA.md). Không coi các phát hiện dưới đây là toàn bộ trạng thái hiện tại.

Mục tiêu: ứng dụng giáo dục an toàn hữu ích, đáng tin, dễ dùng và có thể lan tỏa trong cộng đồng. Không đánh giá theo tiêu chí luận án.

## Phạm vi và giới hạn

Đã đọc hồ sơ bàn giao, README, kiến trúc điều hướng, các màn chính và các luồng API/AI/PIN/SOS/chấm điểm/lưu trữ/ôn tập. Đã chạy Expo Web bằng Edge headless với hồ sơ trình duyệt riêng; đi qua onboarding, tour, bản đồ, chọn ải, câu hỏi, quét, balo, PIN, phụ huynh và SOS. Đã xem ảnh ở 390×844 và kiểm tra bản đồ khi đổi sang 320×568, 768×1024, 1440×900. Ảnh màn lớn là phép thử resize sau khởi tạo ở chiều rộng 390; chưa thay thế thử cold-start mọi kích thước.

Kiểm tra bổ sung: đã tải lại ứng dụng ở 320×568; [ảnh cold-start 320](map-cold320.png) xác nhận tên trẻ vẫn xuống dòng vụn và loa vẫn vượt mép thẻ, không chỉ do resize.

Trong lần duyệt này backend không chạy: giao diện quan sát là đường fallback, có chủ đích để kiểm tra trải nghiệm khi không kết nối được. Không gọi số khẩn cấp, không gửi cảnh báo ra ngoài, không gọi Gemini, không sửa dữ liệu DB hoặc mã sản phẩm. Các phép thử dịch vụ dùng dữ liệu giả lập và chặn API. Đã bổ sung tài liệu, ảnh và công cụ kiểm tra trong thư mục này.

Chưa kiểm tra iOS/Android thật, camera thật, chất lượng giọng đọc, phát âm thanh thật, giao thông báo thật, tải lớn, mức tiêu thụ pin, mọi bài học và mọi tổ hợp trạng thái. Chưa có pentest độc lập, kiểm toán pháp lý hay thẩm định y khoa. Không cam kết đã tìm hết lỗi.

Ký hiệu: **R** = tái hiện bằng chạy mã/giao diện; **C** = xác nhận cấu trúc mã, chưa kiểm tra đầu cuối; **V** = nhận xét từ ảnh đã xem; **T** = cần kiểm tra tiếp. P0 = ngăn phát hành chức năng liên quan; P1 = xử lý trước thử nghiệm cộng đồng có dữ liệu thật; P2 = cải tiến sau khi lõi đúng. Đây là mức ưu tiên của cuộc kiểm toán, không phải điểm chứng nhận.

## Kết luận

Điểm mạnh: có linh vật dễ nhận diện, bài học được tổ chức theo vùng, lựa chọn trả lời dạng thẻ, điều hướng cơ bản và cấu trúc backend chia mô-đun. Onboarding 390 px không tràn ngang; tour hiện có nút BỎ QUA, khác mô tả bàn giao cũ nói không thể bỏ qua.

Vấn đề trung tâm: fallback và dữ liệu trình diễn đang được trình bày như kết quả thật. Vì vậy ứng dụng có thể trông hoạt động tốt ngay khi dịch vụ nền lỗi. Cần sửa sự thật của trạng thái trước khi nâng cấp đồ họa hoặc quảng bá các tính năng bảo vệ trẻ.

## A. An toàn, quyền riêng tư và tính trung thực

| ID | Mức / bằng chứng | Phát hiện và tác động | Sửa / phép nghiệm thu |
|---|---|---|---|
| A01 | P0 R | `src/modules/parent/parent.service.ts`, `verifyPin`: PIN 1234 vượt PIN băm khác; đã thử PIN lưu 9876. | Xóa bypass, xác thực tài khoản; sai PIN bị từ chối ở mọi chế độ. |
| A02 | P0 R | `mobile/src/services/api.ts`, `verifyParentPin`: ngoại tuyến chấp nhận 1234/0000. | Không mở cổng phụ huynh khi xác thực thất bại; offline unlock phải có thiết kế riêng đã kiểm chứng. |
| A03 | P0 C | `parent.service.ts`: `getChildrenProfiles` trả toàn bộ users; chưa có family scope trong schema và các truy vấn đã đọc. | Ràng buộc quan hệ phụ huynh–trẻ; thử gia đình A đọc/sửa B phải bị chặn. |
| A04 | P0 C | `mobile/src/services/geo.ts`: thất bại vẫn `success:true`; `parent.service.ts` chỉ thêm RAM/log nhưng báo đã phát tới phụ huynh. | Trạng thái queued/accepted/delivered/acknowledged/failed riêng; không có receipt thì không nói đã nhận. |
| A05 | P0 C | `geo.ts`: nhánh native và lỗi định vị trả tọa độ TP.HCM cố định. Server dùng `latitude || default`, làm mất cả giá trị 0 hợp lệ. | Không biết vị trí → null + lý do; vị trí cũ có thời điểm/độ chính xác; kiểm tra biên tọa độ. |
| A06 | P0 C | `meshSos.ts`, `guardianRing.ts`: hẹn giờ và danh bạ mẫu đổi trạng thái như đã truyền/đã thông báo; SOS gọi trực tiếp. | Tắt trong bản cộng đồng hoặc tách diễn tập; chỉ hiển thị giao nhận từ kênh thật. |
| A07 | P0 R/C | `e2eeSecurity.ts`: Base64 thay mã hóa; payload hỏng vẫn verified. Phép thử ở lượt trước đọc được không cần khóa. Dashboard còn hiển thị nhãn E2EE. | Gỡ nhãn tới khi có thiết kế mật mã và quản lý khóa thật; bản mã bị sửa phải bị từ chối. |
| A08 | P0 R | `ai.service.ts` + fallback prompt: AI không hoạt động hoặc hazard sai enum bị chuyển SAFE. `api.ts` còn nói đã kiểm tra ảnh khi API lỗi. | UNKNOWN/UNAVAILABLE; không khen an toàn khi chưa phân tích; UI phân biệt lỗi và kết quả. |
| A09 | P0 C/V | `ScannerScreen.tsx` hiển thị tự động làm mờ dữ liệu nhạy cảm; `processImageAnalysis` gửi ảnh/Blob, chưa có bước làm mờ ở luồng đã đọc. | Gỡ lời hứa hoặc thực hiện và kiểm thử; preview ảnh và giải thích dữ liệu được gửi trước thao tác. |
| A10 | P0 C/V | `offlineStorage.ts` có “Certified by … MIT Media Lab”, AHA, UNICEF… và Inventory hiển thị `certifiedProtocol`. Chưa thấy giấy tờ chứng nhận trong hồ sơ. | Chỉ giữ chứng nhận có bằng chứng và phạm vi chính xác; tham khảo tài liệu không được gọi là được tổ chức chứng nhận. |
| A11 | P1 C | `learning.controller.ts`, controller AI/SOS nhận userId từ client; chưa thấy guard/session/ownership/rate limit tại app và module đã đọc. | Xác thực, phân quyền, hạn mức AI/upload và bảo vệ chi phí; kiểm tra truy cập trái quyền. |
| A12 | P1 C | PIN được đặt trong query báo cáo và route params; dashboard mặc định 1234. | Dùng session, tránh PIN trên URL/log/navigation, khóa lại khi phiên hết hạn. |
| A13 | P1 C | AI chỉ lọc email/điện thoại trong tin mới; lịch sử và nickname được chuyển tiếp riêng, ảnh có thể chứa người/vị trí. | Lập bản đồ dữ liệu, tối thiểu hóa, thời hạn lưu/xóa và kiểm soát truy cập; không gọi regex là tuân thủ pháp luật hoàn chỉnh. |
| A14 | P1 C | `survivalBlackout.ts` luôn báo 48 giờ, bộ đếm xung chỉ tăng theo timer. | Đổi thành chế độ giao diện tối; không dự báo pin hoặc phát GPS khi chưa đo/triển khai. |

## B. Học tập, tiến độ và dữ liệu

| ID | Mức / bằng chứng | Phát hiện và tác động | Sửa / phép nghiệm thu |
|---|---|---|---|
| B01 | P1 C | `WorldMapScreen.tsx:345` truyền `previewStage.id` làm checkpointId; backend tìm bảng Checkpoint. Mã seed tạo stage/checkpoint riêng. | API trả checkpointId đúng; đi qua mọi ải phát hành không được rơi sang câu mẫu. |
| B02 | P1 R | `api.ts:432`: số câu đúng bằng 0 bị `|| total` đổi thành tất cả đúng. Hai câu sai ngoại tuyến → 100%, passed. | Chấm theo đáp án hợp lệ; 0 đúng phải 0; không có bộ đề offline thì lưu chờ, không bịa kết quả. |
| B03 | P1 C | `QuestTestScreen.tsx` suy ra đúng bằng ID chứa `_a`; backend options dùng ID riêng. | Một hợp đồng chấm bài thống nhất; không suy đáp án từ tên ID. |
| B04 | P1 C | `HazardSortingGame.tsx:56` luôn gửi 100 dù `correctCount`; màn Quest bỏ qua tham số score và chọn option đầu. | Chấm theo hành động thật; sai hết không nhận lời khen hoàn thành chính xác; game và câu hỏi có dữ liệu kết quả riêng. |
| B05 | P1 R/C | `api.ts` mọi lỗi tải checkpoint quay về một bộ câu mẫu. Quan sát bài tiêu đề “Ranh giới…” nhưng câu là lạc rừng. | Phân biệt bộ bài có cache đúng ID/phiên bản với chưa tải; không âm thầm thay bài. |
| B06 | P1 R | Đổi PIN offline trả thành công, nhưng PIN mới 9876 bị từ chối. `updateParentSettings` cũng trả thành công offline không có lưu thay đổi tại hàm. | Chỉ báo đã lưu sau ghi bền vững; trạng thái pending/failed rõ. |
| B07 | P1 R | `offlineStorage` constructor ghi inventory mặc định mỗi lần nạp; thử tăng mảnh vùng 8 từ 0→1, nạp lại về 0. | Chỉ seed khi chưa có dữ liệu; migration có version; restart giữ tiến độ. |
| B08 | P1 C | Offline storage và SRS chỉ ghi localStorage ở web; native dùng RAM tại các mô-đun này. | Storage adapter bền vững trên từng nền tảng; restart native không mất bài/mảnh/ôn tập. |
| B09 | P1 C | Queue có enqueue/mark synced nhưng tìm kiếm chưa thấy worker gọi mark synced; API fallback thường nuốt lỗi nên Quest không vào catch enqueue. | Hàng đợi có retry/backoff/idempotency; thử mất mạng–đóng app–mở lại–kết nối lại. |
| B10 | P1 R/V | Báo cáo hiển thị mẫu 94%, BKT, SOS và ba hồ sơ có sẵn; `loadDashboardData` còn ghi đè dữ liệu nhận được bằng danh sách mẫu. | Người mới thấy chưa có dữ liệu; số liệu có nguồn sự kiện thật; không đánh đồng XP và năng lực an toàn. |
| B11 | P1 R | Streak khởi đầu 7; gọi hoàn thành hai lần cùng ngày thành 9. | Tính theo ngày địa phương, mỗi ngày tối đa một lần, bền vững qua restart. |
| B12 | P1 C | `learning.service.ts` thưởng XP/shard mỗi lần pass, `Math.max(score)` không so điểm cũ; chuỗi ghi chưa transaction. | Quy tắc thưởng công khai, best score đúng, request lặp không thưởng trùng; transaction và khóa duy nhất. |
| B13 | P1 C | Onboarding ghi `milo_child_profile_v1`, chưa thấy nơi đọc trong `mobile/src`; CURRENT_USER_ID và tuổi quét 7 cố định. | Hồ sơ hoạt động duy nhất nối tuổi/ngôn ngữ/bài học/tiến độ; tách dữ liệu theo trẻ. |
| B14 | P1 C | SleepLock xuất hiện qua nút mô phỏng dashboard; chưa thấy theo dõi thời lượng toàn ứng dụng. `0 || 30` làm mất cấu hình không giới hạn. | Timer thật nếu giữ tính năng; 0 được bảo toàn; đường trợ giúp vẫn truy cập được khi hết giờ học. |
| B15 | P1 C | Thời gian tổng bài ước tính từ câu cuối + số câu×5; timeout ghi cứng 7000. SRS chèn câu ngoài checkpoint trong khi server chỉ chấm tập câu checkpoint. | Tách session/attempt/review, đồng hồ rõ, không tính thời gian tải/nghe vào phản xạ; hợp đồng chấm riêng cho câu ôn. |
| B16 | P2 R/C | Cẩm nang offline trả 4 vùng dù mô tả 10; SRS chưa có dữ liệu trả mastery=100. | Hiển thị đúng phạm vi đã tải; chưa có dữ liệu không phải thành thạo. |

## C. Giao diện và khả năng tiếp cận

| ID | Mức / bằng chứng | Phát hiện | Hướng sửa |
|---|---|---|---|
| U01 | P1 V | 320 px: tên trẻ xuống dòng gần từng từ, XP bị bó hẹp, nút loa vượt mép thẻ; phần đầu chiếm khoảng 330/568 px. | Header gọn, tên một dòng, thống kê xuống hàng; tip thu gọn; kiểm tra 320 và font lớn. |
| U02 | P2 V/C | Desktop: header trải toàn màn, bản đồ hẹp ở giữa, nhiều khoảng trống; resize không tính lại hằng Dimensions tại module. | Container thống nhất hoặc layout desktop có chủ ý; dùng kích thước sống/onLayout. |
| U03 | P1 V/C | Nhãn dock 9 px; nhiều nhãn 9–11 px, in hoa, dày; biểu tượng phụ nhỏ. | Nhãn chính 12–14+, nội dung 16–18 theo thử nghiệm; hit area mục tiêu 48×48; không chỉ tăng icon. |
| U04 | P1 C/T | Tìm kiếm `mobile/src` chưa thấy accessibilityLabel/Role, reduced motion hay useWindowDimensions; có một hitSlop. | Thêm ngữ nghĩa, focus, đọc màn hình, giảm chuyển động; kiểm tra thủ công TalkBack/VoiceOver và bàn phím, không coi grep là chứng minh toàn bộ accessibility thất bại. |
| U05 | P2 V | Navy/neon ở màn chính, bản đồ trời xanh, bài học nền trắng; nhiều viền nổi/glow cạnh tranh. | Một hệ màu/bề mặt/chữ/nút; giữ thế giới vui, giảm khung trang trí; nhất quán giao diện học và điều hướng. |
| U06 | P1 V/C | Quét: nút SOI VẬT THỂ gọi mẫu nấm; import CameraView nhưng không render camera thật. Nhãn mẫu bị cắt. | Đổi tên thành “Thử tình huống” hoặc kết nối camera; mẫu không gây SOS thật; tên nguy cơ đọc đầy đủ. |
| U07 | P1 V | SOS: còi và trang trí ở trên; nút gọi cứu hỏa/y tế phía dưới cần cuộn tại 390×844. | Đưa hành động liên hệ chính lên đầu; trợ giúp trung tính, ít hoạt ảnh; giữ diễn tập tách biệt. |
| U08 | P1 V/C | Câu dài + đếm ngược 7 giây; nút minigame nổi hơn đáp án; chưa gắn thời điểm đếm với đọc xong. | Chế độ học không đếm ngược mặc định, tự bật thử thách; ưu tiên đọc/nghe hiểu, câu một ý, phản hồi giải thích. |
| U09 | P2 V/C | Onboarding hỏi nguồn giới thiệu trước bài học, không thấy nút quay bước trước; mặc định 30 phút dù 15 được gắn khuyên dùng. | Một bước học thử, thiết lập sâu cho phụ huynh; cho sửa/quay lại, không coi học lâu hơn là giỏi hơn. |
| U10 | P1 R | Icon, splash, adaptive-icon, favicon đều PNG 1×1 (70 byte). | Tạo bộ nhận diện thật đúng yêu cầu nền tảng đã chọn, kiểm tra bản cài. |
| U11 | P2 C/V | Thương hiệu/từ ngữ pha Việt–Anh, “lượng tử”, “2.5D”, BKT xuất hiện trong sản phẩm; có dấu vết cún/rái cá/gấu trong mã. | Chọn Milo nhất quán; ngôn ngữ theo người dùng; thuật ngữ kỹ thuật chỉ ở tài liệu cần thiết. |
| U12 | P1 C/T | Nhiều Animated.loop không thấy cleanup ở Onboarding/WorldMap/Milo; WorldMap subscribe i18n chưa trả unsubscribe. | Dừng khi blur/unmount; kiểm tra mở/đóng 20 lần và máy yếu. Chưa có bằng chứng FPS hay pin thực đo. |

## D. Nội dung, nền tảng và vận hành

| ID | Mức / bằng chứng | Phát hiện | Hướng sửa |
|---|---|---|---|
| O01 | P0 C + nguồn | Bài “Lightning Crouch” trong seed và fallback không phù hợp khuyến nghị NWS hiện hành. | Thẩm định nội dung, thay bài và đồng bộ bản offline; xem nguồn bên dưới. |
| O02 | P1 C/T | Nội dung nằm rải ở seed/API fallback/map tip/handbook/game/prompt. Hướng dẫn cứu hộ cần điều kiện áp dụng và độ tuổi nhưng nhiều câu tuyệt đối. | Một nguồn nội dung có phiên bản, người duyệt, nguồn, tuổi, điều kiện, ngày rà soát. Chưa kết luận toàn bộ các bài khác sai. |
| O03 | P1 C | `voice.ts` chỉ phát giọng trên web; âm thanh ở `sound.ts` dùng AudioContext web, native chủ yếu haptic. | Triển khai/kiểm tra TTS và SFX native nếu phát hành native; không gọi web emulator là test điện thoại thật. |
| O04 | P1 C/T | Theo `expo/bundledNativeModules.json` đang cài: notifications kỳ vọng ~0.29.14 nhưng khai báo ^57.0.13; AsyncStorage kỳ vọng 1.23.1 nhưng khai báo ^3.1.1. | Kiểm tra tương thích SDK và build thật; chưa khẳng định crash native khi chưa chạy. |
| O05 | P1 C | `ai/health` luôn ONLINE; chưa phản ánh model/key/provider lỗi. | Liveness/readiness riêng, health không lộ secrets, trạng thái degraded đúng. |
| O06 | P1 R/C | Lượt kiểm tra trước: typecheck hai phần đạt; npm test thiếu Jest. Script 13/13 kiểm bcrypt thay dịch vụ PIN, assert không làm fail process. | Bộ test hành vi và integration; CI thất bại thật khi sai; không dùng 13/13 để chứng nhận an toàn. |
| O07 | P1 T | Không thấy `.git`, `.github`, quy trình migration/release/restore/monitoring trong checkout đã duyệt. | Xác minh hệ quản lý hiện có; nếu chưa có thì bổ sung Git, staging, backup–restore, rollback, đầu mối sự cố. Không suy ra bên ngoài dự án không có. |
| O08 | P2 C | Có 5 ngôn ngữ trong service nhưng tìm thấy rất ít nơi gọi dịch; nhiều chuỗi cố định tiếng Việt. | Phát hành tiếng Việt hoàn chỉnh trước, ẩn ngôn ngữ chưa hoàn thiện; không chỉ đổi giọng TTS. |

## Bằng chứng chạy được

- [Kết quả kiểm tra lõi](core-results.json): chấm sai thành đúng, PIN, mất mảnh, streak, số vùng offline và kích thước asset.
- [Công cụ tái hiện lõi](core-check.cjs): chạy `node docs/audit-2026-09-26/core-check.cjs` từ thư mục dự án. Đây là trình tái hiện lỗi hiện tại, không phải bộ test hồi quy đã sửa lỗi.
- [Onboarding](onboarding.png), [tour có nút bỏ qua](tour.png), [bản đồ](map.png), [bản đồ cold-start 320](map-cold320.png), [tablet](size-768x1024.png), [desktop](size-1440x900.png).
- [Bài học](lesson.png), [quét](scanner.png), [balo](inventory.png), [PIN](parent-pin.png), [phụ huynh](parent-dashboard.png), [SOS](sos.png).

Ảnh chỉ là một thời điểm, không chứng minh hiệu năng, mọi nội dung cuộn hay mọi trạng thái. Trình duyệt headless có cảnh báo âm thanh/SVG/deprecation; chưa coi mọi cảnh báo đó là lỗi người dùng. Không đo FPS bằng cảm giác.

## Nguồn đối chiếu

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): tham chiếu về tương phản, reflow, focus, điều khiển và nội dung nhấp nháy. Mục tiêu 48×48 trong đặc tả là lựa chọn sản phẩm cho trẻ, không phải tuyên bố WCAG AA bắt buộc 48 px.
- [UNICEF — Guidance on AI and children](https://www.unicef.org/innocenti/reports/policy-guidance-ai-children): an toàn, riêng tư, minh bạch và quyền trẻ em. Không thay thế tư vấn pháp lý theo nơi phát hành.
- [NWS — Lightning crouch](https://www.weather.gov/safety/lightning-crouch): giải thích vì sao không tiếp tục khuyến nghị tư thế crouch như biện pháp bảo vệ đáng kể.

## Kiểm tra tiếp trước quyết định phát hành

Backend kết nối DB thật trên dữ liệu thử; khớp stage–lesson–checkpoint; mất mạng và retry; hai gia đình và nhiều trẻ; từng bài được duyệt; cấp/từ chối/rút quyền camera/notification/location; cold start và resume; tăng chữ; bàn phím; screen reader; flash/âm thanh/giảm chuyển động; Android giá thấp; Safari iOS; restore backup; chi phí AI; đường xóa tài khoản và dữ liệu. Không mở camera/SOS nhận diện nguy hiểm thật chỉ vì các màn mẫu nhìn đẹp.
