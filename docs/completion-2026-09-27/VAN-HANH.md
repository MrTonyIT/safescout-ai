# Vận hành bản web — 27/09/2026

Đây là hướng dẫn kỹ thuật cho bản hiện tại. Chưa có triển khai công khai, người duyệt giáo trình, người trực hỗ trợ hoặc ngân sách được chốt. Không mở dữ liệu trẻ thật chỉ vì build/test đạt.

## 1. Hai chế độ độc lập

- Nội bộ: `INTERNAL_LEARNING_PREVIEW=true`, `FAMILY_LEARNING_ENABLED=false`. API chỉ nhận hồ sơ tổng hợp cố định không thuộc gia đình. Dùng `npm run preview` để tạo DB thử mới.
- Gia đình: `INTERNAL_LEARNING_PREVIEW=false`, `FAMILY_LEARNING_ENABLED=true`. Mọi API học kiểm tra cookie phiên và quyền sở hữu hồ sơ. Dùng `npm run preview -- --family` để thử với biệt danh tổng hợp; chưa có giáo trình được duyệt.
- Cả hai false: đóng học/tài khoản. Cả hai true: máy chủ từ chối khởi động.
- AI và API phụ huynh cũ vẫn đóng ở máy chủ. Không bật bằng cách sửa mỗi nút trên giao diện.

Máy chủ bind loopback. Web dùng cookie HttpOnly, SameSite=Strict; production thêm Secure. Khi triển khai thực sự cần HTTPS và frontend/API cùng site, danh sách `WEB_ORIGINS` chính xác, proxy và hạn mức bên ngoài được kiểm. Chưa hỗ trợ xác thực native như một sản phẩm đã nghiệm thu. Không sửa thành cookie chấp nhận mọi nguồn để chữa lỗi triển khai.

## 2. Nâng cơ sở dữ liệu

Các migration mới tạo sổ thưởng, phiên bản/snapshot bài làm, tài khoản/phiên, duyệt nội dung và phản hồi. Mã không tự chạy migration trên DB người dùng.

1. Dừng thay đổi dữ liệu, tạo backup mã hóa và kiểm tra khôi phục vào DB khác.
2. Chỉ định rõ `DATABASE_URL` của DB định nâng cấp; không dùng nhầm DB thật khi chạy thử.
3. Với DB đã có lịch sử migration, chạy `npx prisma migrate deploy`. DB legacy chưa baseline: làm theo tài liệu migration ngày 26/09; không dùng `db push --force-reset`.
4. Chạy `/health/ready`, thử đăng nhập, mở/nộp bài và kiểm tra một hồ sơ cũ.

Sổ thưởng được điền từ progress cũ đã completed để tránh thưởng lại. Không tự sửa các XP sai đã phát sinh từ những bản rất cũ: cần đối soát dữ liệu thật với bản backup. Kết quả cũ thiếu phiên bản được giữ trong lịch sử, nhưng không tự chứng minh đã học phiên bản mới. Đổi nội dung hiện làm mất trạng thái “đã hoàn thành” của phiên bản hiện hành; XP đã trao được giữ, không cấp lại khi học lại.

## 3. Đưa bài vào trạng thái được phép dùng

Không có người duyệt thật thì giữ draft. Script không tự tìm chuyên gia và không xác minh danh tính người ký; quyền chạy script thuộc người vận hành có trách nhiệm kiểm tra hồ sơ duyệt.

Với `DATABASE_URL` được chỉ định rõ:

```text
node scripts/content-review.cjs draft CHECKPOINT_ID review-packet.json
node scripts/content-review.cjs review CHECKPOINT_ID review-packet.json
node scripts/content-review.cjs publish CHECKPOINT_ID
node scripts/content-review.cjs withdraw CHECKPOINT_ID
```

Lệnh draft xuất nội dung và biểu mẫu nếu có đường dẫn tệp. Người duyệt phải đọc nội dung, điền nguồn, tên, ngày duyệt thực tế, tuổi áp dụng và xác nhận humanReviewed. Không điền hộ để vượt gate. Mọi checkpoint trong một lesson phải hợp lệ và được published đúng phiên bản thì lesson mới mở cho gia đình. Đổi câu, đáp án, lời giải hoặc nội dung/tên/mô tả lesson làm phiên bản đổi, cần duyệt lại. Bản đã withdrawn không được script mở lại cùng phiên bản; lập phiên bản sửa và duyệt mới.

Lệnh withdraw ngừng mở/chấm lần nộp mới. Retry một lần nộp đã nhận trước đó vẫn trả điểm/biên nhận cũ, không cấp điểm mới; nhưng bỏ lời giải cũ và báo nội dung đã thay đổi/không còn mở. Màn đã tải trong bộ nhớ chưa có cơ chế push thu hồi tức thì: khi có nội dung nguy hiểm phải tắt luồng học liên quan, thông báo gia đình và xử lý vận hành. Vì vậy chưa có cam kết giáo trình hoạt động hoàn toàn offline.

## 4. Dữ liệu và quyền riêng tư

| Dữ liệu | Nơi lưu / mục đích | Quyền và vòng đời hiện tại |
|---|---|---|
| Tên đăng nhập, hash mật khẩu/mã khôi phục | SQLite; xác thực | Không xuất hash; đến khi xóa tài khoản |
| Cookie phiên / hash token | Cookie HttpOnly / SQLite | Phiên tối đa 8 giờ; đăng xuất thu hồi phiên đó; đổi mật khẩu/khôi phục thu hồi tất cả |
| Biệt danh, tuổi 7–10, tiến độ, XP | SQLite; học theo hồ sơ | Gia đình sở hữu; xóa hồ sơ cascade dữ liệu học |
| Phiên bản, snapshot đề, đáp án, lỗi, biên nhận | SQLite; đối chiếu kết quả | Phụ huynh xác nhận mật khẩu khi xem lịch sử/xuất; xóa cùng hồ sơ |
| Phản hồi | SQLite; sửa nội dung/lỗi | Có mã tiếp nhận, tối đa 10/ngày/gia đình; xuất/xóa cùng gia đình |
| Bản nháp và bài chờ | Storage trình duyệt | Tách theo childId; gửi lại không tự tạo điểm; xóa trên máy hiện tại khi đăng xuất/xóa hồ sơ |
| Bộ đếm hạn mức | SQLite; chống thử liên tục | Khóa đã hash, hết hạn được dọn khi có yêu cầu tiếp theo |
| Backup | Tệp AES-256-GCM do người vận hành tạo | Khóa lưu riêng; chưa có lịch tự động hoặc chính sách hết hạn được chủ sản phẩm xác nhận |

Không thu GPS, ảnh, camera, chat hoặc analytics bên thứ ba trong luồng mới. Storage trình duyệt không phải kho mã hóa chống người dùng cùng máy. Đăng xuất ở một thiết bị không xóa storage tại thiết bị khác; phiên máy khác bị thu hồi khi đổi mật khẩu/khôi phục, nhưng cần cơ chế quản lý thiết bị/clear cache đầy đủ trước lời hứa xóa từ xa toàn bộ.

## 5. Sao lưu và khôi phục

Đặt `DATABASE_URL` và `BACKUP_KEY` trong môi trường thao tác. BACKUP_KEY là 32 byte ngẫu nhiên biểu diễn bằng 64 ký tự hex; không đưa khóa vào Git, tên file, ticket hoặc log.

```text
node scripts/encrypted-backup.cjs backup NEW_BACKUP.milobak
node scripts/encrypted-backup.cjs restore NEW_BACKUP.milobak NEW_RESTORED.db
```

Backup dùng snapshot nhất quán SQLite rồi mã hóa có xác thực; tệp plaintext tạm được dọn sau thao tác. Chạy trong thư mục riêng có quyền truy cập phù hợp. Restore từ chối ghi đè; kiểm tra integrity rồi người vận hành thử app trên DB mới trước chuyển cấu hình. Mất khóa là không khôi phục được. Test đã chứng minh đúng khóa khôi phục, sai khóa bị từ chối và không ghi đè DB.

Chưa thiết lập lịch backup, lưu trữ ngoài máy, thời hạn ẩn/xóa bản backup hoặc mục tiêu mất dữ liệu/thời gian phục hồi. Những mục này cần quyết định vận hành và diễn tập trên môi trường sẽ triển khai.

## 6. Phản hồi và sự cố

Phản hồi gửi trong góc cha mẹ được lưu ở `family_feedback` với trạng thái OPEN. Người vận hành cần có lịch đọc và cập nhật trạng thái qua công cụ quản trị DB có quyền; chưa có hộp thư/email tự động hoặc cam kết thời gian phản hồi. Không quảng bá phản hồi là dịch vụ cứu hộ.

Nếu có truy cập trái quyền, mất dữ liệu hoặc nội dung nguy hiểm: đóng chế độ gia đình/withdraw bài, bảo toàn log đã giảm dữ liệu, xác định phạm vi, sửa hoặc rollback, thử lại rồi mới mở. `/health/live` chỉ cho biết tiến trình sống; `/health/ready` kiểm các bảng/cột chính có thể đọc. Chưa có hệ thống cảnh báo trực vận hành tự động.

## 7. Điều kiện trước pilot

- Có người duyệt phù hợp và 12 bài thực tế đã được duyệt, kèm nguồn/ngày/phiên bản.
- Chốt người hỗ trợ, kênh liên hệ, ngân sách và chính sách backup/xóa dữ liệu.
- Kiểm cấu hình HTTPS, cookie, proxy, hạn mức và khôi phục trên môi trường đích.
- Dùng thử trên Android/iPhone thật, kiểm font lớn, bàn phím, screen reader, nội dung dài và mạng yếu.
- Chạy pilot tự nguyện có phụ huynh; thu lỗi sử dụng và hiểu nhầm, không suy diễn XP thành năng lực an toàn ngoài đời.

Các bước này chưa được đánh dấu đạt. Không cần mở camera AI, SOS, mesh hoặc native để pilot bản học web.
