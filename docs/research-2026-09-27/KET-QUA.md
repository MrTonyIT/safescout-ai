# Kết quả nghiên cứu và tích hợp — 27/09/2026

Đã làm phần nghiên cứu có giới hạn và triển khai 12 bài nháp vào bản nội bộ. **Chưa đủ điều kiện phát hành cho trẻ/gia đình.** Không có công cụ riêng mang tên Deep Research trong phiên; đã dùng tìm kiếm web và đọc nguồn trực tiếp. Không tuyên bố tìm hết sách thế giới, đọc toàn bộ mọi tài liệu hoặc bảo đảm không còn lỗi.

## Phần đã giao

- Danh mục 16 nguồn có URL, tổ chức, phạm vi tuổi, quốc gia, mức đã đọc, cách sử dụng và giới hạn. Các bộ lớn chỉ mới đọc giới thiệu được đánh dấu rõ.
- 12 bài viết mới tiếng Việt, 3 chủ đề, 24 câu hỏi. Mỗi bài có mục tiêu, tình huống, lời giải, hoạt động ít rủi ro bằng lời/tranh và câu gợi trẻ giải thích lại. Đây là đánh giá trong bài, không đo được năng lực ứng phó thực tế.
- Hồ sơ duyệt [HTML](12-BAI-CHO-DUYET.html) / [Markdown](12-BAI-CHO-DUYET.md), sinh từ cùng dữ liệu nguồn. Tên người duyệt và xác nhận được để trống.
- Màn hình đọc bài và nguồn dành cho người lớn; kết quả/lời giải trước hoạt động cùng cha mẹ. Không yêu cầu trẻ nhập tiết lộ, tên người tin cậy, ảnh hoặc thông tin liên lạc.
- Công cụ tạo DB xem thử mới, 12 bản ghi DRAFT có phiên bản nội dung. Không sửa DB thật, không tự xuất bản. Tài khoản gia đình không truy cập được nội dung này.
- API chỉ đưa các trường bài đọc cần thiết ra giao diện. Lược bỏ dữ liệu nội bộ và đáp án đúng trong danh sách lựa chọn. Thay nội dung bài đọc làm thay đổi phiên bản duyệt.
- Hướng dẫn tìm người duyệt, các quyết định Việt hóa, thử dùng có giám sát và những phần không thể hoàn thành bằng đọc sách: [hướng dẫn chủ dự án](HUONG-DAN-CHU-DU-AN.md).

## Bằng chứng phần mềm

- 45/45 kiểm thử tự động đạt: 39 kiểm tra hồi quy và 6 kiểm tra bộ nội dung mới. Log: [tests.log](tests.log).
- Với cả 12 bài, kiểm tra sai hết = 0, đúng hết = 100, retry không nhân thưởng; 12 bài hoàn thành chỉ nhận tổng 240 XP một lần.
- Đã kiểm tra 12 bài đều DRAFT, tài khoản gia đình không thấy/mở được bài; nhập lại vào DB có giáo trình bị từ chối.
- Kiểm tra kiểu dữ liệu backend/mobile và build backend/web thành công.
- Bộ trình duyệt gồm luồng cũ, tài khoản gia đình và bài đầu trong bộ mới. Bằng chứng phần mới: [browser-results.json](browser-results.json), ảnh trong thư mục này. Bộ kiểm tra chạy Edge trên máy tính với kích thước màn hình giả lập; chưa phải Android/iPhone thật, kiểm toán trợ năng đầy đủ hoặc thử trẻ.
- Kiểm thử giao diện bộ mới tập trung bài H01; logic chấm kiểm thử cả 12. Chưa quan sát người dùng đọc toàn bộ 12 bài.
- Đã thêm bộ kiểm tra vào quy trình CI; chưa xác nhận chạy CI từ máy chủ GitHub.

## Chưa thể tự hoàn tất

1. Người chuyên môn duyệt từng bài, quy trình phản hồi khi trẻ kể bị hại và phù hợp bối cảnh Việt Nam. Người dùng hiện chưa có người duyệt.
2. Pilot thực tế với đồng ý và giám sát của phụ huynh; kiểm tra trẻ hiểu nội dung, không sợ hoặc hiểu nhầm. Chưa có bằng chứng hiệu quả giáo dục.
3. Thiết bị thật, native, ngoại tuyến đầy đủ, giao diện quản trị nội dung chuyên dụng và các hạng mục vận hành còn ghi trong [báo cáo trước](../completion-2026-09-27/KET-QUA-SUA.md).
4. Người trực hỗ trợ, ngân sách, nơi triển khai và chính sách vận hành; không tự phát hành công khai.
5. Xin phép chủ bản quyền nếu sau này muốn dùng nguyên sách, tranh hoặc nhân vật. Bản hiện tại chỉ dẫn nguồn và có tình huống mới.

Đọc thêm tài liệu có thể cải thiện bản nháp, nhưng không thay thế các điều kiện trên. Không đánh dấu hoàn thành chúng khi chưa có bằng chứng.
