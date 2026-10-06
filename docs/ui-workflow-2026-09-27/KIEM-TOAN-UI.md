# Kiểm toán UI, đồ họa và chuyển động Milo

Ngày kiểm tra: 27/09/2026. Phạm vi: mã giao diện đang nối trong navigator, thành phần game cũ, tài nguyên, cấu hình mobile và bản web cục bộ. Không tuyên bố đã đọc một tỷ lần, tìm hết lỗi, đo FPS native hay thử với trẻ. Lần này chỉ tạo tài liệu và bằng chứng; không thay thiết kế hoặc logic ứng dụng.

## Kết luận thiết kế

Bản hiện tại chưa có trải nghiệm game thống nhất. Việc phục hồi ảnh Milo và đảo nổi giữ lại một phần diện mạo nhưng vẫn đặt danh sách thẻ bài lên nền bản đồ. Luồng chính chưa đi theo nhịp quan sát tình huống → hành động → thấy phản hồi → hiểu → tiến lên. Đây là nhận định thiết kế dựa trên ảnh và cấu trúc thực tế, không phải điểm số khảo sát người dùng.

Ảnh gốc `../audit-2026-09-26/map.png` có bản đồ liên tục, HUD gọn, đường đi, đảo và dock. Nên giữ hướng nghệ thuật và cách tổ chức không gian này. Những dữ liệu giả, lời khuyên chưa duyệt hoặc tính năng chưa hoạt động trong ảnh cũ không phải thứ cần khôi phục.

## Bằng chứng bố cục mới

Đo trên Edge, hồ sơ giả, bản web đang chạy; kích thước là CSS px, tọa độ từ mép trên viewport khi ở đầu trang. Không đại diện điểm ảnh vật lý iOS/Android. Không gửi đáp án trong lần đo này.

| Kích thước | Đỉnh nút đảo đầu tiên | Vị trí tìm bài | Tràn ngang |
|---|---:|---:|---|
| 320 × 568 | 726 | 2.213 | Không thấy |
| 390 × 844 | 699 | 2.165 | Không thấy |
| 768 × 1024 | 563 | 2.004 | Không thấy |
| 1440 × 900 | 563 | 2.004 | Không thấy |

Trong bài H01 ở 390 × 844, đỉnh đáp án đầu tiên tại khoảng 1.003 px. Bố cục có thể không tràn ngang nhưng vẫn khó dùng: thao tác chính nằm sâu, nhãn lặp và các khối có trọng lượng thị giác gần nhau.

Bằng chứng: [ui-evidence.json](ui-evidence.json), [map 390](current-map-390.png), [map 320](current-map-320.png), [bài học](current-lesson-390.png). Màn 1440 được giả lập kích thước trong trình duyệt, chưa phải kiểm tra đầy đủ bàn phím/chuột desktop. Một số route giữ DOM ẩn; không dùng tọa độ phần tử ẩn làm bằng chứng.

## Danh sách phát hiện

P0 = chặn phát hành/tư cách dự thi khi áp dụng; P1 = hỏng hoặc làm yếu rõ rệt luồng chính; P2 = độ hoàn thiện/khả năng duy trì. “Rủi ro” là việc cần đo/xác minh, không phải lỗi đã tái hiện.

| ID | Mức / loại | Bằng chứng và vấn đề | Việc cần làm |
|---|---|---|---|
| U01 | P1 / quan sát | `LearningFlow.tsx` và ảnh: phần đầu quá cao, lặp tên chủ đề, nhiều khung nối tiếp | HUD gọn; mục tiêu hiện tại và hành động chính trong vùng nhìn đầu |
| U02 | P1 / cấu trúc | `GameJourney.tsx`: một `View` + thẻ + nút cho từng bài, đường nối trang trí từng đoạn | Scene bản đồ liên tục, node dữ liệu thật, sheet nhiệm vụ khi chạm |
| U03 | P1 / quan sát | Tìm bài, tiếp tục và hàng đợi nằm sau cả bản đồ trong `LearningFlow.tsx` | Đưa tìm kiếm lên thanh công cụ; badge đồng bộ trên HUD, sheet chi tiết |
| U04 | P1 / mã | Nhãn tìm “tên hoặc chủ đề” nhưng `GameJourney` chỉ lọc trong zone đang chọn | Tìm toàn bộ chủ đề và nhảy đến đúng node; hoặc đổi rõ phạm vi |
| U05 | P1 / quan sát | `QuestScene` + `LessonGuide` + card câu hỏi xếp dọc; đáp án đầu dưới viewport | Tách nhịp đọc cảnh và nhịp chọn; một tác vụ chính mỗi nhịp |
| U06 | P1 / mã | Tình huống mới là chữ; ảnh suy nghĩ Milo dùng chung, chưa có cảnh cốc/thuốc/cửa hàng | Cảnh minh họa gắn đúng bài, hotspot hoặc lựa chọn theo nhân vật |
| U07 | P1 / mã | `GameJourney` dùng PNG tĩnh; phần rig/biểu cảm cũ không nối vào luồng mới | Một nhân vật có trạng thái idle, hướng dẫn, lắng nghe, phản hồi, nghỉ |
| U08 | P1 / quan sát | Navy, kem, xanh trời, emoji, SVG và icon chữ M cùng tồn tại thiếu quy tắc chung | Chốt art direction, model sheet Milo và bộ token trước khi vẽ thêm |
| U09 | P1 / mã | `AppNavigator.tsx` dùng `LearningFlow`; các file game cũ và minigame không tương đương tính năng đang chạy | Lập bảng route thật; không báo “đã khôi phục toàn bộ” khi chỉ tái dùng ảnh |
| U10 | P1 / mã | Dock game chưa gắn vào luồng mới; Inventory trỏ `UnavailableScreen` | Thiết kế bản đồ, bộ sưu tập, cha mẹ với đường đi thật; chưa làm thì không vẽ nút giả |
| U11 | P2 / mã | `COLORS`, `LearningUI`, `GameJourney` và màn cũ có màu/kích thước cứng độc lập | Một nguồn token; hệ thành phần có trạng thái và ví dụ |
| U12 | P1 / mã cũ, chưa tái hiện leak | `MiloAvatar2D`, `MiloSkeletalCharacter` tạo nhiều loop; effect không trả cleanup trong đoạn đã đọc | Trước khi bật lại: stop/cancel theo blur/unmount/background; đo listener/timer/memory |
| U13 | P1 / mã đang dùng | `BiomeBackground` đã stop khi unmount, nhưng chưa có chính sách giảm chuyển động và pause theo background/focus | Motion policy chung, chế độ tĩnh và tiết kiệm pin |
| U14 | P1 / chênh nền tảng | `voice.ts` chỉ báo khả dụng với speechSynthesis web; sound tạo oscillator web, native chủ yếu haptics | Adapter giọng đọc/âm thanh native; xác nhận giọng Việt, tắt âm và interruption |
| U15 | P1 / rủi ro mã cũ | `spatialHaptics.ts` có timeout nhiều nhịp không lưu để hủy, có rung mạnh kiểu cảnh báo | Controller chung, hủy theo vòng đời, mặc định phản hồi nhẹ; không rung dọa trẻ |
| U16 | P1 / mã | Chưa có một preference thống nhất cho nhạc, hiệu ứng, giọng đọc, rung, giảm chuyển động | Lưu theo phạm vi rõ, có ưu tiên cài đặt hệ điều hành, đồng bộ UI và engine |
| U17 | P0 trước phát hành / chưa xác minh | `ASSET-SOURCES.md` nói ảnh cũ không có hồ sơ quyền; ảnh đã được nối lại, tài liệu này còn mô tả bản xuất cũ | Sổ nguồn/quyền mỗi tài nguyên, cập nhật khi làm; chưa kết luận vi phạm hay đủ quyền |
| U18 | P2 / đo kích thước tệp | PNG Milo khoảng 982 KB và 834 KB; nhiều JPG/PNG trùng chủ đề | Phân lớp, cắt vùng trong suốt và xuất đúng cỡ; đo chất lượng trước giảm dung lượng |
| U19 | P1 / cấu hình | `app.json` cố định portrait, hỗ trợ tablet, icon/splash từ dấu M khác mascot; chưa có bằng chứng native | Quyết định tablet/rotation, launch assets đồng bộ; kiểm tra safe area và crop thật |
| U20 | P1 / rủi ro native | SDK 52/RN 0.76; không tìm thấy cấu hình EAS, dev-client trong package; API mặc định localhost/emulator | Spike build native; quyết định nâng phiên bản theo từng bước; endpoint HTTPS và phiên native |
| U21 | P0 nếu nộp Kids Category / mã | `LessonGuide` mở link ngoài bằng `Linking.openURL`; nhãn “dành cho người lớn” chưa phải parental gate | Đưa nguồn/liên kết ra ngoài vào khu cha mẹ có gate phù hợp; kiểm tra lại yêu cầu store |
| U22 | P1 / rủi ro kỹ thuật | Phiên `withCredentials` và một số cơ chế draft dựa web; chưa chứng minh hành vi native | Nghiệm thu auth/storage/queue trên native trước tuyên bố đa nền tảng |
| U23 | P1 / thiết kế nội dung | Minigame cũ có nội dung riêng trong mã, không có cùng hợp đồng scene/version bài mới | Viết adapter nhận nội dung đã duyệt; không thưởng từ animation callback |
| U24 | P1 / giới hạn bằng chứng | Ảnh, typecheck và E2E web không đo độ hiểu, motion sickness, pin hoặc GPU native | Thử thiết bị và người dùng có giám sát; ghi chưa thử khi chưa có |
| U25 | P0 với thiết kế Gemini trực tiếp cho trẻ / điều khoản | Gemini API có điều kiện tuổi và giới hạn API Client hướng đến người dưới 18 | Giữ API khỏi luồng trẻ; thẩm định kiến trúc trước thêm tính năng AI |
| U26 | P0 với nộp thi / thể lệ | Chưa có đề Audition, tư cách đội và xác nhận tái dùng dự án; công cụ ngoài môi trường bị giới hạn | Xác minh theo mục dự thi trong workflow; không lấy dự án có sẵn làm bằng chứng hợp lệ tự động |

U12/U15 đề cập thành phần cũ, không kết luận rằng luồng mới đang chạy chúng. U20/U22 là khoảng trống kiểm chứng, không khẳng định native chắc chắn hỏng. U21/U25/U26 cần đối chiếu nguồn chính thức ở workflow; chưa có lần nộp store hay bài thi nào được thực hiện.

## Không nên làm tiếp

Không thay từng màu theo cảm giác rồi gọi là redesign. Không ghép thêm hiệu ứng lên màn đọc chữ mà bỏ qua nhịp chơi. Không bật toàn bộ file game cũ để có nhiều tính năng hơn trước khi kiểm tra dữ liệu và nội dung. Không đánh đồng hồi quy kỹ thuật đạt với thẩm mỹ hoặc trải nghiệm đạt.

Hướng sửa: giữ tinh thần bản đồ phiêu lưu của bản gốc, dùng một lát cắt hoàn chỉnh để chốt bố cục, mỹ thuật, chuyển động và cách phản hồi; sau đó mới nhân ra toàn ứng dụng theo [workflow](WORKFLOW-UI-ANIMATION-MOBILE.md).
