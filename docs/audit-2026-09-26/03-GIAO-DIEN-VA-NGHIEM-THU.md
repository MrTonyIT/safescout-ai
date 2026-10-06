# Đặc tả cải tiến giao diện Milo

Mục tiêu: vui, dễ hiểu, ít gây nhiễu, hiển thị sự thật của dữ liệu. **Đã triển khai lát cắt học nội bộ ngày 26/09/2026** tại `mobile/src/screens/LearningFlow.tsx`. Các phần dài hạn bên dưới vẫn là đặc tả; không đánh dấu tất cả màn đã hoàn thành.

## 0. Bản đã triển khai và nghiệm thu hiện tại

### Quyết định giao diện

- Luồng chạy chính: **Mở đầu một bước → Trang Học → Chọn từng phần → Trả lời/Chưa biết → Lời giải → Gửi bài → Kết quả → Tiếp tục**.
- Trang Học dùng danh sách chủ đề/bài/phần có nhãn, cùng nút Tiếp tục ở đầu. Bản đồ trang trí cũ được giữ trong mã tham khảo, không còn là màn chạy chính. Quyết định này xử lý việc bỏ sót lesson/checkpoint và tạo đường học có thể thao tác bằng bàn phím. Chưa đưa bản đồ trực quan trở lại trước khi có cùng khả năng truy cập mọi phần học.
- Bỏ khảo sát nguồn giới thiệu/tuổi/thời lượng ở màn chào nội bộ; không xin camera, vị trí hay thông báo. Không tự thu thêm hồ sơ trẻ.
- Không hiển thị nút giả minigame/ngôn ngữ/streak; không tự đọc, không âm thanh phạt, không animation lặp trong ba màn cốt lõi. Giọng đọc chỉ chạy khi người dùng bật rồi bấm Nghe; lựa chọn được lưu trên thiết bị. Các màn legacy không được import vào navigator đang chạy.
- Nền #F5F7F4, thẻ trắng, chữ #243E50, hành động #174B70. Body 18, nhãn phụ 14, tiêu đề 20/28; nút tối thiểu 52 cao, lựa chọn 56; spacing 16/20; khung tối đa 860. Không đặt chiều cao cố định cho đoạn chữ hoặc cố định dock trên nội dung.
- Trạng thái chọn có chữ “Đã chọn” hoặc số thứ tự, không chỉ đổi màu. Nút có role/tên và disabled; tiêu đề có role heading, thông báo lỗi có role alert.
- Biểu tượng chữ M và sách có nguồn vector `mobile/assets/milo-mark.svg`; PNG icon/splash/adaptive 1024×1024, favicon 64×64. Cần thử crop native; quyền ảnh cún Milo cũ vẫn cần chủ dự án xác minh.

### Ma trận trạng thái đã nối dữ liệu

| Tình huống | Hành vi hiện tại |
|---|---|
| Chưa mở backend / 503 | Báo luồng nội bộ chưa mở, cho tải lại; không hiển thị bài mẫu. |
| Mạng lỗi | Lỗi rõ; nội dung đã tải trên màn không bị biến thành đề khác. Chưa có cache bài qua restart. |
| Danh sách trống | Hiển thị chưa có nội dung, không tự tạo vùng/huy hiệu. |
| Bài khóa | Nút disabled kèm nhãn; server cũng kiểm prerequisite khi lấy đề/nộp. |
| Bài nhiều phần | Mỗi phần có nút riêng và trạng thái đã đạt; nút Tiếp tục chọn phần chưa đạt. |
| Chưa biết | Ghi câu bỏ trống và cho xem lời giải; không tính đúng. |
| Nộp / retry | Lưu queue trước gửi; dùng cùng attemptId/payload, chỉ hiện điểm sau receipt. |
| Đề đổi / 409 | Không chấm theo đáp án mới âm thầm; báo cần đối chiếu và giữ bài làm. |
| Queue có bài lỗi vĩnh viễn | Giữ bài có mã đối chiếu/lý do, gửi tiếp các bài hợp lệ; vẫn tải được trang Học. |
| Thành công | Hiển thị đúng số câu, điểm, lời giải; về Học tải tiến độ thật. |

### Bằng chứng giao diện

Script [third-stage-browser.cjs](third-stage-browser.cjs), kết quả [third-stage-browser-results.json](third-stage-browser-results.json). Dữ liệu tổng hợp là bài hình/màu để kiểm phần mềm, không phải giáo trình an toàn được duyệt.

| Kiểm tra | Kết quả / giới hạn |
|---|---|
| 320, 390, 768, 1440 px | Không tràn ngang trong trang Học đã chụp; chưa đại diện mọi độ dài nội dung. |
| Luồng sai → đúng → phần tiếp | Sai 0, phần 1/2 chưa thưởng, 2/2 nhận 40 XP, mở chủ đề tiếp. |
| Reload | Giữ tiến độ trên DB thử và hiển thị lại 40 XP. |
| Chữ gấp đôi ở 320 | Mô phỏng CSS tăng chữ/line-height không tràn ngang; không tương đương nghiệm thu OS font scaling/native hoặc WCAG toàn bộ. |
| Tab | Focus tới nút Tiếp tục có role/tên; chưa kiểm toàn bộ screen reader/keyboard combinations. |
| Runtime | Không ghi nhận exception trong hành trình script; không phải chứng minh không crash mọi tình huống. |
| Build web | Bundle JS khoảng 699 kB trước nén, từ khoảng 2.7 MB của bản trước. Chưa suy ra FPS/LCP/INP từ kích thước bundle. |

Ảnh: [Mở đầu 320](third-welcome-320.png), [Học 320](third-home-320.png), [Học 390](third-home-390.png), [Tablet](third-home-768.png), [Desktop](third-home-1440.png), [Bài học](third-lesson-320.png), [Kết quả sai](third-result-zero.png), [Hoàn tất hai phần](third-two-parts-complete.png), [Chữ gấp đôi](third-home-text200-320.png).

### Chưa nghiệm thu

Điện thoại thật, Safari iOS, TalkBack/VoiceOver, mọi trạng thái focus, native audio/storage, 20 vòng mở/đóng có đo tài nguyên, tương phản toàn bộ trạng thái, nội dung dài/đa kiểu câu trên UI, người dùng trẻ/phụ huynh thật và quyền tài nguyên. Không tuyên bố giao diện đã “hoàn hảo”. Những màn ngoài lát cắt hiện tại vẫn đóng; số huy hiệu trên trang Học không thay thế một trang thành tích đầy đủ.

Các mục 1–7 dưới đây là định hướng mở rộng sau lát cắt này; khi khác với quyết định mục 0, mục 0 mô tả chính xác bản đang chạy. Tổng hợp lỗi và sửa sau cả ba tài liệu ở [06-TONG-HOP-VA-SUA-LOI.md](06-TONG-HOP-VA-SUA-LOI.md).

## 1. Hướng mỹ thuật

Giữ Milo cún cứu hộ và bản đồ khám phá. Chọn một cách thể hiện linh vật thống nhất, không đổi loài giữa màn; kiểm tra quyền sử dụng nguồn ảnh trước phát hành. Tạo nhận diện riêng và hồ sơ tài nguyên, không dùng tên hãng hoạt hình như lời bảo chứng.

Không cần biến mọi thành phần thành đồ họa 3D. Dùng chiều sâu cho nút chính, đảo và phần thưởng; nội dung học đặt trên nền yên tĩnh. Bớt neon/glow/radar lặp liên tục. Mỗi màn có một hành động chính và tối đa một chuyển động thu hút chú ý cùng lúc trong vùng đang đọc.

| Thành phần | Quy tắc đề xuất |
|---|---|
| Màu | Navy cho điều hướng, nền kem hoặc xanh rất nhạt cho nội dung, xanh đậm cho hành động, cam/vàng cho phần thưởng; đỏ dành cảnh báo có nghĩa rõ |
| Chữ | Một họ chữ hỗ trợ tiếng Việt tốt; body mục tiêu 16–18, tiêu đề 22–28, nhãn phụ 12–14; cỡ cuối cùng theo thử nghiệm thực tế |
| Độ đậm | Body regular/medium; tiêu đề semibold/bold; tránh mọi dòng đều 900 và in hoa |
| Khoảng cách | Token 4/8/12/16/24/32; card padding 16–24; khoảng lựa chọn đủ tách thao tác |
| Vùng chạm | Mục tiêu sản phẩm tối thiểu 48×48 đơn vị bố cục, nút trẻ dùng thường xuyên 52–56 cao; đo vùng chạm thật |
| Tương phản | Kiểm tra chữ thường 4.5:1, chữ lớn 3:1 theo điều kiện WCAG; trạng thái không chỉ dùng màu |
| Viền và bóng | Một cấp nhấn chính, bóng nhẹ; không mỗi card một glow nhiều màu |
| Motion | Phản hồi ngắn; loop tắt khi blur/unmount; chế độ giảm chuyển động; không rung/còi phạt lỗi học |
| Asset | Icon/splash thật; xuất kích thước phù hợp; ghi nguồn/quyền; tối ưu dung lượng có kiểm tra độ nét |

Không áp màu chỉ từ bảng: phải đo trên cặp màu thực tế, gồm nhãn nhỏ và trạng thái disabled. Tham chiếu [WCAG 2.2](https://www.w3.org/TR/WCAG22/); 48×48 là mục tiêu thiết kế riêng, không đồng nhất với mức AA 24×24 có ngoại lệ.

## 2. Kiến trúc thông tin

Điều hướng bản đầu đề xuất: **Học — Cẩm nang — Thành tích — Ba mẹ**. Nút **Cần trợ giúp** dễ thấy và truy cập độc lập; không đặt lời hứa gửi SOS khi chưa có kênh thật. AI chỉ xuất hiện khi đủ gate, có thể dưới chế độ cùng phụ huynh. Không đặt công nghệ chưa hoàn thiện ở vị trí trung tâm sản phẩm.

Luồng chính: vào học thử → xem một tình huống → nghe/đọc → chọn hành động → nhận giải thích → lưu tiến độ → gợi ý cha mẹ cùng thực hành. Mỗi màn giải quyết một việc.

Luồng phụ huynh: thiết lập hồ sơ tối thiểu → cấu hình phù hợp → xem trẻ đã học gì/cần ôn gì → thực hành cùng con → phản hồi/xóa dữ liệu. Không biến dashboard thành bảng thuật ngữ AI.

## 3. Bản thiết kế theo màn

| Màn | Giữ | Thay đổi | Tiêu chí nghiệm thu |
|---|---|---|---|
| Bắt đầu | Milo và thẻ lựa chọn | Cho học thử nhanh; bỏ khảo sát marketing khỏi luồng trẻ; thiết lập tuổi với cha mẹ; có quay lại/bỏ qua | Người mới tới bài đầu trong vài thao tác; không xin mọi quyền ngay từ đầu |
| Trang Học / bản đồ | Các vùng và đảo | Nút Tiếp tục bài đang học ở đầu; tên bài đọc được; chỉ hiện vùng có nội dung thật; thống kê phụ thu gọn | 320 px vẫn thấy hành động chính; không phải đoán ý nghĩa cờ/sao |
| Tour | Spotlight đã có Bỏ qua | Tối đa 3 bước theo việc cần làm; chỉ hiện tính năng đã bật; không chặn trợ giúp | Bỏ qua được, mở lại được, resize không lệch mục tiêu |
| Bài học | Thẻ đáp án lớn | Tình huống ngắn, ảnh phục vụ nội dung; nghe lại; không tính giờ khi đang đọc lần đầu; minigame là hoạt động rõ mục tiêu | Hiểu câu hỏi không cần biết BKT/2.5D; không lẫn “Ải” với số câu |
| Phản hồi | Milo khích lệ | Nói lựa chọn nào đúng và vì sao; sai không còi khẩn; không nói thành thạo từ một lần đúng | Trẻ có thể giải thích lại; kết quả khớp dữ liệu chấm |
| Thành tích | Bộ huy hiệu | Khởi đầu 0; nêu điều kiện nhận; đồng bộ thật; bỏ tỷ lệ thành thạo quy từ số huy hiệu | Restart không mất; huy hiệu không được gọi chứng nhận cứu hộ |
| Cẩm nang | Nhóm chủ đề | Tìm nhanh, nguồn/ngày duyệt cho cha mẹ; đánh dấu đã tải; chỉ mục theo tình huống | Offline chỉ mở nội dung đã có, không âm thầm thay vùng |
| Thử tình huống / AI | Mẫu học minh họa nếu hữu ích | Mẫu tách camera; nhãn rõ; quyền xin lúc dùng; không đủ dữ liệu có trạng thái riêng | SOI không gọi mẫu nấm; không hứa tự làm mờ khi chưa có |
| Trợ giúp | Các kênh liên hệ phù hợp đã xác minh | Hành động liên hệ ở đầu; còi phụ, giảm trang trí; trạng thái kết nối/định vị trung thực | Không cuộn qua hiệu ứng để tìm trợ giúp; không gọi thật khi diễn tập |
| Cổng phụ huynh | Bàn phím đơn giản | Thiết lập lần đầu, xác thực thật, lỗi dễ hiểu, khóa lại; bỏ nhãn pháp lý trang trí | Mạng lỗi không mở cửa; phiên không nằm trong URL chứa PIN |
| Báo cáo phụ huynh | Bài đã học và hoạt động cùng con | Bỏ số liệu mẫu/SOS đỏ cố định; ba câu: đã học gì, cần ôn gì, cha mẹ làm gì | Trẻ chưa học thấy empty state; không có cảnh báo giả |
| Cài đặt | Thời lượng/ngôn ngữ | Âm thanh, giọng đọc, giảm chuyển động; lưu thật; chỉ ngôn ngữ hoàn chỉnh | 0 phút/không giới hạn xử lý đúng; không báo lưu thành công khi thất bại |

## 4. Ma trận trạng thái phải thiết kế trước khi code

| Tình trạng | Màn Học | Bài học | Phụ huynh | AI/trợ giúp nếu bật |
|---|---|---|---|---|
| Đang tải | Skeleton nhẹ | Tải đúng bài, chưa đếm giờ | Đang tải hồ sơ đã xác thực | Nêu đang xử lý, không kết luận |
| Chưa có dữ liệu | Mời học bài đầu | Bài chưa phát hành thì không mở | Chưa có lịch sử, không bịa điểm | Chưa có vị trí/người nhận |
| Lỗi máy chủ | Thử lại / bài đã tải | Giữ câu trả lời đang có | Lỗi rõ, không thay bằng báo cáo mẫu | Không gọi là an toàn/đã gửi |
| Offline | Nhãn bài đã tải | Đúng version hoặc chờ kết nối | Chỉ dữ liệu cache được phép, có thời điểm | Phân biệt tính năng cục bộ và cần mạng |
| Thành công | Tiến độ thật | Điểm, giải thích, thưởng đúng | Cài đặt/báo cáo đúng nguồn | Receipt hoặc giới hạn phân tích rõ |
| Không có quyền | Không cần quyền dư | Không chặn học vì camera | Xác thực lại khi cần | Giải thích và lựa chọn thay thế |

## 5. Responsive và khả năng tiếp cận

- 320–430 px: một cột; header không ép tên thành từng chữ; dock không che phần tử focus hay đáp án; safe-area đúng.
- Tablet: khung nội dung đọc được, bản đồ và tiến độ có thể chia hai vùng; không phóng chữ nhỏ thành vùng trống.
- Desktop: chọn max-width đồng bộ (ví dụ vùng làm việc khoảng 1100–1200 px) và bố cục có chủ ý; bài học giới hạn chiều dài dòng. Không bắt buộc có ba cột.
- Reflow theo chiều rộng thực tế, không chụp Dimensions một lần. Thử cold-start, resize và xoay ở nền tảng cho phép.
- Phóng chữ 200%; kiểm tra không cắt chức năng. Những vùng đồ họa đặc thù cần phương án đọc/danh sách tương đương.
- Nút chỉ icon có tên, trạng thái chọn/khóa có ngữ nghĩa; focus thấy rõ; modal giữ và trả focus; web có thao tác bàn phím.
- Thông tin không chỉ nằm trong màu hoặc âm thanh; ảnh trang trí không gây nhiễu screen reader, ảnh học có mô tả.
- Có giảm chuyển động và tắt âm; không mặc định hiệu ứng chớp toàn màn. Đánh giá riêng mọi flash và không tự chứng nhận an toàn chỉ bằng đếm timer.

## 6. Mẫu ngôn ngữ sản phẩm

| Hiện tại | Đề xuất |
|---|---|
| EDGE VISION ON-DEVICE <30MS | Thử nhận biết tình huống |
| BKT — P(L) 96% | Con đã trả lời đúng 4/5 câu trong bài này — chỉ hiện khi có dữ liệu |
| Đã gửi cảnh báo tới ba mẹ khi lỗi mạng | Chưa gửi được. Hãy thử cách liên hệ khác. |
| Khu vực này an toàn khi AI lỗi | Milo chưa phân tích được ảnh này. |
| 100% OFFLINE | Các bài đã tải có thể mở khi không có mạng — khi đúng thực tế |
| PIN 48H OLED | Giao diện tối giản |
| Chứng nhận bởi tổ chức X | Nguồn tham khảo: tài liệu X, ngày rà soát Y — chỉ khi thực sự tham khảo |
| PHẢN XẠ 7 GIÂY NGUY CẤP | Con sẽ làm gì trong tình huống này? |

Nội dung hướng dẫn hành động khẩn cấp cụ thể vẫn cần người chuyên môn duyệt; bảng này chỉ sửa cách biểu đạt trạng thái sản phẩm.

## 7. Quy trình duyệt đồ họa

1. Chốt một màn Học, một bài học và một kết quả bằng dữ liệu thật.
2. So ảnh trước/sau ở 320, 390, 768, 1440; kiểm tra tên dài, câu dài, font lớn, lỗi mạng.
3. Cho vài cặp phụ huynh–trẻ thực hiện một tác vụ có giám sát; ghi chỗ bấm nhầm/chưa hiểu thay vì chỉ hỏi “đẹp không”.
4. Điều chỉnh thứ bậc, chữ và thao tác trước; thêm chuyển động vừa đủ sau.
5. Đo hiệu năng trên bản phát hành và thiết bị tham chiếu; tối ưu ảnh/loop rồi mới áp mẫu ra toàn ứng dụng.

Định nghĩa một màn hoàn thiện: bố cục đúng + nội dung đúng + dữ liệu đúng + đủ trạng thái + thao tác được bằng phương thức hỗ trợ + không hứa điều hệ thống chưa làm.
