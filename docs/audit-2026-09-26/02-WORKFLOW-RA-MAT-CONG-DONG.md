# 
- Đánh giá kênh giới thiệu bằng số gia đình bắt đầu/hoàn thành bài, quay lại tự nguyện, giới thiệu cho gia đình khác; không chỉ lượt xem.
- Cải tiến mỗi chu kỳ 2 tuần; theo dõi sự cố, lý do bỏ cuộc và nội dung bị báo.
- AI/notification/native mở theo feature gate riêng; không gộp tất cả vào một đợt ra mắt.

## 4. Tiêu chí nghiệm thu cụ thể

| Mã | Tình huống | Kết quả phải đạt |
|---|---|---|
| Q01 | Người mới mở ứng dụng | Không sẵn XP, huy hiệu, streak, cảnh báo hoặc tỷ lệ năng lực giả |
| Q02 | Sai toàn bộ / bỏ trống bài | Không được pass hoặc khen thành thạo |
| Q03 | Chọn đúng đáp án sau khi đổi thứ tự/ID | Chấm đúng theo dữ liệu nội dung |
| Q04 | Gửi bài hai lần hoặc timeout rồi retryWorkflow đưa KidsSafe AI thành sản phẩm cộng đồng đáng tin

Ngày lập: 26/09/2026. Căn cứ: [kiểm toán và sổ lỗi](01-KIEM-TOAN-SAN-PHAM.md), [đặc tả giao diện](03-GIAO-DIEN-VA-NGHIEM-THU.md). Các mốc dưới đây là đề xuất, chưa phải tính năng đã sửa hay kết quả đã đạt.

## 1. Quyết định sản phẩm

Lời hứa bản đầu: **Milo giúp trẻ học kỹ năng an toàn qua tình huống ngắn, cùng cha mẹ thực hành.** Không quảng bá khả năng cứu hộ tự động hay xác nhận môi trường an toàn khi chưa có năng lực đó.

Đề xuất phạm vi ban đầu: tiếng Việt, trẻ 7–10 tuổi với phụ huynh cùng sử dụng; sau pilot mới mở rộng cách trình bày cho 5–6 và 11–12 tuổi. Đây là cách giảm phạm vi triển khai, không phải kết luận trẻ khác không thể học.

Ưu tiên web responsive để chia sẻ đường dẫn dễ; vẫn kiểm tra trên điện thoại thật. Chốt mức offline thực sự trước khi hứa dùng không mạng. Android/iOS native là mốc riêng sau khi sửa phụ thuộc và hoàn thiện audio/storage/permission. Chưa tự triển khai hay phát hành ra ngoài trong công việc kiểm toán này.

| Giữ và làm tốt | Tạm ẩn hoặc chỉ để trong diễn tập có nhãn | Mở sau khi đủ bằng chứng |
|---|---|---|
| Milo, bài học ngắn, bản đồ, lời giải, huy hiệu thật, cẩm nang đã duyệt, góc cha mẹ | BLE mesh mẫu, pin 48h giả định, BKT mẫu, tọa độ/SOS mẫu, danh bạ giả, nhãn chứng nhận không có hồ sơ | Camera AI, chuyển cảnh báo từ xa, cá nhân hóa sâu, nhiều ngôn ngữ, nền tảng native |

MVP đề xuất: 12 bài đã duyệt thuộc 3 chủ đề gần gũi (an toàn tại nhà, tìm người lớn trợ giúp, bảo vệ cơ thể), thay vì giữ lời hứa 100 bài chưa được kiểm tra đồng đều. Người duyệt nội dung quyết định bài nào phù hợp phát hành đầu.

## 2. Chu trình làm việc bắt buộc cho mỗi thay đổi

`Vấn đề có bằng chứng → hành vi mong muốn → thiết kế trạng thái → thực hiện → kiểm tra → dùng thử → phát hành nhỏ → theo dõi → cải tiến`

Mỗi ticket có ID, người chịu trách nhiệm, mức ưu tiên, phụ thuộc, ảnh/video hoặc log tái hiện, tiêu chí chấp nhận, cách rollback và bằng chứng đã kiểm tra. Không đóng ticket chỉ vì giao diện không báo lỗi.

Một thay đổi giao diện phải có loading/empty/error/offline/success/disabled nếu các trạng thái đó áp dụng. Một thay đổi dữ liệu phải xét retry, request trùng, restart, chuyển hồ sơ và phiên bản nội dung. Không bắt viết test hình thức cho mỗi chỉnh màu; tập trung kiểm thử tự động vào các hành vi dễ gây sai hoặc mất dữ liệu.

Người phụ trách tối thiểu: chủ sản phẩm, kỹ sư triển khai, thiết kế/UX, người duyệt nội dung an toàn, người kiểm thử. Một người có thể kiêm vai, nhưng nội dung an toàn cần người có chuyên môn phù hợp và bằng chứng duyệt. Bản dùng thử với trẻ cần phụ huynh đồng ý và giám sát; không tạo tình huống nguy hiểm thật để kiểm tra.

## 3. Các chặng và điều kiện qua chặng

### G0 — Chốt phạm vi và đóng băng lời hứa sai

**Đầu vào:** sổ lỗi, mã hiện tại. **Chủ trì:** sản phẩm + kỹ thuật.

- Lập snapshot/nhánh trước thay đổi; kiểm tra hệ quản lý phiên bản; không đưa `.env`, DB hay hồ sơ trẻ vào Git.
- Lập bảng tính năng thật/demo/chưa có; cờ tính năng cho scanner, SOS từ xa, BKT, đa ngôn ngữ.
- Xóa khỏi bản phát hành các trạng thái thành công giả, chứng nhận chưa có hồ sơ, dữ liệu demo trộn dữ liệu thật.
- Chốt nhóm tuổi, 12 bài, kênh web đầu tiên, người duyệt nội dung và giới hạn chi phí vận hành.

**Đầu ra:** phạm vi một trang, danh sách claims được phép, backlog P0/P1, đường dẫn chạy cục bộ.

**Gate:** mỗi lời hứa trên màn hình có chức năng thật hoặc đã ẩn; demo tách dữ liệu và có nhãn không thể nhầm. Xử lý A04–A10, A14, B10 trước khi mời gia đình nhập dữ liệu thật.

### G1 — Sửa tính đúng đắn của lõi

**Phụ thuộc:** G0. **Chủ trì:** kỹ thuật.

- Nối đúng zone→stage→lesson→checkpoint; trả ID và version rõ từ API.
- Một quy tắc chấm điểm cho online/offline đã tải, đáp án đảo thứ tự không đổi kết quả.
- Mỗi lần làm có attemptId; nộp lại không thưởng hai lần; giữ điểm tốt nhất theo quy tắc đã chốt.
- Thay inventory khởi tạo ghi đè bằng seed-once + migration; mọi dữ liệu scoped theo childId.
- Đồng bộ hàng đợi bền vững; lỗi 401/403/404/timeout không bị biến thành kết quả mẫu.
- Sửa minigame, streak, báo cáo, đổi PIN và cài đặt; nếu chức năng chưa hoàn thiện thì ẩn.

**Đầu ra:** luồng học trọn vẹn thực hiện với dữ liệu thật trong môi trường thử, schema/hợp đồng dữ liệu và các test hồi quy có ý nghĩa.

**Gate:** sai hết nhận 0; đúng hết đúng điểm; vào bài đúng ID; reload giữ tiến độ; offline→online không mất/nhân đôi; hồ sơ B không nhận huy hiệu của A. Các mục B01–B15 được xử lý hoặc loại khỏi phạm vi phát hành.

### G2 — Bảo vệ tài khoản, dữ liệu và nội dung

**Phụ thuộc:** G0; có thể làm cùng G1 nếu phân công rõ. **Chủ trì:** kỹ thuật + người duyệt nội dung.

- Bỏ PIN mặc định/bypass; phiên đăng nhập và quyền phụ huynh–trẻ; giới hạn thử và hạn mức API.
- Không truyền PIN qua URL; không log ảnh, vị trí hoặc nội dung nhạy cảm không cần thiết.
- Lập sổ dữ liệu: trường nào, mục đích, nơi lưu, ai được đọc, thời hạn lưu, cách xóa.
- Mỗi bài có nguồn, reviewer, ngày duyệt, tuổi, điều kiện áp dụng, version; trạng thái draft/reviewed/published/withdrawn.
- Thay nội dung trùng rải rác bằng một nguồn xuất ra online/offline; bản bị rút phải có quy trình cập nhật.
- Nếu chưa xử lý ảnh riêng tư và UNKNOWN đúng, scanner không nằm trong bản thử cộng đồng.

**Đầu ra:** cơ chế quyền đã thử, thông báo riêng tư dễ đọc, 12 bài được duyệt, danh mục dữ liệu và quy trình rút nội dung.

**Gate:** A01–A03/A11–A13 không còn ở phạm vi phát hành; không truy cập chéo gia đình; xóa dữ liệu được thử; không còn claim chứng nhận không chứng minh được. Nội dung nhạy cảm phải có người duyệt thật, không để AI tự duyệt cho chính mình.

### G3 — Thiết kế và xây lại trải nghiệm cốt lõi

**Phụ thuộc:** G0 để biết phạm vi; nối dữ liệu sau G1. **Chủ trì:** UX + kỹ thuật.

- Dựng design tokens và 8 thành phần chuẩn: nút, thẻ bài, lựa chọn, header, navigation, feedback, sheet/modal, trạng thái hệ thống.
- Làm một lát cắt hoàn chỉnh: bắt đầu→học bài→trả lời→hiểu vì sao→lưu tiến độ→cha mẹ xem.
- Đánh giá lát cắt trước khi áp sang mọi màn; dùng ảnh trước/sau cùng viewport và cùng dữ liệu.
- Sửa 320 px, tablet, desktop; chữ lớn, vùng chạm, focus, screen reader, giảm chuyển động.
- Hoàn thiện Milo nhất quán, icon/splash thật, tài nguyên tối ưu; không thêm hiệu ứng để che luồng hỏng.

**Đầu ra:** bộ giao diện chạy được và ma trận màn/trạng thái trong tài liệu 03.

**Gate:** hành động chính thấy và hiểu; không chữ vụn/che nút; cỡ chữ 200% vẫn thực hiện được tác vụ; điều hướng có nhãn; trạng thái chưa có dữ liệu trung thực. Không cần tuyên bố đạt WCAG toàn bộ khi chưa có kiểm toán tương ứng.

### G4 — Kiểm tra toàn hệ thống và chuẩn bị vận hành

**Phụ thuộc:** G1, G2, G3. **Chủ trì:** kiểm thử + kỹ thuật.

- Build phát hành từ cài đặt sạch; kiểm tra phụ thuộc theo Expo SDK đã chọn, không nâng mọi gói lên mới nhất một cách mù quáng.
- Bộ test tự động chạy trong CI; lỗi phải làm CI thất bại. Unit cho scoring/state; integration cho quyền/DB/queue; E2E cho một hành trình chính.
- Thử thực tế trên Android giá thấp, iPhone Safari và desktop; bản native cần build riêng.
- Kiểm tra retry, app background/foreground, dữ liệu cũ, nhiều trẻ, từ chối quyền, lỗi server, giọng đọc không có.
- Logging đã giảm dữ liệu nhạy cảm; health đúng; ngân sách AI; backup và restore; rollback bản ứng dụng và nội dung.

**Đầu ra:** biên bản thiết bị, ảnh, log, kết quả test; hướng dẫn phát hành/khôi phục.

**Gate:** 0 lỗi P0 mở; không còn P1 làm hỏng luồng chính; khôi phục thử thành công; chủ sản phẩm biết cách tắt tính năng có sự cố. Hiệu năng đánh giá bằng bản phát hành, không dùng ảnh dev để kết luận 60FPS.

### G5 — Pilot cộng đồng có giám sát

**Phụ thuộc:** G4. **Chủ trì:** sản phẩm + người hỗ trợ cộng đồng.

- Đề xuất 10–20 gia đình và 2–3 giáo viên, tự nguyện; đây là pilot tìm lỗi/khó dùng, không phải cỡ mẫu chứng minh hiệu quả khoa học.
- Nhiệm vụ: tìm bài, hoàn thành một bài, giải thích lại một lựa chọn, cha mẹ xem tiến độ, gửi phản hồi.
- Quan sát khi được đồng ý; ưu tiên ghi lỗi/tác vụ thay vì video khuôn mặt hay thông tin riêng của trẻ.
- Thu ý kiến: chỗ không hiểu, quá khó, gây sợ, phụ huynh có tin nhầm khả năng của ứng dụng không.
- Mỗi tuần triage: an toàn/quyền riêng tư ngay; lỗi học và dữ liệu tiếp theo; thẩm mỹ sau.

**Đầu ra:** danh sách vấn đề thật, ảnh đã ẩn dữ liệu khi cần, bản sửa và kiểm tra lại.

**Gate đề xuất:** ít nhất 8/10 cặp trẻ–phụ huynh hoàn thành luồng cơ bản không cần kỹ thuật viên; không có hiểu nhầm nguy hiểm do nhãn/trạng thái. Nếu không đạt, quay G1/G3; không dùng số người đăng ký để che thất bại sử dụng.

### G6 — Ra mắt nhỏ, có hỗ trợ

**Phụ thuộc:** G5. **Chủ trì:** sản phẩm + vận hành.

- Trang giới thiệu: ai dùng, học gì, minh họa thật, giới hạn, riêng tư, kênh báo lỗi và người chịu trách nhiệm.
- Bản demo 3 phút không thu dữ liệu trẻ không cần thiết; video 30–60 giây minh họa một bài thật.
- Bộ tài liệu giáo viên/phụ huynh: hướng dẫn 1 trang, một hoạt động tại nhà đã duyệt, QR tới bài.
- Giới thiệu qua nhóm phụ huynh/trường/tổ chức với sự cho phép của quản trị viên hoặc đầu mối. Không spam, không tự nhận bảo trợ.
- Mở từng đợt theo khả năng hỗ trợ, giữ rollback và kênh phản hồi nổi bật.

**Đầu ra:** bản công khai đã kiểm, tài liệu giới thiệu trung thực, lịch hỗ trợ, dashboard vận hành tối thiểu.

**Gate:** luồng học ổn, hỗ trợ phản hồi được, chi phí trong hạn mức, không còn claim vượt bằng chứng. Không đăng thông tin/hình trẻ để quảng bá khi chưa có cơ sở đồng ý thích hợp.

### G7 — Mở rộng dựa trên giá trị thật

**Phụ thuộc:** G6 và dữ liệu vận hành ổn định.

- Chỉ thêm chủ đề khi có năng lực duyệt, kiểm tra và duy trì. | Một kết quả logic, không nhân đôi thưởng |
| Q05 | Học offline đã tải rồi tắt/mở app | Tiến độ giữ nguyên; trạng thái đồng bộ rõ |
| Q06 | Sai PIN, lỗi mạng, mở route trực tiếp | Không vào dữ liệu phụ huynh trái quyền |
| Q07 | Gia đình A dùng ID của B | API từ chối, không chỉ giấu nút trên UI |
| Q08 | Từ chối định vị / chưa có vị trí | Không xuất hiện vị trí mặc định như thật |
| Q09 | Mất kết nối khi gửi cảnh báo nếu tính năng được bật | Báo chưa gửi; không tạo delivered/ack giả |
| Q10 | AI lỗi/không đủ ảnh nếu tính năng được bật | Không đưa kết luận SAFE |
| Q11 | Cỡ chữ 200%, 320 px, bàn phím | Hoàn thành tác vụ, không nút bị che, focus thấy rõ |
| Q12 | Chọn giảm chuyển động/tắt âm | Tùy chọn có hiệu lực và được lưu; thông tin không phụ thuộc âm/màu |
| Q13 | Nạp lại sau khi đổi thời lượng/PIN | Giá trị thật được giữ; thất bại không báo thành công |
| Q14 | Xóa hồ sơ / khôi phục backup thử | Dữ liệu xử lý đúng chính sách và scope, có biên bản |
| Q15 | Mở/đóng màn 20 lần | Không tăng listener/timer không kiểm soát, không phát lời thoại từ màn đã đóng |
| Q16 | Bài bị chuyên gia rút | Phiên bản ngừng phát hành; cache có chiến lược hết hạn/cảnh báo |

## 5. Mục tiêu chất lượng và cách đo

Các ngưỡng sau là mục tiêu nội bộ đề xuất, cần chốt trên thiết bị/mạng tham chiếu; chưa phải số liệu hiện tại.

- Luồng chính phản hồi thao tác dưới 200 ms khi không chờ mạng; tác vụ mạng có loading và phương án lỗi rõ.
- Trên bản web production, đo LCP/INP/CLS bằng công cụ và dữ liệu hiện trường trước khi đưa claim hiệu năng; không tự đặt dấu đạt.
- Không crash trong kịch bản kiểm thử bắt buộc. Khi vận hành, theo dõi tỷ lệ phiên lỗi với mẫu đủ lớn, phân tách lỗi nghiêm trọng và nhỏ.
- 100% bài được phát hành có reviewer, version và nguồn; 100% claim chứng nhận có hồ sơ hoặc bị loại bỏ. Đây là gate kiểm kê, không hứa 100% an toàn.
- Analytics chỉ cần các sự kiện tối thiểu như bắt đầu/hoàn thành bài, lỗi tải, yêu cầu hỗ trợ; không thu GPS/ảnh/chat làm analytics mặc định.
- Thành công cộng đồng: trẻ hiểu thêm một hành động phù hợp, phụ huynh sử dụng được, gia đình tự nguyện quay lại. Không tối ưu thời gian nhìn màn hình bằng áp lực streak.

## 6. Kế hoạch 10 ngày làm việc đầu tiên

Đây là thứ tự gợi ý cho một kỹ sư có hỗ trợ thiết kế/nội dung, không phải cam kết hoàn thành toàn sản phẩm trong 10 ngày.

| Ngày | Công việc | Bằng chứng cuối ngày |
|---|---|---|
| 1 | Snapshot, phạm vi, danh sách claims, tắt demo nguy hiểm | Bản chạy với nhãn/trạng thái trung thực |
| 2 | PIN, ownership và mô hình gia đình | Test sai PIN và chéo gia đình |
| 3 | ID bài và bộ chấm | Test 0/đúng một phần/đúng hết |
| 4 | Lưu tiến độ, thưởng, retry | Reload và duplicate không mất/nhân đôi |
| 5 | Offline/cache/version | Mất mạng không đổi đề hay bịa kết quả |
| 6 | Tokens, header, dock, chữ và cỡ chạm | Ảnh 320/390/768/1440 |
| 7 | Lát cắt onboarding→bài học→kết quả | Video một luồng thật, không fallback mẫu |
| 8 | Dashboard dữ liệu thật, empty/error, cài đặt | Người mới và hai hồ sơ độc lập |
| 9 | Tích hợp bài đã được duyệt, accessibility | Biên bản duyệt + kiểm tra thao tác |
| 10 | Kiểm tra tổng, rà gate, chốt phần còn thiếu | Danh sách đạt/chưa đạt; chưa đủ gate thì không pilot |

Ước lượng lịch toàn bộ chỉ làm sau G0–G1, khi biết hiện trạng DB, nhóm làm việc, phạm vi native và khả năng có người duyệt nội dung. Nếu nguồn lực ít, giảm tính năng, không giảm tính trung thực.

## 7. Điều kiện dừng phát hành và xử lý sự cố

Nếu có truy cập chéo gia đình, mất tiến độ hàng loạt, thông báo cứu hộ giả hoặc bài có hướng dẫn nguy hiểm: ngừng/tắt chức năng liên quan, bảo toàn log tối thiểu, xác định phạm vi ảnh hưởng, sửa hoặc rollback, thông báo đúng đối tượng khi cần, kiểm tra lại trước mở. Có tên người trực xử lý và thời hạn phản hồi do nhóm cam kết. Không âm thầm tiếp tục quảng bá khi biết lỗi cốt lõi chưa được giải quyết.

## 8. Mẫu ticket để dùng ngay

**ID / tên:** B02 — Chấm bài sai toàn bộ thành 100% khi offline.

**Bằng chứng:** `core-results.json`; hàm `submitTestAnswers`, `api.ts:432`.

**Người chịu trách nhiệm:** kỹ sư luồng học; reviewer: kiểm thử.

**Phụ thuộc:** schema bộ đề/version và quyết định có chấm offline hay chỉ lưu chờ.

**Hành vi mong muốn:** có bộ đề hợp lệ thì chấm đúng; chưa có thì lưu pending, không sinh điểm giả.

**Acceptance:** 0 đúng = 0; bỏ trống không pass; retry không nhân thưởng; UI pending không giống kết quả hoàn tất.

**Kiểm tra:** unit bảng trường hợp + integration nộp lại + một E2E offline.

**Rollback:** tắt chấm offline, giữ hàng đợi; không xóa kết quả của trẻ.

**Definition of done:** mã đã review, test đạt, ảnh trạng thái lưu vào ticket, tài liệu luồng cập nhật, không còn đường fallback cũ gọi được.
