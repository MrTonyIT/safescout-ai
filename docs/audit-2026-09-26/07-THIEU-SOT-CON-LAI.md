# Rà lại các thiếu sót còn lại — 26/09/2026

> Báo cáo lịch sử trước đợt sửa ngày 27/09. Trạng thái cập nhật và bằng chứng: [Kết quả sửa](../completion-2026-09-27/KET-QUA-SUA.md).

Phạm vi: bản mã sau đợt giao diện thứ ba. Lượt này đọc lại mã và chạy thêm phép thử, **không sửa mã sản phẩm hoặc DB dự án**. Bằng chứng mới: [script](followup-gaps.cjs), [kết quả](followup-gaps-results.json). DB thử được tạo mới trong scratch; storage/network/giọng nói dùng giả lập khi ghi rõ.

**Kết luận:** hiện là bản học thử nội bộ có luồng cốt lõi hoạt động, chưa phải sản phẩm cộng đồng hoàn chỉnh. 26 test trước đó vẫn chỉ chứng minh các trường hợp của bộ test, không phủ các tình huống mới dưới đây. Không tuyên bố đã tìm hết mọi lỗi có thể tồn tại.

## 1. Những trường hợp mới xác nhận

| Mã | Quan sát cụ thể | Bằng chứng | Ảnh hưởng / hướng xử lý |
|---|---|---|---|
| R01 | Hoàn thành bài nhận 40 XP; thêm hai checkpoint vào cùng bài; hoàn thành lần lượt hai phần mới làm XP thành 80. | SQLite thử, `rewardAfterAddingParts`. | Chống thưởng lặp khi retry đã có, nhưng không có sổ thưởng độc lập với trạng thái hoàn thành. Cần khóa duy nhất theo sự kiện/phạm vi thưởng và chính sách nâng phiên bản bài. |
| R02 | Sau sửa nội dung câu hỏi, không có lần làm bản mới nhưng bản đồ vẫn ghi COMPLETED. | SQLite thử, `oldPassAfterContentChange`. | Tiến độ gắn checkpoint ID, không phiên bản đã học. Phải chốt thay đổi nào giữ thành tích, thay đổi nào yêu cầu ôn lại; đây là chính sách còn thiếu, không khẳng định mọi chỉnh sửa đều phải xóa tiến độ. |
| R03 | Một lesson không có checkpoint vẫn UNLOCKED và khiến lesson sau LOCKED. | SQLite thử, `emptyDraftBlocksLater`. | Bài chưa sẵn sàng chặn lộ trình. Cần trạng thái xuất bản, lọc nội dung chưa hợp lệ, kiểm tính đầy đủ trước đưa vào lộ trình. |
| R04 | Queue gặp 403 rồi đánh blocked; sau khi máy chủ giả lập chấp nhận lại, sync không gửi request nào, bài vẫn bị giữ. | Adapter giả lập, `queueAfterPermissionRecovered`. | Không có đường khôi phục bài blocked hoặc phân biệt khóa tạm thời/quyền có thể phục hồi. Cần thao tác xem, kiểm tra lại, giải quyết lỗi; không tự xóa bài. |
| R05 | Gọi đọc rồi stop ngay vẫn phát sinh một lệnh speak sau đó. | Giả lập speech engine, `speechAfterStop`; không phải phát âm thanh thật. | Timer 30 ms trong voice service không bị hủy khi stop/mute/rời màn. Cần hủy timer hoặc generation token; kiểm thêm trên trình duyệt thật. |

R01 liên quan `learning.service.ts`: điều kiện thưởng dựa previousProgress.isCompleted; thêm phần mới có thể đưa nó trở lại false. R02 do truy vấn các testResults đã pass chỉ theo checkpointId. R03 do chuỗi mở khóa tính cả lesson rỗng. R04 ở `attemptQueue.ts`: blocked bị bỏ qua ở mọi lượt sync. R05 ở `voice.ts`: callback setTimeout gọi speak sau cancel.

## 2. Thiếu sót đọc được trong luồng hiện tại

| Mã | Thiếu sót | Mức xác nhận |
|---|---|---|
| R06 | Bài đang làm chỉ lưu câu trả lời trong state; queue chỉ lưu khi bấm gửi cuối bài. Reload/đóng trước đó không có phục hồi bản nháp. Nút Về danh sách cũng không cảnh báo bài chưa gửi. | Đọc `LearningFlow.tsx`; chưa chạy E2E đóng trình duyệt giữa bài trong lượt này. |
| R07 | Khi 409 do đề đổi, thông báo yêu cầu tải lại nhưng màn đang có data không hiện nút tải lại; gửi lại dùng frozen payload cũ. Phải rời màn rồi mở lại, chưa có hướng dẫn/thao tác đầy đủ. | Đọc nhánh render và submit. |
| R08 | Lỗi 400/401/422 hoặc dữ liệu không hợp lệ có thể rơi vào thông báo “chưa kết nối”; nguyên nhân khác nhau bị diễn đạt giống lỗi mạng. | Đọc hàm message và API unwrap. |
| R09 | Queue chỉ hiện số thứ tự, lỗi và mã kỹ thuật; chưa hiện tên bài, thời điểm, xem lại đáp án, xuất bản sao hoặc xử lý từng mục blocked. | Đọc UI/kiểu PendingAttempt. |
| R10 | Phản hồi cuối hiển thị tổng điểm và lời giải mọi câu, chưa đối chiếu lựa chọn của trẻ/câu nào sai/đáp án đúng từng câu. | Đọc UI; API đã có danh sách mistake IDs nhưng màn mới không dùng để trình bày. |
| R11 | Câu sắp thứ tự: UI yêu cầu chọn mọi option; server chỉ so tập option isCorrect. Nếu đề có option nhiễu, hợp đồng có thể khiến không trả lời đúng được trên UI. | Xác nhận hai quy tắc khác nhau trong mã; chưa tái hiện một đề loại này trên browser. Cần chốt schema hoặc cấm cấu hình đó. |
| R12 | Chuyển câu/hiện kết quả chưa chủ động đưa scroll/focus tới câu mới/kết quả. Với nội dung dài, trẻ hoặc người dùng đọc màn hình có thể bỏ lỡ nội dung vừa đổi. | Đọc mã, cần phép thử nội dung dài và screen reader. |
| R13 | Giọng đọc chỉ triển khai web, không có thông báo rõ khi thiết bị không có tiếng nói phù hợp; nút bật/nghe chưa phản ánh capability native. | Đọc voice service và UI. |
| R14 | Trang Học dựng toàn bộ bài trong ScrollView; backend đọc toàn bộ cấu trúc và lịch sử pass cho mỗi map/eligibility. Chưa có phân trang/chỉ mục tiến độ phù hợp quy mô lớn. | Rủi ro mở rộng từ cấu trúc mã, chưa đo để kết luận đang chậm. |
| R15 | Đọc queue chỉ xác nhận là array; chưa kiểm schema từng mục, phiên bản storage, giới hạn kích thước hoặc quy trình sửa khi dữ liệu hỏng/hết dung lượng. | Đọc storage; chưa chạy ma trận quota/corruption. |
| R16 | Khóa ghi queue chỉ trong một runtime; không khóa giữa các tab/thiết bị. Đồng bộ thủ công, chưa có backoff/scheduler tự phục hồi. | Đọc queue và trang Học. |
| R17 | Bài mới/rỗng/loại câu không hỗ trợ không có bộ kiểm định nội dung trước sử dụng. Một số trường có giới hạn, nhưng contentVersion chỉ kiểm không rỗng, orderedOptionIds không có giới hạn số phần tử riêng. | Đọc DTO/schema; không có tải/abuse test trong lượt này. |
| R18 | `TestResult` chưa lưu phiên bản nội dung trực tiếp hoặc snapshot đề/đáp án đầy đủ; requestHash không thay được hồ sơ để xem lại bài lịch sử. | Đọc schema và luồng ghi. |

## 3. Những phần sản phẩm còn thiếu

### Tài khoản và dữ liệu

- Chưa có đăng ký/đăng nhập/đăng xuất, phiên và khôi phục tài khoản cho gia đình.
- CURRENT_USER_ID vẫn cố định. Các tester cùng backend có thể dùng chung hồ sơ thử; không được dùng cách này cho gia đình thật.
- Chưa có quan hệ gia đình–phụ huynh–trẻ và chứng minh truy cập chéo bị từ chối khi mở API.
- Thiếu giới hạn thử đăng nhập, hạn mức API/AI, cơ chế thu hồi phiên và quản trị quyền.
- Thiếu chức năng xuất/xóa dữ liệu người dùng, thời hạn lưu, sổ dữ liệu và thông báo riêng tư hoàn chỉnh.
- Loopback và cờ đóng chỉ là hạn chế bản nội bộ; không thay thế xác thực/phân quyền khi triển khai qua proxy hoặc hosting.

### Nội dung và giá trị học tập

- Chưa có người duyệt; chưa chốt 12 bài phát hành có nguồn, tuổi, điều kiện áp dụng, reviewer và ngày duyệt. Người dùng yêu cầu hướng dẫn phần người duyệt sau.
- Chưa có trạng thái draft/reviewed/published/withdrawn, kho phiên bản bất biến và công cụ quản lý nội dung.
- Bỏ bài khỏi seed mới không tự rút bài trong DB hoặc bản tải cũ; chưa có cơ chế thu hồi toàn hệ thống.
- Câu hình/màu trong fixture chỉ là dữ liệu thử phần mềm, không chứng minh chất lượng giáo trình an toàn.
- Chưa có hoạt động thực hành cùng cha mẹ đã duyệt, kiểm tra trẻ hiểu lại, đánh giá câu gây sợ/khó hiểu hoặc phân hóa cách trình bày theo tuổi.
- Không có bằng chứng XP phản ánh kỹ năng ngoài đời; đây phải tiếp tục là điểm hoạt động học.

### Offline và độ bền

- Chưa tải/cache giáo trình để mở lại không mạng.
- Chưa phục hồi bài đang làm, giải quyết xung đột nhiều thiết bị hoặc nâng dữ liệu từ các storage legacy đầy đủ.
- Chưa sửa/đối soát các thành tích sai từ dữ liệu đã có trước các đợt sửa.
- Cần phân biệt “đã lưu trên máy”, “máy chủ đã nhận”, “đã chấm”, “bị từ chối”; không chỉ giữ JSON trong queue.

### Giao diện và khả năng tiếp cận

- Hiện mới là lát cắt ba màn. Bản đồ trực quan, cẩm nang, trang huy hiệu đầy đủ, góc phụ huynh và cài đặt đầy đủ chưa có trong luồng mới.
- Chưa có tìm bài/lọc chủ đề, lịch sử chi tiết, báo lỗi nội dung từ màn bài học, kênh hỗ trợ dễ tìm.
- Chưa kiểm đầy đủ nội dung dài, câu nhiều lựa chọn, font hệ điều hành lớn, xoay màn, focus/Tab/Enter/Escape, TalkBack/VoiceOver.
- Phóng chữ bằng CSS trong script không phải chứng nhận WCAG; mới kiểm một số trường hợp không tràn ngang.
- Chưa thử với trẻ và phụ huynh; chưa biết có hiểu nhãn/nút, thấy khó hoặc sợ, có nhầm khả năng của ứng dụng không.
- Ảnh cún Milo có sẵn cần xác minh nguồn/quyền; logo mới có nguồn vector nhưng adaptive icon/splash chưa nghiệm thu bản cài native.

### Nền tảng và kiểm thử

- Android/iOS chưa có bản cài được kiểm tra trên thiết bị thật; giọng đọc/storage/quyền/chế độ nền cần thử riêng.
- Expo SDK 52 đang cài khai báo notifications ~0.29.14 và AsyncStorage 1.23.1 trong bundledNativeModules; package dự án đang dùng ^57.0.13 và ^3.1.1. Đây là lệch khai báo tương thích cần giải quyết, chưa có bằng chứng crash native.
- Chưa có cài đặt sạch/CI từ xa được xác nhận; CI hiện không chạy browser E2E.
- 26 test chủ yếu service và storage/network giả lập; test đồng thời hiện trong một tiến trình. Chưa phủ nhiều người dùng, nhiều máy chủ, HTTP auth, quota, browser offline restart.
- Chưa đo thời gian tải thực tế, độ trễ thao tác, bộ nhớ, pin, listener/timer qua nhiều vòng dùng.
- Mã legacy vẫn lớn; phần lõi mới nhiều JSX/hàm dồn trong một file, nhiều `any`; cần tách thành phần, chuẩn hóa lỗi và hợp đồng dữ liệu để dễ bảo trì.

### Vận hành và cộng đồng

- Chưa có bản public/staging được kiểm, môi trường và quy trình phát hành/rollback đầy đủ; checkout hiện chưa có `.git`.
- Chưa xác nhận lịch backup tự động, mã hóa bản backup, diễn tập sự cố khi đang ghi dữ liệu, giám sát/readiness và cảnh báo vận hành.
- Chưa có ngân sách, chủ trì hỗ trợ, hạn phản hồi, kênh báo lỗi/nội dung không phù hợp.
- Chưa pilot với gia đình/giáo viên; chưa có chỉ số hoàn thành bài, tự nguyện quay lại, lý do bỏ cuộc và giới thiệu thật.
- Chưa có bộ giới thiệu trung thực, tài liệu một trang cho phụ huynh/giáo viên, kế hoạch phân phối có đồng ý và năng lực hỗ trợ tương ứng.

### Tính năng đang đóng

Camera AI, chat AI, SOS từ xa, BLE/mesh, E2EE, dashboard thích nghi/BKT, SRS, minigame, streak, nhiều ngôn ngữ và native đầy đủ **chưa được coi là hoàn thành**. Mã còn trong dự án không phải bằng chứng tính năng sẵn sàng. Không cần mở tất cả để có MVP cộng đồng tốt; trước hết phải làm trọn luồng học cùng phụ huynh đã duyệt và bảo vệ dữ liệu.

## 4. Thứ tự ưu tiên

1. Sửa R01/R03/R04/R05/R06–R08; chốt quy tắc R02 và phiên bản thưởng/tiến độ. Bổ sung test tái hiện vào hồi quy, không chỉ sửa giao diện thông báo.
2. Xây tài khoản/ownership và cơ chế nội dung được duyệt; đây là hai điều kiện riêng, không lấy việc chưa có reviewer làm lý do bỏ qua kỹ thuật.
3. Hoàn thiện draft/offline/queue và phản hồi từng câu; rồi kiểm nội dung thật đã duyệt trên luồng UI.
4. Nghiệm thu thiết bị/accessibility, CI/E2E, vận hành; sau đó pilot nhỏ có hỗ trợ.

Không chấm “90% hoàn thiện” hoặc hứa mốc ra mắt khi chưa có phạm vi, nguồn lực, reviewer và kết quả các gate. Danh sách này là toàn bộ thiếu sót đã xác định trong phạm vi rà hiện tại, không phải cam kết không còn lỗi chưa được phát hiện.
