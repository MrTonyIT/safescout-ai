# Kết quả sửa sản phẩm — 27/09/2026

Đã sửa trực tiếp backend, giao diện và lưu trữ của bản web. **Chưa phải bản được phép phát hành cho trẻ thật**, vì chưa có người duyệt giáo trình, chưa pilot và chưa nghiệm thu thiết bị/môi trường vận hành. Không tuyên bố “không còn lỗi” hoặc “đúng 100%”.

## 1. Những thay đổi đã thực hiện

| Nhóm | Kết quả trong mã hiện tại |
|---|---|
| Chấm bài và thưởng | Sổ thưởng có khóa duy nhất theo hồ sơ/bài; thêm phần học hoặc retry không cấp XP lần nữa. Biên nhận phải khớp attemptId trước khi xóa bài chờ. |
| Phiên bản nội dung | Kết quả lưu version và snapshot đề/đáp án. Tiến độ hoàn thành chỉ dùng lần đạt của phiên bản hiện tại. Giữ XP/lịch sử cũ. |
| Bài chưa sẵn sàng | Kiểm kiểu câu hỏi, đáp án, thứ tự, số lượng, lời giải và ngưỡng đạt. Bài không hợp lệ không chặn bài sau. |
| Tài khoản | Đăng ký/đăng nhập/đăng xuất, nhiều hồ sơ, mã khôi phục một lần, đổi mật khẩu, hết hạn/thu hồi phiên, giới hạn thử. Cookie HttpOnly; máy chủ kiểm quyền gia đình–hồ sơ. |
| Dữ liệu phụ huynh | Xác nhận lại mật khẩu để xem lịch sử, thêm/xóa hồ sơ, xuất dữ liệu, đổi mật khẩu và gửi phản hồi. Có xác nhận riêng trước xóa. |
| Duyệt và rút nội dung | DRAFT → REVIEWED → PUBLISHED → WITHDRAWN, snapshot và hồ sơ duyệt theo version. Chỉ bài hợp lệ đã published đúng version và tuổi mới xuất hiện cho gia đình. Không tạo hồ sơ chuyên gia giả. |
| Bản nháp | Lưu lựa chọn/câu đang làm, khôi phục sau rời màn/nạp lại. Đề đổi có đường tải bản sao nháp cũ và bắt đầu bản mới. Web Locks hạn chế hai tab sửa cùng bài khi trình duyệt hỗ trợ. |
| Hàng đợi | Kiểm cấu trúc lưu trữ; lỗi không tự xóa dữ liệu. 403 có thể thử lại; từng mục có tên/thời điểm/tải bản sao và nút gửi lại. Có tự thử lại với giãn thời gian khi đang ở trang Học. |
| Giao diện | Thành phần chung, tìm bài, thông báo theo loại lỗi, đưa cuộn/focus về đầu khi đổi câu/kết quả, đối chiếu lựa chọn/đáp án/lời giải từng câu. Góc cha mẹ và form phản hồi thật. |
| Giọng đọc | Hủy timer đọc khi dừng/tắt tiếng/rời màn; thông báo khi chưa có tiếng Việt trên thiết bị. Giọng đọc native chưa triển khai. |
| Tài nguyên | Luồng mới dùng icon có nguồn vector trong dự án, bỏ ảnh cún chưa có hồ sơ quyền khỏi bundle web mới. |
| Vận hành | Sao lưu mã hóa có xác thực, khôi phục vào tệp mới, health/readiness, giảm thông tin nhạy cảm trong lỗi, cập nhật README và cấu hình mẫu. CI có bước browser E2E. |
| Phụ thuộc | Điều chỉnh AsyncStorage về 1.23.1 và notifications về nhánh 0.29.14 theo khai báo Expo SDK 52 cục bộ; cập nhật lockfile. Chưa suy ra native đã chạy tốt. |

Snapshot trước sửa nằm ở `scratch/before-completion-2026-09-27`. Các thử nghiệm tạo DB mới trong scratch; **không nâng schema hoặc chỉnh dữ liệu DB dự án đang có**.

## 2. Đối chiếu các thiếu sót R01–R18

| Mã | Trạng thái |
|---|---|
| R01 | Đã sửa; regression thêm hai checkpoint vào bài đã nhận XP xác nhận không thưởng lại. |
| R02 | Đã sửa theo chính sách version nghiêm ngặt; đổi nội dung cần đạt lại, giữ XP cũ. |
| R03 | Đã sửa; bài rỗng/không hợp lệ không chặn bài sẵn sàng tiếp theo. |
| R04 | Đã sửa đường thử lại khi quyền phục hồi và nút xử lý từng mục. |
| R05 | Đã sửa timer phát lời thoại; thử bằng speech engine giả lập. Chưa nghiệm thu chất lượng phát âm trên thiết bị thật. |
| R06 | Đã có bản nháp và kiểm trình duyệt rời bài → reload → mở lại giữ đáp án. Không hứa sống sót trước mọi kiểu mất điện/quota/hỏng storage. |
| R07 | Đã có nút tải đề mới, phát hiện draft version cũ và giữ bài nộp cũ trong queue. |
| R08 | Đã phân biệt lỗi dữ liệu, phiên, quyền, không tìm thấy, conflict, hạn mức và máy chủ đóng. |
| R09 | Đã có metadata, gửi lại từng bài và tải bản sao. Chưa có màn chỉnh sửa/hợp nhất tự động bài cũ bị từ chối. |
| R10 | Đã trả và hiện phản hồi từng câu gồm lựa chọn, đáp án, đúng/sai, lời giải. |
| R11 | Đã thống nhất bằng kiểm định: câu sắp thứ tự chỉ dùng các bước đúng với thứ tự duy nhất; cấu hình có option nhiễu bị chặn. |
| R12 | Đã đưa cuộn/focus về đầu khi đổi câu/kết quả; chưa đủ chứng cứ đạt toàn bộ WCAG hoặc VoiceOver/TalkBack. |
| R13 | Có kiểm khả năng tiếng Việt và thông báo; chưa có giọng đọc native. |
| R14 | Thêm index truy vấn kết quả; chưa phân trang bản đồ hoặc đo tải lớn. Phạm vi ban đầu vẫn 12 bài. |
| R15 | Có kiểm schema/giới hạn queue và draft, báo lỗi lưu, giữ bản gốc khi hỏng. Chưa có trình sửa storage hỏng hoặc ma trận quota toàn bộ trình duyệt. |
| R16 | Có khóa ghi queue giữa tab bằng Web Locks, khóa sửa draft, retry có giãn thời gian/online. Chưa hợp nhất draft giữa thiết bị hoặc đảm bảo khóa ở browser không hỗ trợ Web Locks. |
| R17 | Có kiểm nội dung trước học, giới hạn ID/order/time/version DTO và gate publish. Chưa phải công cụ soạn/duyệt nội dung có giao diện hoàn chỉnh. |
| R18 | Có contentVersion, snapshot và biên nhận lưu cùng kết quả. Kết quả legacy thiếu snapshot vẫn được ghi nhận là bản cũ. |

## 3. Bằng chứng kiểm tra

- **39/39 kiểm thử tự động đạt:** [log](tests.log). Bao gồm HTTP hai gia đình, sai mật khẩu/CSRF, thu hồi phiên, khôi phục một lần, xuất/xóa, rút bài, scoring/retry/version/reward, queue/draft/speech và backup.
- Backend typecheck và build đạt; frontend typecheck và Expo export web đạt.
- [Luồng học trên browser](completion-stage-browser-results.json): sai nhận 0; đạt đủ phần mới nhận 40 XP; reload giữ tiến độ; rời/reload khôi phục bản nháp; mất mạng khi nộp không sinh điểm giả; có mạng gửi lại được; khóa draft thực sự đang giữ; không có runtime exception trong kịch bản.
- [Luồng gia đình trên browser](browser-family-results.json): tạo tài khoản, nhận mã khôi phục, thêm hồ sơ, không thấy bài chưa được duyệt, xem lịch sử với mật khẩu, gửi phản hồi thật, xóa hồ sơ, đăng xuất.
- 320/390/768/1440 px không tràn ngang ở các màn chụp; mô phỏng chữ 200% ở trang Học không tràn. Có kiểm focus Tab cơ bản. Đây không phải kiểm toán accessibility đầy đủ.
- Bộ chạy `scripts/run-browser-checks.cjs` đã chạy cục bộ với Edge riêng, DB tổng hợp riêng, tự đóng tiến trình do nó tạo. Lần chạy bị hạn chế GPU trong sandbox đã thất bại; lượt chạy ngoài giới hạn đó đã đạt. Không tính lượt lỗi là đạt.
- `expo install --check` offline báo khớp phụ thuộc nhưng công cụ cảnh báo kiểm offline không hoàn toàn đáng tin; chưa có bản cài native/kiểm store.

Ảnh tiêu biểu: [bài học 320 px](completion-lesson-320.png), [chờ gửi khi mất mạng](completion-offline-pending.png), [kết quả 0 điểm](completion-result-zero.png), [góc cha mẹ 390 px](family-parent-390.png).

## 4. Những việc vẫn còn và không được che giấu

1. **Giáo trình:** chưa có người duyệt thật, 12 bài được duyệt, kiểm cách diễn đạt với trẻ, hoạt động cùng cha mẹ và hồ sơ nguồn đầy đủ. Cơ chế duyệt đã có; chứng cứ duyệt không thể tự tạo thay người có chuyên môn.
2. **Nghiệm thu thực tế:** chưa pilot với trẻ/phụ huynh, Android/iPhone thật, screen reader, xoay màn, font hệ điều hành lớn, mạng yếu/thiết bị thấp; chưa đo hiệu năng hiện trường hoặc tải nhiều gia đình.
3. **Triển khai/vận hành:** chưa public/staging HTTPS, CI từ xa, lịch backup ngoài máy, cảnh báo vận hành, người hỗ trợ, ngân sách, thời hạn phản hồi và chính sách hết hạn backup. Phản hồi hiện lưu cho người vận hành, chưa có màn quản trị/hộp thư tự động.
4. **Offline và dữ liệu cũ:** chưa tải giáo trình để khởi động hoàn toàn không mạng; chưa hợp nhất bài nháp giữa thiết bị, xóa cache từ xa hoặc đối soát XP sai trong DB legacy. DB thực tế chưa được nâng cấp; phải backup và thử migration theo hướng dẫn.
5. **Phần mở rộng:** cẩm nang độc lập, bản đồ minh họa đầy đủ, trang huy hiệu riêng, cá nhân hóa, nhiều ngôn ngữ, native, AI/SOS/mesh/minigame vẫn chưa coi là hoàn thành. Chúng không nằm trong luồng web hiện tại.

Các mục trên là giới hạn đã biết, không phải danh sách mọi lỗi có thể tồn tại. Test đạt không chứng minh không có lỗ hổng hoặc phần mềm “hoàn hảo”.

## 5. Dùng bản đã sửa

Chạy `npm run preview` tại gốc rồi mở http://localhost:8081 để xem luồng học bằng dữ liệu tổng hợp. Dừng trước khi chạy `npm run preview -- --family` để xem chế độ gia đình. Không nhập dữ liệu trẻ thật vào môi trường thử.

Đọc [hướng dẫn vận hành và duyệt nội dung](VAN-HANH.md) trước khi chuyển sang pilot. Điều kiện mở cộng đồng vẫn là bằng chứng nội dung, quyền riêng tư, thiết bị và vận hành thực tế; không phải số lượng tính năng đã viết.
