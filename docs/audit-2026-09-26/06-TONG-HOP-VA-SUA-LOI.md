# Tổng hợp ba tài liệu và đợt sửa tiếp theo

Ngày 26/09/2026. Đọc tài liệu này để biết trạng thái **sau báo cáo 05 và sau triển khai giao diện 03**. Báo cáo 01/05 và script tái hiện của chúng là bằng chứng lịch sử, không phải kết quả kiểm thử hiện tại.

**Kết quả:** đã triển khai luồng học nội bộ mới, sửa các vấn đề lõi được tái hiện và bổ sung kiểm tra. Chưa phát hành cộng đồng; chưa có xác thực gia đình hoặc nội dung được chuyên gia duyệt. Chưa có cơ sở kết luận đã sửa mọi lỗi trong toàn bộ dự án.

## 1. Phạm vi đã thực hiện

Snapshot trước đợt này: `scratch/before-third-stage`. Không áp schema hoặc seed lên DB dự án; mọi thử nghiệm DB dùng file mới trong scratch. Có thêm script tạo fixture để lần sau kiểm lại mà không dùng nội dung/hồ sơ thật.

### Tám phát hiện của báo cáo 05

| ID | Sửa đã thực hiện | Bằng chứng / giới hạn còn lại |
|---|---|---|
| N01 | Hoàn thành bài phải đủ checkpoint; chỉ thưởng khi lần đầu hoàn tất bài. Trang Học mở từng lesson/checkpoint, có Tiếp tục. | Test nhiều phần + web 1/2 không XP, 2/2 mới 40 XP; dữ liệu tiến độ sai từ trước chưa tự được chữa trên DB thật. |
| N02 | Kiểm prerequisite trong lấy đề và nộp bài; không chỉ khóa nút. | Test gọi trực tiếp bài bị khóa bị từ chối. Đây không phải ownership gia đình. |
| N03 | Đề có fingerprint; payload và queue mang version; transaction từ chối version khác trước ghi. | Test đổi nội dung trả lỗi, không ghi kết quả. Chưa có kho phiên bản bất biến và quy trình rút bài Q16. |
| N04 | Lỗi vĩnh viễn được giữ riêng, không chặn bài hợp lệ phía sau. Tải danh sách độc lập với queue; có nút gửi lại và mã đối chiếu. | Test 404 + bài hợp lệ đạt. Chưa tự đồng bộ nền hoặc xử lý nhiều tab/thiết bị. |
| N05 | Thêm migration baseline trước delta; hướng dẫn DB mới/cũ và trường hợp đã db push. | Test migrate deploy trên DB mới; nâng cấp DB baseline có dữ liệu; backup đóng DB và khôi phục sang file khác. Chưa áp DB thật. |
| N06 | Mở vùng/bài theo hoàn thành các bài trước, không dựa level cố định thiếu quy tắc tăng. | Test vùng unlockLevel=99 vẫn mở sau đủ prerequisite; level không được dùng như mức năng lực. |
| N07 | Seed không tạo/upsert người dùng hoặc PIN; mặc định chặn seed nháp; bỏ Lightning Crouch khỏi seed mới. | Test seed hai lần giữ 37 XP/level, không tạo PIN, không tạo bài đã rút. DB cũ cần quy trình rút riêng. |
| N08 | Màn bài mới reset theo checkpoint; generation bỏ response tải/nộp cũ; khóa chống xác nhận/nộp lặp. | Đọc mã và luồng UI đổi phần đã chạy. Chưa mô phỏng đầy đủ response race trên mọi nền tảng. |

## 2. Sổ tổng hợp 50 mục gốc

“Đóng trong luồng hiện tại” không có nghĩa đã hoàn thiện lại mã legacy. Mã của chức năng ngoài phạm vi vẫn giữ trong dự án nhưng không import vào navigator hiện tại; API nguy cơ vẫn đóng.

| ID | Trạng thái mới nhất |
|---|---|
| A01 | Bypass PIN đã bỏ và test; tài khoản gia đình vẫn đóng. |
| A02 | Không unlock offline giả; tính năng phụ huynh đóng. |
| A03 | Liệt kê hồ sơ toàn cục bị chặn; ownership chưa có. |
| A04 | Không báo SOS gửi thành công giả; SOS đóng. |
| A05 | Bỏ vị trí mặc định; chưa có định vị native được nghiệm thu. |
| A06 | Mesh/guardian không nằm trong bundle của navigator hiện tại; chưa triển khai kênh thật. |
| A07 | Bỏ mã hóa/verified giả; dashboard chứa nhãn legacy không được tải. |
| A08 | UNKNOWN có test; AI bị chặn, chưa nghiệm thu ảnh thật. |
| A09 | Không mở camera/upload trong luồng hiện tại; làm mờ ảnh chưa có. |
| A10 | Bỏ chứng nhận không có hồ sơ ở inventory; luồng mới không có claim chứng nhận. |
| A11 | Còn thiếu phiên, ownership, hạn mức. Loopback/gate chỉ dành nội bộ. |
| A12 | PIN không đi vào luồng mới; màn legacy chưa đủ điều kiện mở lại. |
| A13 | Chưa có sổ dữ liệu/chính sách giữ/xóa đầy đủ; AI đóng. |
| A14 | Không tải chế độ pin 48h trong luồng mới; chưa có phép đo pin. |
| B01 | Luồng mới dùng đúng checkpoint ID và hiện mọi phần, đã kiểm. |
| B02 | Sai/trống không pass; test và web nhận 0 đạt. |
| B03 | Chấm theo dữ liệu, không ID suffix; có test. |
| B04 | Minigame legacy ngoài luồng/bundle đang chạy; chưa sửa toàn bộ gameplay. |
| B05 | Không có đề mẫu thay lỗi API; thiếu cache bài qua restart. |
| B06 | Không có thông báo cài đặt/PIN thành công giả; chức năng đóng. |
| B07 | Bỏ ghi đè inventory khi khởi tạo, test storage adapter đạt; UI không dựa kho thưởng cục bộ. |
| B08 | Queue dùng AsyncStorage; SRS native cũ chưa hoàn thiện và không được tải. |
| B09 | Queue lưu trước gửi, receipt, phân loại lỗi; đồng bộ chủ động có test. Sync nền/multi-tab còn thiếu. |
| B10 | Không tải dashboard mẫu; báo cáo phụ huynh thật chưa có. |
| B11 | Không hiển thị streak; thuật toán streak legacy chưa đủ nghiệm thu. |
| B12 | Transaction, best score, idempotency và hoàn tất nhiều phần đã có test; nhiều tiến trình/thiết bị còn cần thử. |
| B13 | Màn chào không thu hồ sơ dư; vẫn danh tính học thử cố định, chưa có nhiều hồ sơ thật. |
| B14 | Bỏ hứa giới hạn giờ học ở luồng mới; bộ đếm phụ huynh chưa triển khai. |
| B15 | Phiên bài mới dùng thời gian phiên, không chèn SRS, không thời hạn phản xạ; chưa đo active-time khi background. |
| B16 | Không hiện mastery giả hoặc handbook chưa duyệt; SRS/handbook legacy chưa hoàn thiện. |
| U01 | Luồng mới 320 có nút Tiếp tục ở đầu và header gọn; có ảnh. |
| U02 | Khung nội dung co giãn tối đa 860, 4 viewport đã chụp. |
| U03 | Chữ nội dung 18/nhãn 14, nút 52/lựa chọn 56 trong luồng mới; không suy ra mọi màn legacy đã đổi. |
| U04 | Có role/tên/trạng thái, Tab cơ bản, chữ tăng mô phỏng; screen reader và toàn bộ accessibility còn cần kiểm. |
| U05 | Ba màn dùng cùng nền/thẻ/chữ/nút, không neon/radar; đã xem ảnh. |
| U06 | Scanner đóng và không import. |
| U07 | SOS đóng và không import. |
| U08 | Không timer/minigame giả; câu hỏi và lựa chọn là hành động chính. |
| U09 | Mở đầu một bước, bỏ khảo sát marketing và mốc 15/30/45 phút. |
| U10 | Thay bốn placeholder bằng asset thật có SVG nguồn; native crop/build chưa thử. |
| U11 | Luồng mới dùng “bài/phần/câu”, không thuật ngữ BKT/2.5D/lượng tử; mã legacy còn. |
| U12 | Không animation loop trong ba màn mới, dừng giọng khi rời màn, hủy áp response cũ; chưa đo tài nguyên 20 vòng. |
| O01 | Bỏ bài Lightning Crouch khỏi seed mới; chưa xử lý DB/cache cũ. Nội dung thật vẫn chưa được duyệt. |
| O02 | Có fingerprint kiểm đổi đề, chưa có authoring/review/publish/withdraw/immutable version đầy đủ. |
| O03 | Chỉ dùng giọng web theo thao tác; native audio chưa triển khai đầy đủ. |
| O04 | Phụ thuộc native chưa đồng bộ với SDK; không phát hành native. |
| O05 | AI health DISABLED; lỗi kết nối DB dừng khởi động thay vì giả vờ sẵn sàng. Readiness vận hành chưa đầy đủ. |
| O06 | 26 test, typecheck/build/web và browser script; chưa có lượt CI từ cài sạch trên dịch vụ. |
| O07 | Snapshot, baseline/delta, test nâng cấp/restore, ghi chú migration; Git/remote/staging/monitoring chưa hoàn thiện. |
| O08 | Chỉ tiếng Việt, không còn nút chọn ngôn ngữ giả. |

## 3. Bằng chứng kiểm tra

- [third-stage-tests.log](third-stage-tests.log): 26/26 test đạt. Có cả DB mới, nâng cấp DB cũ tổng hợp, restore DB đã đóng, seed hai lần, concurrent duplicate rồi retry. Không chứng minh load nhiều tiến trình hoặc native storage.
- [third-stage-browser-results.json](third-stage-browser-results.json): luồng web với API/SQLite thử thật, sai 0, đúng từng phần, thưởng đúng và reload. Queue service vẫn có test adapter giả lập; chưa phải E2E offline restart trình duyệt.
- [Đặc tả 03 cập nhật](03-GIAO-DIEN-VA-NGHIEM-THU.md): ảnh 4 viewport, trạng thái, phóng chữ mô phỏng và giới hạn nghiệm thu.
- Backend build, TypeScript hai phần và xuất web đạt trong đợt này. Bản xuất cuối tại `scratch/third-stage-final`; không công bố URL bên ngoài.
- Tài nguyên mới có nguồn tại `mobile/assets/ASSET-SOURCES.md`; chưa xác minh quyền ảnh Milo có sẵn.

## 4. Những việc vẫn cần làm trước cộng đồng

| Nhóm | Điều kiện chưa đạt | Cách xử lý tiếp |
|---|---|---|
| Tài khoản/dữ liệu | Danh tính cố định, không ownership gia đình, thiếu xóa/retention | Xây phiên và mô hình gia đình, thử truy cập chéo ở API/storage, thử xóa đúng phạm vi. |
| Nội dung | Chưa có người duyệt, chưa chốt 12 bài, không quy trình rút DB cũ | Tìm người duyệt theo hướng dẫn sẽ làm sau; lập hồ sơ từng bài, xuất bản phiên bản bất biến. Không tự coi fixture hình/màu là giáo trình. |
| Offline/đồng bộ | Chưa cache đề qua restart, chưa đồng bộ nhiều tab/thiết bị, queue bị chặn cần hỗ trợ đối chiếu | Thiết kế state/version/repair rõ, thử offline→restart→online và dữ liệu cũ. |
| UI/thiết bị | Chưa test trẻ/phụ huynh, screen reader, điện thoại thật, native | Kiểm theo ma trận 03, thực hiện pilot sau gate nội dung/dữ liệu; chưa hứa native. |
| Vận hành | Chưa cài sạch/CI từ xa, backup định kỳ, giám sát, đầu mối sự cố/ngân sách | Chốt môi trường, người phụ trách, diễn tập quy trình; không suy restore fixture thành backup production. |
| Phạm vi mở rộng | Dashboard, handbook, AI, SOS, minigame, đa ngôn ngữ còn đóng | Mỗi tính năng có gate và phép kiểm riêng; không bật lại đồng loạt các cờ. |

## 5. Chạy lại bản nội bộ có dữ liệu tổng hợp

1. `npm run prisma:generate`, `npm test`, `npm run build` từ gốc dự án.
2. `node scripts/create-internal-fixture.cjs`: tạo DB mới, không seed vào DB dự án. Đọc `databaseUrl` trong `scratch/internal-preview.json` và đặt DATABASE_URL của **tiến trình thử** tới giá trị đó; đặt INTERNAL_LEARNING_PREVIEW=true, PORT=3000, GEMINI_API_KEY trống. Chạy `node dist/src/main.js`.
3. Trong mobile, xuất web với EXPO_OFFLINE=1 bằng `npx expo export --platform web --output-dir ../scratch/third-stage-final`.
4. Từ gốc chạy `node scripts/serve-internal-web.cjs scratch/third-stage-final`; mở `http://localhost:8081`. Không chuyển host sang 0.0.0.0 hoặc chia sẻ proxy ra ngoài.
5. Script browser cần cổng CDP 9223 của trình duyệt thử riêng và DB fixture mới. Không dùng dữ liệu thật. Dừng hai tiến trình sau thử.

Nâng cấp DB đã có phải đọc [ghi chú migration](../../prisma/MIGRATION-NOTES.md), sao lưu và thử trên bản sao trước. Không áp reset/migrate resolve chỉ để bỏ qua lỗi chưa hiểu.

**Kết luận:** đã hoàn thành cập nhật tài liệu thứ ba và một đợt triển khai/sửa có kiểm chứng. Sổ lỗi đã được tổng hợp; còn các hạng mục nêu trên, nên chưa tuyên bố toàn bộ sản phẩm hoàn tất hoặc sẵn sàng phục vụ cộng đồng.
