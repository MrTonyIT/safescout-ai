# Milo — bản giao diện game để chốt hướng thiết kế

Ngày thực hiện: **27/09/2026**. Căn cứ: [workflow người dùng cung cấp](../ui-workflow-2026-09-27/WORKFLOW-UI-ANIMATION-MOBILE.md). Phạm vi đợt này: bộ ba màn bản đồ–nhiệm vụ–kết quả, chạy trọn H01 với dữ liệu tổng hợp. Chưa nghiệm thu toàn bộ workflow, iOS/Android hay chất lượng nội dung dành cho trẻ.

## 1. Mở và xem bản đã làm

Chạy `npm run preview:curriculum` tại thư mục dự án, mở **http://localhost:8081**, chọn “Vào bản học thử”. Nếu đã vào trước đó, tải lại trang. Cần dùng bundle web mới trong `scratch/completion-web`; hướng dẫn build nằm ở README gốc. Mỗi lần khởi động lệnh preview tạo DB tổng hợp mới để thử, không phải dữ liệu gia đình thật.

Hành trình: chạm đảo “Cốc nước vừa rót” → “Học phần 1” → chạm dấu + quan sát cảnh → “Sẵn sàng chọn” → trả lời và xem lời giải → nộp bài → kết quả được máy chủ xác nhận → thực hành cùng cha mẹ/đối chiếu nguồn.

| Bản đồ | Cảnh quan sát | Lựa chọn | Kết quả |
|---|---|---|---|
| [Ảnh 390 px](map-390.png) | [Ảnh 390 px](scene-390.png) | [Ảnh 390 px](choice-390.png) | [Ảnh 390 px](result-390.png) |
| [Ảnh 320 px](map-320.png) | [Ảnh 320 px](scene-320.png) | [Ảnh 320 px](choice-320.png) | [Ảnh 320 px](result-320.png) |

Ảnh chụp từ ứng dụng chạy thật trong trình duyệt thử, dữ liệu giả được ghi rõ. Đường viền quanh tiêu đề thể hiện focus bàn phím trong lượt thử, không phải ô nhập liệu. [Bản đồ tablet](map-768.png), [desktop](map-1440.png), [cửa sổ nhiệm vụ](mission-sheet-390.png), [bài khóa](locked-mission.png).

## 2. Hướng thiết kế đang đề nghị

**Sổ tay phiêu lưu của Milo:** nền xanh đậm, giấy màu kem, điểm nhấn vàng, cảnh có nét viền và màu ấm. Giữ cún Milo và đảo nổi gốc; thay danh sách thẻ dài bằng đường đi và nhiệm vụ có điểm bắt đầu rõ. Cảnh H01 có đồ vật để quan sát; đáp án vẫn có nút có chữ, phục vụ trẻ không thể thao tác trực tiếp trên hình.

Màn hỏi chỉ trình bày một quyết định, xác nhận rồi mới hiện giải thích. Không tính điểm bằng vị trí vật thể hoặc thứ tự đáp án. Quan sát dấu + là tùy chọn; không bắt chạm đúng một điểm nhỏ mới cho học tiếp.

Kết quả dùng điểm và sao từ biên nhận; không tạo XP mẫu, không thưởng thêm chỉ vì phát animation. Câu chữ phân biệt hoàn thành một phần học với hoàn thành cả chặng. Kết quả của nội dung đã rút được trình bày như lịch sử, không hiện lại hướng dẫn cũ.

## 3. Những gì đã thực hiện

- Hệ màu và các thành phần dùng chung cho ba màn: khung, tiêu đề, nút, thẻ, chỉ báo, trạng thái lựa chọn và kết quả.
- Bản đồ có đường đi, chặng hiện tại, trạng thái khóa/đã học, đổi chương và cửa sổ mở đúng phần học. Tìm kiếm xuyên các chủ đề; đóng tìm kiếm cũng xóa bộ lọc.
- H01 có SVG riêng, cảnh quan sát/người lớn giúp, ba điểm quan sát và nút có nhãn tương đương. Tranh không kéo méo khi đổi chiều rộng.
- Tách quan sát, trả lời, giải thích, kết quả và thực hành. Nguồn tham khảo xem được sau bài; không mở liên kết ngoài từ màn trẻ.
- Bản nháp, hàng đợi, idempotent attempt, chấm điểm và kiểm tra phiên bản tiếp tục sử dụng cơ chế dữ liệu hiện có. Gắn scene H01 bằng `presentation.scene` và `revision` trong nội dung có fingerprint, không đoán scene từ tiêu đề/ID đáp án.
- Milo dùng hai ảnh hiện có và sáu trạng thái trình bày. Chuyển động nhẹ có tùy chọn giảm; dừng khi blur/background, khi giảm chuyển động, khi ảnh lỗi; web dừng khi mascot ra ngoài viewport. Không gọi đây là sáu pose vẽ mới hoặc rig hoàn chỉnh.
- Lựa chọn giảm chuyển động được lưu; ưu tiên thiết lập của hệ điều hành. Đọc lỗi dữ liệu tùy chọn không bị âm thầm ghi đè. Âm hiệu ứng/rung chưa có adapter nên hiển thị chưa dùng; giọng đọc web có điều khiển riêng như trước.
- Bố cục co giãn ở 320–1440 px; chiều cao node bản đồ theo nội dung để chữ lớn không đè node kế tiếp. Điểm kết quả lớn tự tăng vùng hiển thị, cho Milo xuống hàng khi cần.

## 4. Bằng chứng và giới hạn kiểm tra

| Kiểm tra | Bằng chứng/phạm vi |
|---|---|
| Kiểu dữ liệu backend/mobile và build | Đã chạy typecheck, Nest build, Expo web export; không phải native build |
| Hành vi dữ liệu và motion/preferences | **58/58 pass, 0 fail** — [log kiểm thử](tests.log); gồm các kiểm tra backend, HTTP gia đình, backup, giáo trình, lưu lựa chọn và vòng đời motion dùng mô phỏng |
| Luồng học dữ liệu tổng hợp | [Kết quả hồi quy](../completion-2026-09-27/completion-stage-browser-results.json): sai 0 điểm, offline pending, gửi lại, khôi phục nháp, nhiều phần học, XP/reload |
| Tài khoản gia đình | [Kết quả](../completion-2026-09-27/browser-family-results.json): tạo tài khoản/hồ sơ, lịch sử, phản hồi, xóa và đăng xuất |
| Lát cắt H01 | [Kết quả và số đo](browser-results.json): bản đồ, tìm bài khóa, modal bàn phím, lưu giảm chuyển động, cảnh, đáp án, nguồn và kết quả |
| Cỡ chữ 200% | [Bản đồ](map-text200-320.png), [cảnh](scene-text200-320.png), [kết quả](result-text200-320.png); mô phỏng tăng chữ trên web, kiểm tra vùng chạm và score/mascot. Không thay thế Dynamic Type/Android font scale trên máy thật |
| Vòng đời 20 chu kỳ | Test mock xác minh cleanup timer/animation/subscription/observer. Chưa đo memory/FPS/nhiệt/pin bằng native renderer |

[Manifest mã và bundle đã kiểm tra](evidence-manifest.json). Ba kịch bản trình duyệt đã pass trong lượt cuối. Các lỗi phát hiện trong lúc làm đã sửa: từ ngữ kết quả quá rộng; mất nguồn tham khảo; bộ lọc bị ẩn nhưng vẫn có hiệu lực; lựa chọn chưa công bố trạng thái checked trên web; tranh nền bị kéo tỷ lệ; số điểm chồng mascot khi tăng chữ; phản ứng Milo bị bỏ qua lúc đang tải tùy chọn; animation vẫn chạy khi mascot ngoài viewport web. Không dùng việc test pass để khẳng định không còn lỗi.

## 5. Đối chiếu 18 ticket trong workflow

“Đã làm trong lát cắt” vẫn cần người dùng chốt hướng mỹ thuật. Không tự đóng gate thiết kế thay người dùng.

| Ticket | Trạng thái thực tế | Việc còn lại |
|---|---|---|
| UI-01 | Đã kiểm kê, giữ snapshot và route gốc | [Sổ route](ASSETS-AND-ROUTES.md) |
| UI-02 | Đã làm map/chi tiết nhiệm vụ trong lát cắt | Chốt hướng mỹ thuật và thử trẻ sau duyệt |
| UI-03 | Đã nối tìm kiếm/tiếp tục/pending | Thử sử dụng trên thiết bị thật |
| UI-04 | Hệ thành phần cho ba màn | Áp có kiểm soát lên các màn còn lại sau gate V2 |
| UI-05 | H01 có cảnh tương tác quan sát | Duyệt storyboard và minh họa cùng chuyên gia |
| UI-06 | Các giai đoạn học đã tách, giữ nháp/retry | Thử độ dễ hiểu với nhóm người dùng |
| UI-07 | Scene/revision được gắn vào nội dung có fingerprint | Khi đổi ý nghĩa tranh phải tăng revision và duyệt lại; mở rộng schema khi thêm scene |
| UI-08 | Một renderer ở luồng mới, sáu trạng thái | Cần bộ pose/rig thống nhất có quyền nếu chọn sản xuất thêm |
| UI-09 | Có lifecycle và kiểm tra mock; web có observer | Profiling thật, native offscreen visibility, background/resume thực tế |
| UI-10 | Lưu giảm chuyển động; giọng đọc web hiện có | Audio/haptic native và công tắc âm toàn ứng dụng chưa hoàn tất |
| UI-11 | Kết quả theo receipt | Collection và hiệu ứng mở khóa mới chưa làm |
| UI-12 | Không mở link ngoài trong màn trẻ; API gia đình có quyền như trước | Thiết kế/kiểm tra parental gate hoàn chỉnh cho khu cha mẹ và store |
| UI-13 | Loading/error/pending/recovery giữ ở luồng chính | Chưa làm ma trận toàn S01–S14 |
| UI-14 | Safe-area component, kiểm tra kích thước web | Notch/back/keyboard/session iOS–Android chưa đạt gate |
| UI-15 | Có kiểm kê nguồn và snapshot | Xác minh quyền ảnh cũ; tối ưu kích thước; đồng bộ icon/splash theo mascot đã chốt |
| UI-16 | Minigame legacy vẫn đóng | Chỉ nối lại sau chuyển nội dung/version và có thao tác tương đương |
| UI-17 | Chưa đóng | Cần trace release trên máy tham chiếu; không claim 60 FPS |
| UI-18 | Chưa đóng | Beta, store screenshots/binary, tài khoản ký và phát hành |

## 6. Gate tiếp theo và phần cần người thật

**Gate hiện tại: duyệt bộ ba màn theo V2.** Workflow ghi: “Sau khi bộ ba được chốt, làm một lát cắt H01 từ đầu đến cuối rồi mới nhân rộng.” Đợt này nối thử H01 để đánh giá cả tương tác và dữ liệu trên ba màn; chưa nhân rộng artwork ra 12 bài hoặc bật lại minigame. Cần người dùng chốt phong cách bản đồ, mức độ minh họa và cách trình bày kết quả trước giai đoạn mở rộng.

**V1 native chưa qua.** [Báo cáo kiểm tra](NATIVE-READINESS.md) ghi rõ thiếu công cụ Android/iOS sử dụng được; xung đột screens/native-stack; endpoint và origin/session cần đường native; audio/export còn phụ thuộc web. Chưa có APK/IPA đã kiểm, chưa đưa lên store.

Người duyệt nội dung hiện chưa có theo thông tin người dùng. Cả nội dung lẫn tranh vẫn là bản nháp nội bộ. Quyền hai ảnh Milo, thiết bị thử, tài khoản ký/phát hành, ngân sách và vận hành cộng đồng vẫn cần xác minh/chốt. Không tạo hồ sơ chuyên gia hoặc quyền tài sản giả.

Chặng tiếp sau khi chốt thiết kế: hoàn thành đường native → củng cố H01 trên thiết bị → mở rộng UI các màn/scene theo ưu tiên → duyệt nội dung và tài sản → pilot → beta → store. Cuộc thi AI Arena là một hướng riêng phải theo đề/thể lệ; giao diện đẹp không tự chứng minh đủ điều kiện hoặc dự đoán thắng.

## 7. Khôi phục và phạm vi thay đổi

- Snapshot trước đợt UI ở `scratch/before-ui-workflow-2026-09-27`; baseline và manifest gốc vẫn giữ theo sổ route. Không xóa ảnh hoặc màn legacy.
- Backend chỉ thêm phần chiếu metadata scene trong giáo trình; không đổi thuật toán chấm, thưởng, quyền hoặc schema DB trong đợt UI này.
- Muốn quay lại presentation cũ: khôi phục các file UI đã snapshot và dùng hợp đồng dữ liệu hiện hành; không chép DB thử đè DB đang vận hành, không xóa tiến độ. Bỏ metadata scene chỉ cần fallback phần đọc, không đổi kết quả đã lưu.
- Không gọi baseline snapshot đơn lẻ là bản backup toàn hệ thống. Dùng quy trình backup/restore đã có cho dữ liệu thật.
