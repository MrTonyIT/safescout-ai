# Migration cho bản học thử

Đã bổ sung baseline `20260925_initial`, tiếp theo là delta `20260926_attempt_receipts`. Test hiện chạy `migrate deploy` trên DB mới, và thử nâng cấp từ schema baseline có dữ liệu tổng hợp. DB dự án chưa được thay đổi.

## DB mới, không có dữ liệu

Dùng DATABASE_URL trỏ rõ vào DB mới riêng; chạy `prisma migrate deploy`. Không trỏ nhầm vào DB đang dùng. Script `scripts/create-internal-fixture.cjs` tự tạo DB mới trong scratch và nội dung tổng hợp.

## DB đã có trước migration

Không áp baseline tạo bảng lên DB đã có bảng. Trước tiên đóng tiến trình ghi, backup DB, xác minh schema thực tế với baseline. Nếu khớp baseline và chưa có hai cột biên nhận, thử trên bản sao: `prisma migrate resolve --applied 20260925_initial`, rồi `prisma migrate deploy`. Chỉ áp DB thật sau khi phép nâng cấp và restore bản sao đạt.

Nếu DB đã thêm hai cột bằng db push hoặc có lịch sử migration khác, không chạy lại ALTER TABLE. Phải đối chiếu schema và `_prisma_migrations` trước khi quyết định đánh dấu migration nào đã áp. Không đánh dấu đã áp nếu cấu trúc thực tế chưa tương ứng. Không dùng reset để xử lý dữ liệu thật.

Phép restore tự động hiện là sao chép SQLite khi client đã đóng, khôi phục sang file khác và kiểm giá trị. Chưa xác nhận hot-backup, WAL đang có writer, backup mã hóa, tác vụ định kỳ hoặc hệ thống production.

## Nội dung

`prisma/seed.ts` mặc định từ chối chạy. Cờ ALLOW_UNREVIEWED_CONTENT_SEED=true chỉ dùng với DB thử để nạp bản nháp. Seed không tạo/ghi đè người dùng hoặc PIN; bài Lightning Crouch đã bỏ khỏi seed mới. DB cũ có bài này không tự bị xóa: vẫn cần quy trình rút nội dung và xử lý phiên bản đã lưu.
