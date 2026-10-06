# Tiến độ thực hiện workflow — 26/09/2026

> Bản ghi đợt sửa đầu. Trạng thái hiện tại sau đợt giao diện/sửa lõi tiếp theo ở [tài liệu 06](06-TONG-HOP-VA-SUA-LOI.md).

**Trạng thái: đang thực hiện; chưa đủ điều kiện phát hành hoặc nghiệm thu toàn bộ.** Đây là biên bản sửa kỹ thuật, không thay thế báo cáo kiểm toán độc lập.

Chủ dự án xác nhận chưa có người duyệt nội dung và muốn được hướng dẫn phần này sau. Ngân sách vận hành chưa chốt. Không lấy AI thay người duyệt, không ghi bài nào là đã được chuyên gia duyệt. Chưa mời gia đình nhập dữ liệu thật, chưa triển khai công khai.

## Đã thay đổi

- Tạo snapshot nguồn trước sửa tại `scratch/workflow-baseline-2026-09-26T11-18-01-319Z`, kèm manifest SHA256. Không sao chép bí mật hoặc hồ sơ trẻ vào snapshot. Đây chưa phải backup dữ liệu hay lịch sử Git.
- Đóng scanner, SOS từ xa, tài khoản phụ huynh, báo cáo thích nghi, minigame, thử thách tính giờ và đa ngôn ngữ trên bản nội bộ. Chặn API AI/phụ huynh cả khi gọi trực tiếp; API học mặc định đóng. Backend chỉ lắng nghe địa chỉ loopback.
- Loại bỏ PIN bypass 1234/0000, kết quả chấm offline giả, bản đồ/báo cáo mẫu thay lỗi mạng, vị trí mặc định, gửi SOS thành công giả và mã hóa Base64 giả.
- Truyền checkpoint ID từ dữ liệu bản đồ; chấm theo đáp án trong DB; câu sai/bỏ trống nhận 0; câu sắp thứ tự không có đáp án cấu hình không được tính đúng.
- Thêm attemptId, băm yêu cầu, biên nhận và transaction. Nộp lại cùng yêu cầu trả cùng biên nhận; đổi nội dung với cùng ID bị từ chối. Giữ điểm tốt nhất; thưởng lần đầu hoàn thành bài.
- Lưu hàng đợi trước gửi; chỉ xóa sau biên nhận. Retry không được tạo điểm mẫu. AsyncStorage có namespace hồ sơ; bỏ khởi tạo ghi đè thành tích. Đây chưa phải hỗ trợ học trọn vẹn offline.
- Header bỏ chỉ số mẫu/streak hằng số; bản đồ báo lỗi thật; thành tích đọc từ máy chủ; bỏ nút ghép huy hiệu cục bộ. Nhãn nội bộ và lời thoại về trạng thái duyệt thống nhất hơn.
- Thêm 20 kiểm thử, cấu hình CI và sửa lệnh chạy backend đã build.

## Bằng chứng đã kiểm tra

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| `npm test` | 20/20 đạt trên SQLite thử riêng. Các test lưu thiết bị dùng AsyncStorage giả lập, chưa chứng minh khởi động lại điện thoại thật. |
| `npm run build` | Backend build thành công. |
| `npx tsc --noEmit` trong mobile | Đạt sau các sửa cuối. |
| Xuất Expo web | Thành công sau các sửa cuối, tại `scratch/workflow-web-final`. Không tương đương build native hoặc cài đặt sạch. |
| Gọi HTTP backend thật | API học, PIN và AI trả 503 khi đóng; health trả 200 với trạng thái AI đóng. Xem `workflow-http-results.json`. |
| Trình duyệt | Đi qua 4 bước mở đầu đến màn lỗi kết nối trung thực; chụp 320×568 và 390×844. Xem `workflow-onboarding.png`, `workflow-unavailable.png`. Chưa nghiệm thu toàn bộ UI. |
| CI | Đã thêm cấu hình; chưa có lần chạy trên dịch vụ CI, chưa có kết quả từ cài đặt sạch. |

Không dùng `core-results.json` cũ làm bằng chứng lỗi còn tồn tại sau sửa; đó là bằng chứng trước sửa. Bộ kiểm thử mới nằm ở `test/workflow.test.cjs`.

## Gate còn mở

| Chặng | Trạng thái | Việc còn thiếu |
|---|---|---|
| G0 | Một phần | Chốt 12 bài, chủ nội dung, ngân sách; hoàn thiện kiểm kê mọi claim và nguồn dữ liệu. |
| G1 | Một phần | Version nội dung, luồng nhiều checkpoint/bài, unlock, đồng bộ nhiều tab/thiết bị, cache offline và xử lý yêu cầu lỗi vĩnh viễn. |
| G2 | Chưa đạt | Xác thực/ownership gia đình thật, phiên đăng nhập, giới hạn thử, xóa dữ liệu, chính sách lưu, quy trình duyệt/rút bài. Đóng tính năng không đồng nghĩa đã làm xong xác thực. |
| G3 | Chưa đạt | Lát cắt học đầy đủ, responsive mọi màn, chữ 200%, bàn phím/screen reader, giảm chuyển động/âm thanh, ảnh trước-sau, icon và tối ưu tài nguyên. |
| G4 | Một phần | Build sạch/CI thật, E2E hành trình học, điện thoại thật, kiểm tra 20 lần mở/đóng, nâng cấp DB/restore/rollback, đo hiệu năng. |
| G5–G7 | Chưa thực hiện | Pilot có giám sát, phát hành nhỏ, theo dõi và mở rộng sau khi qua các gate trước. |

## Ma trận nghiệm thu Q01–Q16

| Mã | Trạng thái hiện tại |
|---|---|
| Q01 | Có test kho mới trống; bỏ chỉ số mẫu ở header. Chưa rà mọi màn và mọi nguồn dữ liệu. |
| Q02 | Các trường hợp sai hết, trống, offline không sinh điểm, câu sắp thứ tự cấu hình trống đã có test đạt. |
| Q03 | Test đáp án đúng theo dữ liệu, không theo hậu tố ID/vị trí, đạt; chưa đủ ma trận mọi kiểu câu. |
| Q04 | Retry tuần tự và ID bị dùng với dữ liệu khác đã thử. Chưa nghiệm thu nhiều tiến trình/thiết bị đồng thời. |
| Q05 | Queue retry và phân tách namespace có test; chưa thử restart thiết bị thật, chưa tải bài offline. |
| Q06 | Bỏ bypass, API đóng có kiểm tra. Luồng đăng nhập gia đình hoàn chỉnh chưa có. |
| Q07 | API phụ huynh đóng. Chưa có bằng chứng phân quyền chéo gia đình khi mở tính năng. |
| Q08 | Bỏ tọa độ mẫu; chưa thử từ chối quyền trên thiết bị thật. |
| Q09 | SOS đóng, trả thất bại thay vì delivered; chưa có dịch vụ gửi để nghiệm thu. |
| Q10 | Scanner đóng; thiếu AI/nhãn sai có test UNKNOWN. Chưa nghiệm thu hệ thống phân tích ảnh. |
| Q11 | Đã xem màn mở đầu 320 px; chữ 200%, focus và mọi màn chưa nghiệm thu. |
| Q12 | Chưa nghiệm thu lưu tùy chọn giảm chuyển động/âm thanh. |
| Q13 | Tính năng đóng trả success=false. Chưa làm xong lưu cài đặt/PIN trong tài khoản thật. |
| Q14 | Chưa thử xóa/khôi phục dữ liệu. |
| Q15 | Đã thêm dừng animation ở một số màn; chưa đo 20 vòng và toàn bộ timer/listener. |
| Q16 | Chưa có quy trình version/rút nội dung hoàn chỉnh. |

## Cách tiếp tục và giới hạn vận hành

1. Tiếp tục G1: content version, hành trình một bài đầy đủ, thử đồng thời/retry/restart. Song song hoàn thiện thiết kế lát cắt G3.
2. Xây xác thực và ownership gia đình trước khi mở API học cho người thật; danh tính cố định hiện tại chỉ phục vụ phát triển. Cờ `INTERNAL_LEARNING_PREVIEW=true` không phải cơ chế đăng nhập.
3. Chỉ tích hợp nội dung công khai sau khi có người duyệt và hồ sơ nguồn. Hướng dẫn tuyển/chọn người duyệt được hoãn theo yêu cầu chủ dự án.
4. Chạy G4, lập báo cáo kiểm toán cập nhật dựa trên bản sửa. Báo cáo có thể lập trước khi sản phẩm hoàn chỉnh nhưng phải giữ nguyên các lỗi/gate mở.

Chạy kiểm tra hiện tại: `npm run prisma:generate`, `npm test`, `npm run build`; mobile: `npx tsc --noEmit`. Chạy giao diện bằng `npx expo start --web --port 8081`; khi không có backend/luồng học bị đóng, màn báo chưa tải được là hành vi dự kiến.

**DB:** schema mới có hai cột biên nhận. Chưa áp lên DB dự án. File `prisma/migrations/20260926_attempt_receipts/migration.sql` chỉ là delta cho DB cũ, chưa có lịch sử migration ban đầu đầy đủ. Không chạy migrate deploy/db push tùy tiện lên DB có dữ liệu. Bộ test tạo DB riêng rồi db push; đó không phải hướng dẫn nâng cấp production. Cần backup, baseline, diễn tập migration và kiểm tra restore trước khi nâng cấp DB thật.

**Rollback nguồn:** so sánh manifest với file hiện tại rồi khôi phục từng file từ snapshot; không ghi đè thay đổi mới của người dùng. Không rollback schema bằng cách xóa dữ liệu/biên nhận. Nếu lỗi sau này, đóng luồng học và giữ queue để xử lý.

**Kết luận:** đã có một đợt sửa có bằng chứng. Chưa hoàn tất workflow số một và chưa có cơ sở cam kết “1000000%”, an toàn tuyệt đối hay sẵn sàng ra mắt cộng đồng.
