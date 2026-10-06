# Khôi phục trải nghiệm game

Lỗi thay đổi trước: luồng khởi chạy đã được chuyển sang màn học dạng danh sách và biểu mẫu, làm mất bản đồ game người dùng muốn giữ. Các màn game và tài nguyên cũ vẫn còn trong dự án.

Đã đưa lại tài nguyên Milo, nền quần xã và đảo nổi có sẵn vào luồng chính. Bản đồ mới ánh xạ mỗi bài thật thành một chặng, thay vì chỉ đọc bài đầu trong mỗi stage. Màn học có Milo và thanh tiến trình; giữ logic chấm, bản nháp, hàng đợi và kiểm tra quyền đã sửa. Không sửa cơ sở dữ liệu thật.

Không phải phục hồi nguyên trạng mọi màn hình/minigame cũ. Các màn phụ bị đóng trước đó vẫn chưa được đưa lại. Bộ ảnh nhân vật cũ được khôi phục theo yêu cầu giữ thiết kế; chưa xác minh lại giấy phép phát hành công khai của tài nguyên này.

Đã kiểm tra TypeScript mobile, xuất bản web cục bộ và chạy bộ kiểm tra trình duyệt: luồng học, tài khoản gia đình, bộ 12 bài; có kích thước 320/390/768/1440 và phóng chữ. Kiểm tra bản đồ đảo trực tiếp và ảnh trong `docs/completion-2026-09-27`, bài học trong `docs/research-2026-09-27`. Đây là kiểm tra phần mềm trên máy tính, không thay thế thử thiết bị thật.

Bản trước sửa lưu tại `scratch/before-game-restoration-2026-09-27`. Mã chính nối giao diện nằm ở `mobile/src/components/GameJourney.tsx` và `mobile/src/screens/LearningFlow.tsx`.
