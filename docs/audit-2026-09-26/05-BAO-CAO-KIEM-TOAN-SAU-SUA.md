# Báo cáo kiểm toán KidsSafe AI sau đợt sửa đầu

> Báo cáo lịch sử trước triển khai giao diện mới. Các sửa tiếp theo và trạng thái hiện tại ở [tài liệu 06](06-TONG-HOP-VA-SUA-LOI.md); không chạy script tái hiện cũ rồi coi nó là bộ test hợp đồng API mới có contentVersion.

Ngày: 26/09/2026 · Đối tượng: mã hiện tại trong `D:\kidproject` · Mục tiêu: sản phẩm giáo dục phục vụ cộng đồng.

**Kết luận: tiếp tục phát triển nội bộ; chưa đủ điều kiện thử với dữ liệu trẻ thật hoặc phát hành cộng đồng.** Một số lỗi chấm điểm và trạng thái giả đã được sửa có bằng chứng. Tuy nhiên, tài khoản gia đình, quản lý nội dung, đồng bộ, giao diện và vận hành còn thiếu. Việc khóa tính năng giảm khả năng tiếp cận lỗi, không chứng minh tính năng đã hoạt động đúng.

Đây là báo cáo rà soát kỹ thuật sau sửa, do cùng trợ lý đã thực hiện các sửa đổi trước đó lập. **Không phải kiểm toán độc lập**, chứng nhận an toàn, thẩm định nội dung chuyên môn hoặc bảo đảm không còn lỗi. Chủ dự án xác nhận chưa có người duyệt nội dung; phần hướng dẫn tìm người được hoãn theo yêu cầu. Ngân sách chưa được xác nhận.

## 1. Phạm vi và phương pháp

- Đối chiếu đủ **50 mục cũ** A01–A14, B01–B16, U01–U12, O01–O08 với bản sửa; bảng bên dưới giữ nguyên ID để theo dõi.
- Đọc lại luồng điều hướng, cờ tính năng, API, PIN, chấm điểm, hàng đợi, schema, seed, các màn học/bản đồ/onboarding và cấu hình build/CI.
- Chạy lại 20 test hồi quy và kiểm tra TypeScript hai phần: đạt. Log: [audit-regression.log](audit-regression.log).
- Viết và chạy 5 phép thử bổ sung bằng SQLite mới trong `scratch`, không dùng dữ liệu thật. Script: [audit-after-fixes.cjs](audit-after-fixes.cjs); kết quả và SHA256 của 6 file lõi: [audit-after-fixes-results.json](audit-after-fixes-results.json).
- Chạy bản web đã xuất ở đợt sửa trước với backend build trước đó và DB thử riêng. Mở cờ học chỉ trong tiến trình kiểm toán tại loopback; không mở AI/phụ huynh/SOS. Đi bản đồ → bài → chọn sai → gửi → nhận 0 điểm. Quan sát 320×568 và 390×844.
- Đối chiếu lại bài chống sét với nguồn NWS và các tiêu chí tiếp cận với W3C. Không tự duyệt lại toàn bộ giáo trình.

**Giới hạn:** lượt này không sửa mã sản phẩm, không nâng cấp DB dự án, không chạy seed dự án lên dữ liệu thật; không gọi Gemini/cứu hộ, không đăng ra ngoài. Chưa có cài đặt sạch, CI từ xa, điện thoại thật, Safari iOS, tải đồng thời nhiều tiến trình, kiểm thử đầy đủ chữ 200%/screen reader/giảm chuyển động, đo FPS/pin hay backup–restore. Test storage dùng giả lập không chứng minh độ bền trên thiết bị thật. Phép gọi service trực tiếp không được mô tả như khai thác được API mặc định đang đóng.

## 2. Kết quả đáng chú ý

| Kiểm tra | Quan sát | Kết luận đúng phạm vi |
|---|---|---|
| 20 test hồi quy | 20 đạt, 0 thất bại | Những trường hợp được viết test đang đạt; không phải toàn bộ sản phẩm đạt. |
| Bài trả lời sai trên web | Kết quả 0%, đúng 0/1 | Luồng web → backend chấm sai đã xác nhận với câu hỏi tổng hợp dùng để thử. |
| Bài có 2 checkpoint | Chỉ nộp 1, bài đã `isCompleted=true`; checkpoint còn lại có 0 kết quả | Quy tắc hoàn thành chưa xử lý đầy đủ mô hình nhiều checkpoint. |
| Bài đang LOCKED | Bản đồ ghi LOCKED nhưng service vẫn trả đề và nhận bài đạt | Khóa hiện tại chưa được thực thi ở dịch vụ học. |
| Đáp án đổi sau tải đề | API không trả version; lựa chọn từng đúng nhận 0 sau đổi DB | Kết quả không gắn với phiên bản đề đã học. |
| Queue: bài đã xóa trước bài hợp lệ | Request đầu 404; bài hợp lệ không được gửi; còn 2 mục | Lỗi vĩnh viễn ở đầu hàng đợi chặn phần còn lại. |
| Migration trên DB trống | P3018, `no such table: test_results` | Migration hiện có chỉ là delta, chưa đủ khởi tạo DB mới. |

Năm hàng cuối có dữ liệu chạy trong `audit-after-fixes-results.json`. Đây là tái hiện vấn đề, không phải năm test nghiệm thu đạt. Tổng số test hồi quy vẫn là 20; không cộng các phép tìm lỗi để tạo tỷ lệ đạt.

## 3. Phát hiện sau sửa và cách xử lý

Mức ưu tiên: **P0** ngăn mở chức năng có rủi ro an toàn nghiêm trọng; **P1** cần xử lý trước pilot có dữ liệu thật hoặc làm hỏng luồng cốt lõi; **P2** cải tiến có thể xếp sau lõi. Bằng chứng: **R** chạy tái hiện, **C** đọc mã, **V** quan sát ảnh, **T** chưa kiểm tra. Mức của chức năng đang đóng áp dụng trước khi mở lại.

### N01 — Một checkpoint hoàn thành cả bài · P1 · R

`src/modules/learning/learning.service.ts`, `gradeAndSave`, cập nhật tiến độ theo lesson ngay khi một checkpoint pass. Dữ liệu thử có 2 checkpoint, nộp phần đầu là bài hoàn tất và nhận XP. `WorldMapScreen.tsx:352` cũng luôn lấy checkpoint đầu của lesson đầu.

**Tác động:** bỏ qua phần học nhưng vẫn hoàn thành; lesson/checkpoint phía sau không có lối đi tương ứng trong màn bản đồ hiện tại. Nếu MVP cố ý chỉ có 1 lesson/stage và 1 checkpoint/lesson, phải kiểm tra ràng buộc này khi xuất bản, không chỉ giả định.

**Sửa:** lưu tiến độ checkpoint; chốt phần bắt buộc; chỉ hoàn thành bài khi đủ điều kiện. UI chọn bài và phần tiếp theo còn thiếu. **Nghiệm thu:** dữ liệu 2×2 không bỏ sót; 1/2 chưa hoàn tất; 2/2 mới thưởng một lần; làm lại không nhân thưởng.

### N02 — Khóa bài chỉ ở bản đồ · P1 · R

`getCheckpointDetails` và `gradeAndSave` không kiểm tra quyền mở khóa. Phép thử ghi tiến độ LOCKED, lấy đề và nộp đúng vẫn được chấp nhận.

**Sửa:** một quy tắc eligibility phía server dùng chung cho xem đề/nộp bài; phân biệt khóa tiến độ với quyền sở hữu gia đình. **Nghiệm thu:** ID bài khóa gọi trực tiếp bị từ chối và không có ghi kết quả/XP. Hiện API học mặc định đóng, nên chưa kết luận người ngoài đang khai thác được lỗi này.

### N03 — Không gắn bài làm với phiên bản nội dung · P1 · R

Đề trả về, payload nộp và queue đều không có contentVersion. Bộ chấm dùng đáp án DB tại lúc nộp. Phép thử đổi đáp án sau tải đề làm cùng lựa chọn từ đúng thành 0.

**Sửa:** phiên bản đề bất biến được xuất bản, attempt lưu version/hash; quyết định rõ xử lý bài bị rút và phiên bản cũ. **Nghiệm thu:** thay nội dung không âm thầm đổi điểm bài đang làm; version không còn được phép có thông báo cụ thể, không đổi sang đề mẫu. Liên quan Q03/Q05/Q16.

### N04 — Một lỗi vĩnh viễn làm kẹt queue và màn bản đồ · P1 · R+C

`attemptQueue.ts`, `syncPending`, dừng vòng lặp khi lần gửi đầu lỗi. `WorldMapScreen.tsx:313` chờ sync xong mới tải bản đồ; lỗi sync đi cùng nhánh xóa dữ liệu màn hình. Phép thử 404 giữ cả hai bài, không gửi bài hợp lệ phía sau.

**Sửa:** mỗi mục có trạng thái và lỗi riêng; tách retry tạm thời với xử lý 400/401/403/404/409; giữ bài lỗi để khôi phục/giải quyết, không tự xóa. Cho bản đồ tải độc lập và hiển thị số bài còn chờ. **Nghiệm thu:** một bài 404 không chặn bài hợp lệ; mất mạng vẫn giữ queue; đăng nhập lại không gửi sang hồ sơ khác.

### N05 — Migration chưa khởi tạo được môi trường mới · P1 · R

Chỉ có migration thêm hai cột vào `test_results`; chưa có migration tạo bảng. `migrate deploy` trên SQLite mới thất bại P3018. CI dùng `db push` trong test nên chưa phát hiện lỗi triển khai này.

**Sửa:** lập migration baseline và đường nâng cấp DB cũ, thử trên bản sao; bổ sung fresh-install và upgrade vào kiểm tra phát hành. **Nghiệm thu:** cả DB mới lẫn bản sao DB cũ chạy được; dữ liệu/biên nhận giữ nguyên; khôi phục backup được diễn tập. Không chạy `reset` để xử lý DB chứa dữ liệu thật.

### N06 — Tiến độ vùng chưa có quy tắc hoàn chỉnh · P1 · C

Seed đặt `unlockLevel=zoneNumber`, API khóa vùng bằng `explorerLevel`. Luồng chấm cộng XP nhưng không cập nhật explorerLevel; các ghi explorerLevel tìm thấy trong mã hiện tại là khởi tạo hồ sơ và seed. Biến `isPreviousLessonCompleted` còn được đặt lại true ở đầu mỗi zone.

**Sửa:** chốt mở vùng theo tiến độ hay level, rồi áp dụng nhất quán ở server/UI. **Nghiệm thu:** hồ sơ mới hoàn thành vùng đầu phải mở đúng vùng tiếp; người chưa đạt không vượt khóa qua API. Đây là thiếu sót cấu trúc đã đọc, chưa chạy toàn bộ hành trình 10 vùng để đo tác động cuối cùng.

### N07 — Seed vẫn trộn thành tích mẫu vào hồ sơ hoạt động · P1 · C

`prisma/seed.ts:263` upsert đúng ID mà `CURRENT_USER_ID` dùng, gán **680 XP, level 3** ở cả tạo mới và cập nhật. Vì vậy bỏ fallback số liệu trong UI chưa giải quyết Q01: chạy seed vẫn đưa số mẫu vào dữ liệu mà UI coi là thật, hoặc ghi đè XP hiện có. Seed còn tạo `pinHash: '1234'` dạng chữ; sau bỏ bypass, đây không phải cấu hình PIN băm hợp lệ.

**Sửa:** tách seed nội dung với fixture demo, không cập nhật thành tích người dùng trong seed; tạo tài khoản thử có nhãn/phạm vi riêng. **Nghiệm thu:** chạy seed nội dung hai lần không đổi XP/PIN/tiến độ; hồ sơ mới không có thành tích mẫu; dữ liệu demo không dùng cho báo cáo thật. Lượt kiểm toán này không chạy seed trên DB dự án.

### N08 — Đổi checkpoint trên cùng màn có thể giữ trạng thái lần làm cũ · P2 · C/T

`QuestTestScreen.tsx:88` tải lại khi checkpointId đổi, nhưng `loadQuestions` không reset currentIdx, userAnswers, attemptId, pendingAttempt và kết quả cũ. Nếu navigator tái sử dụng màn với tham số mới, dữ liệu cũ có thể đi cùng đề mới.

**Sửa:** tạo phiên làm mới theo checkpoint/version; bỏ qua response tải cũ và reset trạng thái nguyên tử. **Nghiệm thu:** đổi A→B trên cùng instance, phản hồi A đến chậm, retry và quay lại đều không trộn đề/đáp án/biên nhận. Chưa tái hiện đường điều hướng này trên UI hiện tại, nên chưa gọi là lỗi chắc chắn xảy ra trong hành trình thông thường.

## 4. Đối chiếu đầy đủ sổ lỗi cũ

**Đã sửa** chỉ áp dụng mô tả lỗi cụ thể và bằng chứng ghi trong hàng. **Một phần** còn tiêu chí mở. **Đang chặn** nghĩa là gate giảm phơi nhiễm nhưng chưa nghiệm thu chức năng. **Còn mở** là chưa có sửa/bằng chứng đủ.

| ID | Trạng thái sau sửa | Bằng chứng và phần còn lại |
|---|---|---|
| A01 | Đã sửa bypass | Test PIN lưu 9876 từ chối 1234; không đồng nghĩa đã có xác thực gia đình. |
| A02 | Đang chặn | API mobile không mở cổng khi offline; tài khoản phụ huynh đóng. |
| A03 | Đang chặn | Hàm liệt kê hồ sơ ném lỗi và API phụ huynh đóng; schema ownership chưa có. |
| A04 | Đang chặn | Gửi SOS trả disabled/thất bại; chưa có giao nhận thật. |
| A05 | Một phần | geo bỏ tọa độ mặc định; chưa thử quyền và GPS thật. |
| A06 | Đang chặn | Route SOS đóng; mesh/guardian mô phỏng còn trong nguồn, chưa được nghiệm thu. |
| A07 | Đang chặn | Mã hóa/giải mã giả ném lỗi; nhãn E2EE cũ còn ở dashboard đã đóng. |
| A08 | Một phần | Test thiếu AI/enum sai trả UNKNOWN, mobile AI đóng; chưa kiểm toàn bộ fallback hoặc ảnh thật. |
| A09 | Đang chặn | Scanner đóng; xử lý riêng tư ảnh chưa được chứng minh. |
| A10 | Đã sửa claim đã xác định | Inventory/offlineStorage bỏ nhãn chứng nhận của tổ chức. Không suy ra nội dung đã được duyệt. |
| A11 | Đang chặn | Guard và loopback giảm phơi nhiễm; bật học nội bộ vẫn nhận userId client, chưa có phiên/ownership/rate limit. |
| A12 | Đang chặn | API báo cáo không được gọi từ wrapper hiện tại; dashboard legacy còn `verifiedPin || '1234'`. |
| A13 | Đang chặn | Không mở gửi AI; sổ dữ liệu, thời hạn lưu và xóa chưa hoàn chỉnh. |
| A14 | Đang chặn | SOS đóng; `survivalBlackout` còn 48 giờ hằng số. |
| B01 | Một phần | ID thật đã trả và dùng; UI chỉ chọn phần đầu, xem N01. |
| B02 | Đã sửa lỗi 0→100 | Test đạt; luồng web/backend chọn sai nhận 0. |
| B03 | Đã sửa suy đáp án từ ID | Bộ chấm dùng DB; test ID không theo `_a` đạt. |
| B04 | Đang chặn | Game sửa điểm nhưng Quest vẫn bỏ score/chọn option đầu; minigame đóng. Không mở gate chỉ vì game tự chấm đúng. |
| B05 | Đã sửa thay đề mẫu | Lỗi API bị đẩy ra UI, không thay checkpoint bằng bộ mẫu; cache offline chưa có. |
| B06 | Đang chặn | Đổi PIN/cài đặt đóng trả success=false; chưa có luồng lưu hoàn chỉnh để nghiệm thu. |
| B07 | Đã sửa ghi đè khi khởi tạo | Test inventory nhiều instance giữ mảnh; đây là storage giả lập. |
| B08 | Một phần | Kho mới dùng AsyncStorage; SRS cũ vẫn localStorage/RAM, chưa test native restart. |
| B09 | Một phần | Có queue bền vững và receipt; còn chặn queue/bản đồ bởi lỗi vĩnh viễn N04. |
| B10 | Đang chặn | Dashboard mẫu không đi được qua route; dữ liệu mẫu legacy còn trong màn. |
| B11 | Một phần | Bắt đầu 0, chặn tăng hai lần cùng ngày; vẫn RAM, chưa xử lý đầy đủ chuỗi ngày/restart. |
| B12 | Một phần | Transaction, best score, retry cùng payload đã có test; hoàn thành nhiều checkpoint còn sai N01, đồng thời chưa đủ phép thử. |
| B13 | Còn mở | Onboarding chưa nối hồ sơ thực; CURRENT_USER_ID cố định; xem thêm N07. |
| B14 | Đang chặn | Dashboard/SleepLock chưa có trong luồng được mở; chưa nghiệm thu timer thật hoặc giá trị 0. |
| B15 | Một phần | Bỏ chèn SRS, dùng thời gian phiên; chưa chuẩn hóa thời gian tải/nghe/background, trạng thái lần làm N08. |
| B16 | Còn mở | SRS chưa có dữ liệu vẫn trả mastery=100; handbook chưa được kiểm chứng đầy đủ. Không dùng số này làm năng lực. |
| U01 | Một phần | Ảnh mới 320 cho thấy header không xuống chữ vụn/loa không vượt thẻ; đầu màn vẫn chiếm nhiều chỗ. Chữ 200% chưa kiểm. |
| U02 | Một phần | Bản đồ dùng kích thước sống; Inventory/Onboarding vẫn Dimensions tại module. Desktop sau sửa chưa kiểm đủ. |
| U03 | Một phần | Dock tăng nhãn; DOM bài học vẫn có 10.5–11.5 px. Chưa đo toàn bộ vùng chạm. |
| U04 | Một phần | Có thêm role ở một số nút; chưa đủ focus, accessible name, screen reader và giảm chuyển động. |
| U05 | Còn mở | Quan sát bản đồ navy/neon và bài nền sáng; chưa thống nhất hệ thành phần/trạng thái. |
| U06 | Đang chặn | Scanner không thuộc bản mở; chưa kiểm camera thật. |
| U07 | Đang chặn | SOS không thuộc bản mở; chưa nghiệm thu thiết kế trợ giúp. |
| U08 | Một phần | Timer/minigame đóng; vẫn còn thẻ tím trông như nút nhưng bấm không mở gì. |
| U09 | Còn mở | Vẫn 4 bước, hỏi kênh giới thiệu, mốc thời gian cũ, thiếu quay bước; chưa tối giản vào bài. |
| U10 | Còn mở | 4 asset icon/splash/adaptive/favicon vẫn 70 byte; kích thước 1×1 đã đo ở lượt trước. |
| U11 | Một phần | Một số nhãn đã rõ hơn; còn “ải”, “thử thách sinh tồn”, “Mở quà” và thuật ngữ legacy. |
| U12 | Một phần | Có cleanup một số màn; Onboarding timer/loop và Milo loop chưa có cleanup đầy đủ. Chưa đo 20 vòng. |
| O01 | Còn mở, P0 trước mở nội dung | Seed vẫn có Lightning Crouch; NWS không khuyến nghị. Gate học đóng mặc định, nội dung chưa được rút khỏi nguồn. |
| O02 | Còn mở | Nội dung phân tán, thiếu review/publish/withdraw/version; N03 tái hiện ảnh hưởng. |
| O03 | Còn mở đối với native | Chưa triển khai/kiểm đủ âm thanh native; web thành công không xác nhận native. |
| O04 | Còn mở đối với native | Bundled SDK hiện cài vẫn yêu cầu notifications ~0.29.14, AsyncStorage 1.23.1; package khai báo ^57.0.13 và ^3.1.1. Chưa kết luận crash khi chưa build. |
| O05 | Một phần | Health AI báo DISABLED đúng phạm vi; chưa có readiness toàn hệ thống. |
| O06 | Một phần | 20 test hành vi chạy đạt, process thất bại khi assert sai; đã thêm CI nhưng chưa chạy CI từ xa/cài sạch. |
| O07 | Một phần | Có snapshot, .gitignore, CI; `.git` vẫn không có trong checkout; migration mới thất bại N05, restore chưa diễn tập. |
| O08 | Đang chặn | Mở modal đa ngôn ngữ bị tắt nhưng nút ngôn ngữ vẫn hiện; tiếng Việt chưa rà soát toàn bộ. |

## 5. Giao diện: ưu tiên cho đặc tả thứ ba

Ảnh **sau sửa, dữ liệu tổng hợp thử nghiệm**: [bản đồ 320](audit2-map.png), [bài học 320](audit2-lesson-320.png), [kết quả 0 điểm](audit2-zero-result.png). Ảnh nền cũ ở báo cáo 01 không được dùng để tuyên bố giao diện mới đã đạt/chưa đạt toàn bộ.

1. **Ưu tiên hành động học:** ở 320×568, header/vùng/tip chiếm khoảng hơn nửa màn bản đồ; nút học đầu ở sát dock. Giảm chiều cao phần đầu, hiển thị “Tiếp tục bài…” rõ ràng; kiểm tra cuộn/focus và font lớn.
2. **Bỏ nút không có hành động:** ngôn ngữ, streak và thẻ tím minigame đang trông có thể bấm nhưng tính năng bị khóa. Ẩn hoặc dùng nội dung tĩnh có giải thích.
3. **Làm rõ phản hồi học tập:** nhận 0 điểm đúng; lời thoại vẫn nói luyện “phản xạ” dù đang học không tính giờ. Ưu tiên câu đã chọn, lý do, cách thực hành phù hợp cùng phụ huynh; không suy năng lực ngoài đời từ XP.
4. **Thiết kế toàn bộ trạng thái:** màn queue có lỗi phải có danh sách/khả năng giải quyết; phân biệt không mạng, dịch vụ đóng, đề bị rút và dữ liệu chưa có. Màn lỗi chung hiện chưa đủ thông tin.
5. **Hoàn thiện chữ và tiếp cận:** kiểm tra 320/390/768/1440, chữ 200%, Tab/Enter/Escape, focus sau modal, accessible name, đọc màn hình, âm thanh và giảm chuyển động. Không gắn nhãn đạt WCAG dựa trên số lần tìm thấy thuộc tính trong mã.

Tham chiếu phương pháp: [WCAG 2.2 của W3C](https://www.w3.org/TR/WCAG22/). Đây là mục tiêu kiểm tra, không phải chứng nhận phù hợp. Ngưỡng vùng chạm 48×48 trong workflow là lựa chọn thiết kế cho trẻ, không phải tuyên bố mọi tiêu chí WCAG bắt buộc đúng kích thước đó.

## 6. Nội dung và phát hành

Seed vẫn có bài “Lightning Crouch” đưa tư thế ngồi xổm thành lựa chọn đúng. [NWS giải thích đã ngừng khuyến nghị tư thế này](https://www.weather.gov/safety/lightning-crouch), vì không tạo mức bảo vệ đáng kể và có thể gây hiểu nhầm về an toàn. Đây là lý do cụ thể để giữ O01 mở và rút bài khỏi tập dự kiến phát hành; không thay bằng nội dung do AI tự duyệt.

Chưa có chuyên gia duyệt không ngăn việc sửa mã, thiết kế và thử bằng dữ liệu tổng hợp. Nó **ngăn đánh dấu giáo trình sẵn sàng cho cộng đồng**. Cần nguồn, người duyệt, ngày/version, nhóm tuổi, điều kiện áp dụng, trạng thái và quy trình rút bài cho từng nội dung.

Các điều kiện còn ngăn pilot: ownership gia đình; không trộn dữ liệu demo; sửa N01–N07 theo phạm vi MVP; nội dung đã duyệt; luồng cơ bản có bằng chứng UI/thiết bị thật; migration/restore; đầu mối xử lý sự cố và xóa dữ liệu. Không lấy số test đạt thay các điều kiện này.

## 7. Thứ tự xử lý và tiêu chí bàn giao

| Thứ tự | Việc | Vai trò cần đảm nhiệm | Bằng chứng để đóng |
|---|---|---|---|
| 1 | Tách seed demo, giữ gate, rút nội dung có vấn đề | Kỹ thuật + chủ sản phẩm | Seed không đổi người dùng; nội dung chưa duyệt không xuất bản; gate được kiểm lại. |
| 2 | Chốt mô hình bài/checkpoint/version/unlock | Kỹ thuật + sản phẩm | Test N01/N02/N03/N06, hành trình nhiều phần không bỏ sót. |
| 3 | Queue và trạng thái màn | Kỹ thuật + UX | N04, offline/restart/retry, lỗi 404 không khóa học; bài làm vẫn còn. |
| 4 | Tài khoản và ownership | Kỹ thuật | Hai gia đình không đọc/sửa chéo ở API và storage; không dùng userId cố định để xác thực. |
| 5 | Lát cắt giao diện, nội dung được duyệt | UX + người duyệt chưa được chỉ định | Trẻ/phụ huynh hiểu luồng; ảnh cùng dữ liệu/viewport; 12 bài có hồ sơ duyệt trước pilot. |
| 6 | Cài sạch, migration, restore, thiết bị thật | Kỹ thuật + kiểm thử | CI thật, DB mới/cũ, restore/rollback, biên bản thiết bị; rà lại Q01–Q16. |

**Báo cáo số hai đã được lập với bằng chứng và phần còn mở. Có thể tiếp tục tài liệu thứ ba về giao diện/nghiệm thu dựa trên các kết quả này.** Điều đó không có nghĩa workflow triển khai số một đã hoàn thành hoặc sản phẩm được phép phát hành.
