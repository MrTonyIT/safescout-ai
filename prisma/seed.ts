import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../src/common/enums/safety.enum';

const prisma = new PrismaClient();

// Danh sách trọn vẹn 10 Vùng Đất × 10 Chặng = 100 Màn Chơi Sinh Tồn Thực Chiến
const ZONES_100_STAGES_SPEC = [
  // ==========================================
  // VÙNG 1: RỪNG XANH HOANG DÃ
  // ==========================================
  {
    zoneNumber: 1,
    title: 'Vùng 1: Rừng Xanh Hoang Dã',
    description: 'Kỹ năng sinh tồn rừng rậm: Cắm trại an toàn, Hug-a-tree, còi SOS, nấm độc, ong dữ & Boss Test 48h.',
    iconName: 'trees',
    themeColor: '#2A9D8F',
    badgeName: 'Huy Hiệu Vệ Sĩ Rừng Xanh',
    badgeCode: 'BADGE_ZONE_1',
    stages: [
      { num: 1, title: 'Ranh Giới An Toàn Khi Cắm Trại', desc: 'Luôn ở trong tầm mắt người lớn khi cắm trại.', q: 'Khi cắm trại cùng gia đình, quy tắc khoảng cách an toàn là gì?', a: 'Luôn ở trong tầm mắt của người lớn, không tự ý đi sâu vào rừng', b: 'Tự ý đi khám phá một mình', c: 'Chạy đuổi bắt bướm vào bụi rậm' },
      { num: 2, title: 'Quy Tắc Cây Ôm "Hug-a-Tree"', desc: 'Đứng yên ôm chặt thân cây to khi nhận ra mình đã bị lạc.', q: 'Khi bị lạc trong rừng rậm, hành động ĐẦU TIÊN đúng nhất là gì?', a: 'Đứng yên tại chỗ và ôm một cái cây to gần nhất (Hug-a-Tree)', b: 'Cắm đầu chạy thật nhanh tìm đường về', c: 'Trèo lên ngọn cây thật cao' },
      { num: 3, title: 'Thổi Còi Cứu Nạn 3 Tiếng SOS', desc: 'Thổi 3 tiếng ngắt quãng dứt khoát định kỳ phát tín hiệu.', q: 'Nhịp điệu thổi còi cứu hộ SOS chuẩn quốc tế trong rừng là gì?', a: 'Thổi 3 tiếng còi thật to, dứt khoát rồi ngắt quãng (To - To - To)', b: 'Thổi 1 tiếng nhẹ rồi cất còi đi', c: 'Thổi liên tục không ngừng' },
      { num: 4, title: 'Phân Biệt Nấm Ăn & Nấm Độc', desc: 'Nhận diện nấm màu sắc sặc sỡ và quy tắc tuyệt đối không nếm.', q: 'Gặp cây nấm có màu đỏ chấm trắng rất đẹp trong rừng, bé phải làm gì?', a: 'Tuyệt đối KHÔNG chạm hay ăn, đây là nấm độc nguy hiểm', b: 'Hái về nấu canh ăn', c: 'Rửa nước suối rồi nếm thử' },
      { num: 5, title: 'Quả Mọng Rừng & Hứng Nước Sương', desc: 'Tránh xa quả dại độc hại và cách hứng nước sương sạch.', q: 'Nguồn nước uống khẩn cấp an toàn nhất trong rừng là gì?', a: 'Hứng giọt sương đọng trên lá cây to sạch buổi sáng', b: 'Uống nước vũng bùn tù đọng', c: 'Uống nước suối có xác lá mục' },
      { num: 6, title: 'Tư Thế "Đứng Như Tượng" Trước Ong Vò Vẽ', desc: 'Bình tĩnh đứng im không vung tay đánh đuổi ong dữ.', q: 'Khi một đàn ong vò vẽ bay xung quanh bé, phản xạ đúng nhất là gì?', a: 'Đứng yên bất động như tượng đá, lấy hai tay che mặt và cổ', b: 'Vung tay đập loạn xạ vào bầy ong', c: 'Cởi áo quạt mạnh đuổi ong' },
      { num: 7, title: 'Tư Thế "Cuộn Tròn Như Tảng Đá"', desc: 'Nằm sấp cuộn tròn lấy hai tay che kín gáy và mặt.', q: 'Gặp thú rừng hoang dã tiến lại gần, tư thế phòng thủ tự vệ là gì?', a: 'Nằm sấp cuộn tròn bảo vệ mặt và cổ, giữ yên lặng', b: 'Ném đá vào mắt con thú', c: 'Hét to và chạy thục mạng' },
      { num: 8, title: 'Xử Lý Khi Trượt Chân Rơi Xuống Hố', desc: 'Bình tĩnh kiểm tra cơ thể và phát âm thanh cầu cứu.', q: 'Bị trượt chân rơi xuống hố sâu trong rừng, bé nên làm gì?', a: 'Bình tĩnh ngồi dậy, kiểm tra tay chân và thổi còi gọi cứu hộ', b: 'Hoảng sợ khóc lóc giãy giụa', c: 'Cố sức nhảy liên tục làm kiệt sức' },
      { num: 9, title: 'Dựng Dấu Hiệu SOS Bằng Cành Cây & Đá', desc: 'Xếp chữ SOS kích thước lớn trên khoảng đất trống.', q: 'Cách xếp cành cây tạo dấu hiệu SOS cho máy bay trực thăng tìm kiếm:', a: 'Xếp 3 chữ S-O-S kích thước thật to trên bãi đất trống phẳng', b: 'Xếp một đống lá nhỏ dưới gốc cây rậm', c: 'Vứt cành cây rải rác' },
      { num: 10, title: '👑 BOSS TEST: Sinh Tồn 48 Giờ Lạc Rừng', desc: 'Đại thử thách phản xạ 7 giây tổng hợp cứu hộ rừng rậm.', q: '⚡ BOSS TEST: Trời sập tối trong rừng rậm hoang dã, quyết định sinh tồn cứu mạng là gì?', a: 'Ngồi sát gốc cây to đã chọn, trùm áo giữ ấm cơ thể và thổi còi định kỳ', b: 'Tiếp tục đi lang thang trong đêm tối', c: 'Trèo lên đỉnh núi cao trong bóng đêm' },
    ],
  },

  // ==========================================
  // VÙNG 2: THÀNH PHỐ NHỘN NHỊP & BẢO VỆ THÂN THỂ
  // ==========================================
  {
    zoneNumber: 2,
    title: 'Vùng 2: Thành Phố Nhộn Nhịp & Bảo Vệ Thân Thể',
    description: 'Phòng chống bắt cóc & xâm hại: No-Go-Yell-Tell, Mật mã Safe Word & Quy tắc PANTS.',
    iconName: 'building-2',
    themeColor: '#E76F51',
    badgeName: 'Huy Hiệu Vệ Binh Đô Thị',
    badgeCode: 'BADGE_ZONE_2',
    stages: [
      { num: 1, title: 'Quy Tắc "No - Go - Yell - Tell"', desc: 'Từ chối dứt khoát và chạy ngay về phía người thân.', q: 'Người lạ kéo tay rủ đi chơi công viên, bé phản xạ thế nào?', a: 'Hét "KHÔNG!", giật tay ra và chạy ngay về phía người thân', b: 'Im lặng đi theo xem có vui không', c: 'Đứng lại nghe người lạ giải thích' },
      { num: 2, title: 'Mật Mã An Toàn Gia Đình (Safe Word)', desc: 'Chỉ đi theo người lạ nếu người đó đọc đúng mật mã bí mật.', q: 'Người lạ nói "Bố mẹ nhờ cô đón con về", bé kiểm tra thế nào?', a: 'Yêu cầu đọc đúng "Mật mã an toàn" của gia đình mới tin', b: 'Lên xe đi theo ngay lập tức', c: 'Hỏi người đó xem có kẹo không' },
      { num: 3, title: 'Nhận Diện "Người Lạ An Toàn"', desc: 'Tìm sự trợ giúp từ chú công an, nhân viên thu ngân, mẹ dắt con.', q: 'Bị lạc ở nơi đông người, bé nên cầu cứu ai an toàn nhất?', a: 'Chú công an, bảo vệ mặc đồng phục hoặc cô thu ngân siêu thị', b: 'Một người lạ mặt đeo khẩu trang rủ đi chỗ vắng', c: 'Một người đứng lén lút ở góc tối' },
      { num: 4, title: 'Hét Lớn: "Cháu Không Quen Người Này!"', desc: 'Hô to cầu cứu thu hút sự chú ý của mọi người xung quanh.', q: 'Bị người lạ cố tình bế hoặc lôi kéo, bé hô câu nào để mọi người giúp?', a: 'Hét to: "CỨU VỚI! CHÁU KHÔNG QUEN NGƯỜI NÀY!"', b: 'Khóc lí nhí trong miệng', c: 'Nói "Cô chú buông cháu ra đi ạ"' },
      { num: 5, title: 'Quy Tắc Đồ Lót PANTS Bất Khả Xâm Phạm', desc: 'Vùng đồ lót là riêng tư, không ai được phép chạm vào.', q: 'Theo quy tắc PANTS, vùng nào trên cơ thể tuyệt đối cấm người khác chạm vào?', a: 'Vùng đồ lót riêng tư (ngực, mông và giữa hai đùi)', b: 'Bàn tay khi bắt tay', c: 'Bả vai khi xếp hàng' },
      { num: 6, title: 'Ứng Phó Với "Trò Chơi Bí Mật"', desc: 'Không giữ bí mật nguy hiểm dù bị đe dọa hay dụ dỗ.', q: 'Có người yêu cầu giữ bí mật về việc chạm vào vùng riêng tư, bé phải làm gì?', a: 'Kể ngay lập tức với bố mẹ hoặc thầy cô giáo tin cậy', b: 'Giữ bí mật vì sợ bị phạt', c: 'Không nói gì và tự buồn một mình' },
      { num: 7, title: 'Từ Chối Kẹo, Đồ Chơi, Thú Cưng Người Lạ', desc: 'Cảnh giác với những món quà lạ không rõ nguồn gốc.', q: 'Người lạ ở cổng trường đưa túi kẹo ngon rủ lên xe xem cún con:', a: 'Nói "KHÔNG, cháu không lấy đâu!" và lùi lại phía bảo vệ trường', b: 'Nhận kẹo ăn rồi lên xe xem cún', c: 'Đứng lại vuốt ve cún con một mình' },
      { num: 8, title: 'Xử Lý Khi Có Xe Ô Tô Bám Theo Sau', desc: 'Đi ngược chiều xe và chạy ngay vào cửa hàng đông người.', q: 'Đi bộ trên đường thấy ô tô lạ chạy chầm chậm bám theo, bé làm gì?', a: 'Quay đầu đi ngược chiều ô tô và chạy nhanh vào cửa hàng sáng đèn', b: 'Đứng lại nhìn vào kính xe', c: 'Tiếp tục đi vào con hẻm vắng tối' },
      { num: 9, title: 'Tìm Điểm Trợ Giúp Khẩn Cấp Tại TTTM', desc: 'Đến quầy thông tin Information Desk phát loa tìm bố mẹ.', q: 'Bị lạc mẹ trong Trung tâm thương mại lớn, điểm đến đúng nhất là gì?', a: 'Quầy Thông Tin (Information) nhờ nhân viên phát loa tìm mẹ', b: 'Chạy ra ngoài bãi đỗ xe tối tìm', c: 'Đi vào nhà vệ sinh trốn' },
      { num: 10, title: '👑 BOSS TEST: Vệ Binh Thân Thể Toàn Năng', desc: 'Đại thử thách phản xạ 7 giây bảo vệ an toàn thân thể.', q: '⚡ BOSS TEST: Ai đó cố gắng chụp ảnh vùng nhạy cảm của bé, phản xạ 7s:', a: 'Hét to phản đối, chạy ngay về phía người lớn và báo cảnh sát', b: 'Để cho chụp vì sợ người đó giận', c: 'Nhận tiền thưởng để giữ im lặng' },
    ],
  },

  // ==========================================
  // VÙNG 3: PHÁO ĐÀI TẠI GIA
  // ==========================================
  {
    zoneNumber: 3,
    title: 'Vùng 3: Pháo Đài Tại Gia',
    description: 'An toàn phòng cháy & điện: Bò thấp dưới khói, mu bàn tay thử cửa & Stop-Drop-Roll.',
    iconName: 'home',
    themeColor: '#F4A261',
    badgeName: 'Huy Hiệu Vệ Sĩ Gia Đình',
    badgeCode: 'BADGE_ZONE_3',
    stages: [
      { num: 1, title: 'Tay Ướt & An Toàn Phích Cắm Điện', desc: 'Tuyệt đối không chạm vào ổ điện khi tay dính nước.', q: 'Vừa rửa tay ướt xong, có được cắm sạc điện thoại không?', a: 'Tuyệt đối KHÔNG, phải lau khô tay hoàn toàn trước khi chạm ổ điện', b: 'Cắm bình thường không sao cả', c: 'Vừa cắm vừa vẩy nước' },
      { num: 2, title: 'Nhận Biết Ký Hiệu Hóa Chất Độc Hại', desc: 'Nhận diện biểu tượng đầu lâu xương chéo trên chai lọ tẩy rửa.', q: 'Chai nước tẩy bồn cầu có hình đầu lâu xương chéo, bé phải làm gì?', a: 'Tránh xa, tuyệt đối không mở nắp hay uống thử', b: 'Mở ra ngửi xem có mùi thơm không', c: 'Đổ ra sàn nhà chơi đùa' },
      { num: 3, title: 'Bò Thấp Dưới Tầng Khói Độc', desc: 'Khói độc luôn bay lên cao, hãy bò sát mặt sàn bịt khăn ẩm.', q: 'Chuông báo cháy reo vang, khói đen mù mịt bốc lên cao, bé thoát hiểm thế nào?', a: 'Dùng khăn ẩm bịt mũi miệng, bò thật thấp sát mặt sàn ra cửa', b: 'Đứng thẳng người chạy thật nhanh', c: 'Nấp vào tủ quần áo đóng kín cửa' },
      { num: 4, title: 'Mu Bàn Tay Kiểm Tra Nhiệt Độ Cửa', desc: 'Dùng mu bàn tay chạm nhẹ thử tay nắm cửa trước khi mở.', q: 'Trước khi mở cửa phòng thoát hiểm khi có cháy, kiểm tra thế nào?', a: 'Dùng MU BÀN TAY chạm nhẹ tay nắm cửa xem có nóng bỏng không', b: 'Dùng lòng bàn tay nắm chặt vặn cửa ngay', c: 'Dùng chân đạp tung cánh cửa' },
      { num: 5, title: 'Dừng - Nằm - Lăn (Stop, Drop & Roll)', desc: 'Dập tắt ngọn lửa bám trên quần áo bằng cách nằm lăn tròn.', q: 'Không may ngọn lửa bén vào gấu áo của bé, phản xạ cứu mạng là gì?', a: 'DỪNG LẠI ➔ NẰM XUỐNG ➔ LĂN TRÒN người trên sàn nhà (Stop, Drop & Roll)', b: 'Chạy vòng quanh nhà cầu cứu', c: 'Lấy tay quạt mạnh vào ngọn lửa' },
      { num: 6, title: 'Tránh Xa Lan Can & Cửa Sổ Cao Tầng', desc: 'Không trèo leo nghịch ngợm ở ban công và lan can.', q: 'Đồ chơi rơi ra mép ngoài ban công chung cư cao tầng, bé làm gì?', a: 'Nhờ người lớn lấy giúp, tuyệt đối không trèo leo ra lan can', b: 'Tự trèo qua lan can nhoài người lấy', c: 'Bắc ghế trèo lên cửa sổ' },
      { num: 7, title: 'Xử Lý An Toàn Khi Thủy Tinh Vỡ', desc: 'Đứng yên, mang dép và gọi người lớn đến dọn dẹp.', q: 'Lỡ tay làm vỡ cốc thủy tinh trên sàn nhà, bé xử lý thế nào?', a: 'Đứng yên, mang dép vào và gọi ba mẹ đến dùng chổi dọn sạch', b: 'Dùng tay không nhặt từng mảnh kính vỡ', c: 'Đi chân trần giẫm lên mảnh vỡ' },
      { num: 8, title: 'Tránh Xa Bếp Ga, Bật Lửa & Dao Sắc', desc: 'Không tự ý bật bếp ga hay nghịch vật dụng bén lửa.', q: 'Thấy bật lửa để trên bàn ăn, hành động đúng của bé là gì?', a: 'Không nghịch bật lửa và nhắc người lớn cất lên chỗ cao', b: 'Bật thử xem ngọn lửa có đẹp không', c: 'Đốt thử giấy vụn trong phòng' },
      { num: 9, title: 'Ở Nhà Một Mình: Tiếng Gõ Cửa Lạ', desc: 'Khóa chặt cửa, không mở cho người lạ và gọi ngay cho ba mẹ.', q: 'Ở nhà một mình nghe tiếng đập cửa nói "Bác thợ sửa điện đây":', a: 'Khóa chặt cửa, nói người lớn đang bận và gọi điện cho bố mẹ ngay', b: 'Mở cửa mời bác vào nhà', c: 'Nói to: "Cháu ở nhà một mình thôi ạ"' },
      { num: 10, title: '👑 BOSS TEST: Thoát Hiểm Pháo Đài Hỏa Hoạn', desc: 'Đại thử thách phản xạ 7 giây xử lý sự cố tại nhà.', q: '⚡ BOSS TEST: Khói tràn vào phòng ngủ tầng 3, lối cầu thang bị lửa chặn:', a: 'Đóng kín cửa ngăn khói, chèn khăn ướt khe cửa, ra ban công vẫy áo cầu cứu', b: 'Nhảy thẳng từ cửa sổ tầng 3 xuống đất', c: 'Chạy lao thẳng vào ngọn lửa ở cầu thang' },
    ],
  },

  // ==========================================
  // VÙNG 4: TRẠM Y TẾ THẦN TỐC
  // ==========================================
  {
    zoneNumber: 4,
    title: 'Vùng 4: Trạm Y Tế Thần Tốc',
    description: 'Sơ cấp cứu cơ bản: Xả nước mát trị bỏng, Heimlich hóc dị vật & chảy máu cam.',
    iconName: 'heart-pulse',
    themeColor: '#E63946',
    badgeName: 'Huy Hiệu Trưởng Trạm Y Tế',
    badgeCode: 'BADGE_ZONE_4',
    stages: [
      { num: 1, title: 'Xả Nước Mát 15-20 Phút Khi Bị Bỏng', desc: 'Xả dưới vòi nước mát chảy nhẹ, không bôi kem đánh răng.', q: 'Bị nước sôi bắn vào tay gây bỏng rát, bước đầu tiên cần làm là gì?', a: 'Xả ngay vùng bỏng dưới vòi nước mát sạch 15-20 phút', b: 'Bôi kem đánh răng hoặc mỡ trăn lên vết bỏng', c: 'Đắp đá lạnh buốt trực tiếp lên da' },
      { num: 2, title: 'Nhận Diện Dấu Hiệu Ôm Cổ Nghẹt Thở', desc: 'Hai tay ôm chặt cổ họng không nói được là dấu hiệu hóc dị vật.', q: 'Bạn ăn thạch bị hóc dị vật, dấu hiệu nhận biết nguy cấp là gì?', a: 'Hai tay ôm chặt cổ họng, mặt tím tái, không nói hay ho được', b: 'Bạn cười đùa bình thường', c: 'Bạn uống nước ngon lành' },
      { num: 3, title: 'Kỹ Thuật Vỗ Lưng & Nghiệm Pháp Heimlich', desc: 'Vỗ lưng dứt khoát giữa hai bả vai để tống dị vật ra ngoài.', q: 'Khi bạn bị nghẹt thở do hóc kẹo, động tác hỗ trợ đầu tiên là gì?', a: 'Nghiêng người bạn về phía trước, vỗ mạnh 5 lần giữa 2 bả vai', b: 'Bắt bạn uống một cốc nước to', c: 'Thọc ngón tay sâu vào họng bạn' },
      { num: 4, title: 'Tư Thế Cúi Nhẹ Đầu & Ép Cánh Mũi 10 Phút', desc: 'Không ngửa đầu ra sau, ngồi thẳng hơi cúi về phía trước.', q: 'Bị chảy máu cam ở mũi, tư thế ngồi cầm máu chuẩn y khoa là gì?', a: 'Ngồi thẳng hơi cúi đầu về trước, dùng ngón tay ép chặt 2 cánh mũi 10 phút', b: 'Ngửa cổ thật cao ra đằng sau', c: 'Nằm ngửa thẳng cẳng trên giường' },
      { num: 5, title: 'Ép Gạc Vô Khuẩn & Nâng Cao Chi Cầm Máu', desc: 'Dùng gạc sạch ép trực tiếp lên miệng vết thương hở.', q: 'Bị đứt tay chảy máu nhiều, cách cầm máu tức thì là gì?', a: 'Đặt miếng gạc sạch ép chặt lên vết thương và giơ tay cao hơn tim', b: 'Rắc bột ngọt vào miệng vết thương', c: 'Để máu chảy tự do cho sạch' },
      { num: 6, title: 'Nhận Diện Say Nắng & Bù Nước Oresol', desc: 'Nghỉ ngơi nơi râm mát, nới lỏng áo và uống từng ngụm nước nhỏ.', q: 'Chơi bóng ngoài trời nắng gắt bị hoa mắt chóng mặt sốt cao:', a: 'Vào ngay bóng râm mát, nới lỏng quần áo và uống nước oresol mát', b: 'Uống ngay một cốc nước đá lạnh buốt', c: 'Tiếp tục chạy nhảy ngoài nắng' },
      { num: 7, title: 'Cố Định Tạm Thời Nghi Ngờ Gãy Xương', desc: 'Không cử động mạnh, dùng thanh nẹp cố định vị trí gãy.', q: 'Ngã chống tay nghi bị gãy xương cẳng tay, hành động đúng là gì?', a: 'Giữ yên tay, dùng nẹp cố định và đưa đến bệnh viện ngay', b: 'Cố gắng bẻ nắn thẳng lại xương', c: 'Xoa bóp dầu nóng thật mạnh' },
      { num: 8, title: 'Xử Lý Vết Trầy Xước Bằng Nước Muối', desc: 'Rửa sạch bụi bẩn bằng nước muối sinh lý NaCl 0.9%.', q: 'Bị trầy xước đầu gối bám đầy cát bẩn, rửa sạch bằng gì an toàn?', a: 'Rửa nhẹ nhàng bằng nước muối sinh lý NaCl 0.9% hoặc nước sạch', b: 'Đắp lá cây dại ven đường lên vết thương', c: 'Đổ cồn 90 độ đậm đặc lên vết xước' },
      { num: 9, title: 'Cách Sắp Xếp Túi Sơ Cứu Mini Gia Đình', desc: 'Chuẩn bị đầy đủ băng gạc, bông, cồn sát khuẩn và kéo y tế.', q: 'Vật dụng nào BẮT BUỘC phải có trong hộp cứu thương gia đình?', a: 'Băng dán cá nhân gạc vô khuẩn, nước muối sinh lý và kéo y tế', b: 'Bánh kẹo ngọt', c: 'Đồ chơi điện tử' },
      { num: 10, title: '👑 BOSS TEST: Trưởng Trạm Y Tế Nhí', desc: 'Đại thử thách phản xạ 7 giây sơ cấp cứu thực chiến.', q: '⚡ BOSS TEST: Em nhỏ bị hóc đồng xu tím tái bất tỉnh, chuỗi sơ cứu vàng:', a: 'Gọi ngay cấp cứu 115, thực hiện vỗ lưng ấn ngực tống dị vật khẩn cấp', b: 'Chờ đợi xem em có tự khỏi không', c: 'Cho em ăn thêm một thìa cơm đầy' },
    ],
  },

  // ==========================================
  // VÙNG 5: THUNG LŨNG THIÊN TAI
  // ==========================================
  {
    zoneNumber: 5,
    title: 'Vùng 5: Thung Lũng Thiên Tai',
    description: 'Động đất, giông sét & lũ quét: Nội dung nháp chờ người chuyên môn duyệt.',
    iconName: 'cloud-lightning',
    themeColor: '#7209B7',
    badgeName: 'Huy Hiệu Vệ Sĩ Bão Tố',
    badgeCode: 'BADGE_ZONE_5',
    stages: [
      { num: 1, title: 'Động Đất: "Drop, Cover, and Hold On"', desc: 'Hạ thấp - Chui gầm bàn kiên cố - Giữ chặt chân bàn.', q: 'Mặt đất rung chuyển dữ dội do động đất, quy tắc vàng là gì?', a: 'Hạ thấp người ➔ Chui gầm bàn kiên cố ➔ Giữ chặt chân bàn (Drop, Cover, Hold)', b: 'Chạy nhanh vào thang máy bấm nút xuống', c: 'Đứng giữa phòng nhìn trần nhà' },
      { num: 2, title: 'Tránh Xa Cửa Kính & Tủ Kệ Cao Tầng', desc: 'Tránh nơi có kính vỡ hoặc đồ đạc nặng có thể đổ sập.', q: 'Khi động đất xảy ra, vị trí nào trong nhà NGUY HIỂM NHẤT?', a: 'Cạnh cửa sổ kính lớn, gương soi và tủ sách cao tầng', b: 'Dưới gầm bàn gỗ kiên cố', c: 'Góc tường chịu lực vững chắc' },
      { num: 4, title: 'Tránh Xa Cây Đơn Độc & Cột Sắt Ngoài Đồng', desc: 'Không đứng dưới gốc cây to hoặc cột kim loại khi trời mưa sấm.', q: 'Gặp cơn giông sấm sét ngoài đồng trống, nơi nào DỄ BỊ SÉT ĐÁNH NHẤT?', a: 'Gốc cây to đứng đơn độc giữa đồng và cột điện kim loại', b: 'Rãnh mương sâu khô ráo', c: 'Vùng đất trũng an toàn' },
      { num: 5, title: 'Nhận Diện Dấu Hiệu Lũ Quét Đầu Nguồn', desc: 'Nước suối chuyển đục ngầu kèm tiếng gầm rống từ núi cao.', q: 'Chơi gần suối thấy nước đột ngột đục ngầu và có tiếng gầm lớn:', a: 'LŨ QUÉT ĐANG ĐẾN! Chạy ngay lên sườn đồi cao nhất có thể', b: 'Lội xuống suối vớt củi trôi', c: 'Đứng xem dòng nước cuộn trào' },
      { num: 6, title: 'Di Chuyển Lên Vùng Đất Cao An Toàn', desc: 'Nhanh chóng chạy lên đồi cao, tuyệt đối không lội qua dòng nước.', q: 'Nước lũ dâng cao ngập đường sá, điều cấm kỵ tuyệt đối là gì?', a: 'Tuyệt đối KHÔNG lội qua dòng nước lũ chảy xiết', b: 'Leo lên mái nhà kiên cố chờ thuyền cứu hộ', c: 'Mặc áo phao bảo vệ' },
      { num: 7, title: 'Phòng Tránh Sạt Lở Đất Đá Sườn Đồi', desc: 'Tránh xa các sườn dốc nứt nẻ sau những ngày mưa lớn liên tục.', q: 'Sau mưa bão lớn, thấy sườn đồi xuất hiện vết nứt to và cây nghiêng:', a: 'Báo ngay cho người lớn và sơ tán khẩn cấp khỏi chân đồi', b: 'Đến gần vết nứt chụp ảnh', c: 'Dựng lều ngủ dưới chân đồi' },
      { num: 8, title: 'Chuẩn Bị Balo Sinh Tồn Khẩn Cấp 72h', desc: 'Nước uống, đồ hộp khô, đèn pin, pin dự phòng và còi cứu nạn.', q: 'Balo sinh tồn khẩn cấp thiên tai 72h cần chứa món đồ nào?', a: 'Nước lọc đóng chai, đồ hộp khô, đèn pin, còi cứu nạn và túi sơ cứu', b: 'Tivi và máy tính bàn cồng kềnh', c: 'Gấu bông to' },
      { num: 9, title: 'Lắng Nghe Hướng Dẫn Sơ Tán Người Lớn', desc: 'Bình tĩnh tuân theo hiệu lệnh sơ tán của lực lượng cứu hộ.', q: 'Loa phường phát lệnh sơ tán khẩn cấp tránh bão lũ:', a: 'Nhanh chóng cùng gia đình mang balo sinh tồn đến điểm tập kết an toàn', b: 'Ở lại nhà để chơi điện tử', c: 'Chạy ra bãi biển xem bão' },
      { num: 10, title: '👑 BOSS TEST: Vượt Qua Cuồng Nộ Thiên Nhiên', desc: 'Đại thử thách phản xạ 7 giây chống chọi thiên tai bão lũ.', q: '⚡ BOSS TEST: Động đất rung chuyển làm sập một phần ngôi nhà, bạn bị kẹt:', a: 'Gõ kim loại vào đường ống nước theo nhịp 3 tiếng để cứu hộ phát hiện', b: 'Hét to liên tục làm kiệt sức và hít nhiều bụi', c: 'Châm lửa đốt đồ đạc để sưởi ấm' },
    ],
  },

  // ==========================================
  // VÙNG 6: VÙNG NƯỚC SÂU
  // ==========================================
  {
    zoneNumber: 6,
    title: 'Vùng 6: Vùng Nước Sâu',
    description: 'Phòng chống đuối nước: Nổi sao biển, Reach or Throw Don\'t Go & Thoát dòng Rip Current.',
    iconName: 'waves',
    themeColor: '#0077B6',
    badgeName: 'Huy Hiệu Vệ Sĩ Đại Dương',
    badgeCode: 'BADGE_ZONE_6',
    stages: [
      { num: 1, title: 'Mặc Áo Phao Đúng Quy Cách Cài Khóa', desc: 'Kiểm tra khóa cài chắc chắn và ôm sát ngực trước khi xuống nước.', q: 'Trước khi bước lên thuyền cano du lịch, bé bắt buộc phải làm gì?', a: 'Mặc áo phao đúng kích cỡ và cài đủ các chốt khóa chắc chắn', b: 'Cầm áo phao trên tay làm gối ngồi', c: 'Không cần mặc vì biết bơi một chút' },
      { num: 2, title: 'Thả Nổi Ngửa Hình Sao Biển (Starfish Float)', desc: 'Thả lỏng toàn thân, ngửa mặt nhìn lên trời hít thở sâu.', q: 'Bị rơi xuống nước sâu và bắt đầu kiệt sức, kỹ thuật cứu mạng là gì?', a: 'Thả lỏng toàn thân, ngửa đầu nhìn trời, nổi hình sao biển (Starfish Float)', b: 'Quẫy đạp tay chân loạn xạ trong nước', c: 'Cố gắng há miệng to thở gấp dưới nước' },
      { num: 3, title: 'Nguyên Tắc: "Reach or Throw, Don\'t Go"', desc: 'Tuyệt đối không nhảy xuống nước, chìa sào hoặc ném phao cứu bạn.', q: 'Thấy bạn bè trượt chân ngã xuống hồ nước sâu kêu cứu, bé làm gì?', a: 'Hét to gọi người lớn, tìm sào tre hoặc ném phao cứu sinh (KHÔNG nhảy xuống)', b: 'Lập tức nhảy ùm xuống nước kéo bạn', c: 'Nhảy xuống ôm chặt cổ bạn' },
      { num: 4, title: 'Dùng Sào Tre, Phao Hoặc Dây Thừng Cứu Nạn', desc: 'Hạ thấp trọng tâm nằm sáp bờ và kéo bạn từ từ vào bờ.', q: 'Đưa cành cây cứu bạn đuối nước, tư thế đứng an toàn của bé là gì?', a: 'Nằm sấp sát mép bờ giữ trọng tâm thấp để không bị kéo ngã xuống', b: 'Đứng kiễng chân trên mép bờ trơn trượt', c: 'Nhảy nhót trên cầu khỉ' },
      { num: 5, title: 'Nhận Diện Dòng Chảy Xa Bờ (Rip Current)', desc: 'Vùng nước phẳng lặng không có sóng vỗ là dòng chảy xiết ra xa.', q: 'Bãi biển có một khoảng nước lặng ngắt không có sóng, màu nước sẫm đục:', a: 'ĐÂY LÀ DÒNG CHẢY XA BỜ (Rip Current) nguy hiểm, tuyệt đối không tắm', b: 'Là chỗ tắm an toàn nhất vì không có sóng', c: 'Chỗ nước cạn thích hợp nhảy lặn' },
      { num: 6, title: 'Kỹ Thuật Bơi Song Song Bờ Biển Thoát Rip', desc: 'Không bơi ngược dòng, bơi ngang song song bờ biển ra khỏi dòng xoáy.', q: 'Không may bị cuốn vào dòng chảy xa bờ cuốn trôi ra biển:', a: 'Bình tĩnh thả nổi, bơi NGANG SONG SONG VỚI BỜ BIỂN thoát dòng xoáy', b: 'Dốc hết sức bơi thẳng ngược chiều dòng nước', c: 'Lặn sâu xuống đáy biển' },
      { num: 7, title: 'Tránh Xa Cống Xả & Xoáy Nước Hồ Bơi', desc: 'Lực hút cống xả đáy hồ bơi cực kỳ mạnh mẽ nguy hiểm.', q: 'Tại sao không được bơi lại gần nắp cống hút nước đáy bể bơi?', a: 'Vì lực hút nước rất mạnh có thể hút chặt tóc và cơ thể bé', b: 'Vì nước ở đó quá lạnh', c: 'Vì đáy bể có cá dữ' },
      { num: 8, title: 'Ứng Phó Khi Bị Chuột Rút Dưới Nước', desc: 'Bình tĩnh thả nổi ngửa, dùng tay kéo căng ngón chân duỗi cơ.', q: 'Đang bơi bị co rút cơ bắp chân đau đớn (chuột rút), bé làm gì?', a: 'Bình tĩnh thả nổi ngửa, dùng tay kéo ngón chân ngược về phía gối', b: 'Hoảng sợ giãy giụa chìm xuống đáy', c: 'Gập chặt chân lại' },
      { num: 9, title: 'Nhận Diện Dấu Hiệu Đuối Nước Thầm Lặng', desc: 'Người đuối nước không vẫy tay kêu cứu mà chìm nổi bất lực.', q: 'Dấu hiệu đuối nước thực tế ở trẻ em trông như thế nào?', a: 'Đầu ngửa ra sau, mắt lờ đờ, miệng chìm nổi sát mặt nước trong im lặng', b: 'Hét to kêu cứu và vẫy hai tay trên cao', c: 'Bơi lội tung tăng té nước' },
      { num: 10, title: '👑 BOSS TEST: Hiệp Sĩ Cứu Hộ Đại Dương', desc: 'Đại thử thách phản xạ 7 giây an toàn sông nước.', q: '⚡ BOSS TEST: Thuyền lật giữa dòng sông chảy xiết, phản xạ 7s cứu mạng:', a: 'Giữ chặt áo phao, thả nổi trôi xuôi theo dòng nước và bơi dạt vào bờ', b: 'Cố bơi ngược dòng nước chảy xiết', c: 'Cởi bỏ áo phao vứt đi' },
    ],
  },

  // ==========================================
  // VÙNG 7: CHUYẾN XE & TRƯỜNG HỌC
  // ==========================================
  {
    zoneNumber: 7,
    title: 'Vùng 7: Chuyến Xe & Trường Học',
    description: 'An toàn giao thông: Bị bỏ quên trên xe bus (bấm còi vô lăng) & Điểm mù xe tải lớn.',
    iconName: 'bus',
    themeColor: '#F77F00',
    badgeName: 'Huy Hiệu Hiệp Sĩ Trường Học',
    badgeCode: 'BADGE_ZONE_7',
    stages: [
      { num: 1, title: 'Bị Bỏ Quên Xe Bus: Bấm Còi Vô Lăng Liên Tục', desc: 'Leo lên ghế lái bấm còi to gây chú ý với người đi đường.', q: 'Tỉnh dậy thấy bị nhốt một mình trên xe đưa đón học sinh đóng kín cửa:', a: 'Leo ngay lên ghế lái bấm CÒI VÔ LĂNG liên tục để phát âm thanh cầu cứu', b: 'Nằm khóc ở hàng ghế cuối cùng', c: 'Đóng kín rèm cửa đi ngủ tiếp' },
      { num: 2, title: 'Bật Đèn Tam Giác Khẩn Cấp (Hazard Light)', desc: 'Nhấn nút tam giác đỏ trên bảng táp-lô ô tô báo hiệu khẩn cấp.', q: 'Nút hình tam giác màu đỏ trên táp-lô xe ô tô có tác dụng gì?', a: 'Bật đèn nhấp nháy khẩn cấp báo cho người ngoài biết có người gặp nạn', b: 'Bật máy nghe nhạc thiếu nhi', c: 'Tắt còi báo động' },
      { num: 3, title: 'Đập Kính & Giơ Bảng Hiệu Cầu Cứu', desc: 'Đứng sát kính lái vẫy áo màu sặc sỡ để người ngoài nhận ra.', q: 'Bị kẹt trong xe ô tô dưới trời nắng nóng, cách gây chú ý người đi đường:', a: 'Đứng ở kính trước vẫy áo màu sặc sỡ và gõ liên tục vào mặt kính', b: 'Trốn dưới gầm ghế xe', c: 'Ngồi im lặng trong bóng tối' },
      { num: 4, title: 'Nhận Diện Điểm Mù Xe Tải Lớn & Xe Bus', desc: 'Nếu bé không thấy tài xế trong gương, tài xế không thấy bé!', q: 'Vị trí nào xung quanh xe tải lớn và xe bus là ĐIỂM MÙ NGUY HIỂM?', a: 'Ngay sát đầu xe, đuôi xe và dọc hai bên hông xe tài xế không thấy', b: 'Trên vỉa hè cách xa xe 5 mét', c: 'Trong sân trường an toàn' },
      { num: 5, title: 'Sang Đường: Vạch Ngựa Vằn & Giơ Cao Tay', desc: 'Quan sát trái phải, đi trên vạch kẻ và giơ tay cao ra hiệu.', q: 'Khi đi bộ sang đường không có đèn tín hiệu, hành động đúng là gì?', a: 'Quan sát trái - phải, đi trên vạch kẻ ngựa vằn và giơ một tay lên cao', b: 'Cắm đầu cắm cổ chạy vụt qua đường', c: 'Vừa đi vừa bấm điện thoại' },
      { num: 6, title: 'Đội Mũ Bảo Hiểm Chuẩn Vừa 2 Ngón Tay', desc: 'Cài quai mũ chắc chắn, khoảng hở dưới cằm vừa đúng 2 ngón tay.', q: 'Đội mũ bảo hiểm đúng quy chuẩn là như thế nào?', a: 'Mũ vừa vặn đầu, cài quai chắc chắn, lọt vừa đúng 2 ngón tay dưới cằm', b: 'Đội mũ rộng lỏng lẻo không cài quai', c: 'Đội mũ ngược ra đằng sau' },
      { num: 7, title: 'Nói "DỪNG LẠI" Trước Bạo Lực Học Đường', desc: 'Dứt khoát yêu cầu hành vi bắt nạt chấm dứt ngay lập tức.', q: 'Bị bạn cùng lớp cố tình đẩy ngã và giật cặp sách, bé phản ứng thế nào?', a: 'Nhìn thẳng vào mắt bạn, nói to dứt khoát: "DỪNG LẠI NGAY!"', b: 'Im lặng để bạn bắt nạt tiếp', c: 'Khóc lóc và nộp hết đồ chơi cho bạn' },
      { num: 8, title: 'Báo Cáo Thầy Cô Khi Bạn Bè Bị Bắt Nạt', desc: 'Lên tiếng bảo vệ bạn bè là hành động dũng cảm của hiệp sĩ.', q: 'Thấy bạn cùng lớp bị nhóm bạn khác cô lập và đe dọa:', a: 'Báo ngay cho thầy cô giáo chủ nhiệm hoặc bác bảo vệ trường', b: 'Đứng hùa theo trêu chọc bạn', c: 'Quay video đăng lên mạng' },
      { num: 9, title: 'Không Đùa Nghịch Ở Cầu Thang, Lan Can Trường', desc: 'Đi về bên phải cầu thang, không xô đẩy hay trượt tay vịn.', q: 'Hành vi nào bị NGHIÊM CẤM ở khu vực cầu thang trường học?', a: 'Trượt trên tay vịn cầu thang và xô đẩy bạn khi lên xuống', b: 'Đi nối hàng về phía bên tay phải', c: 'Nắm tay vịn đi từng bậc' },
      { num: 10, title: '👑 BOSS TEST: Hiệp Sĩ Xe Bus & Trường Học', desc: 'Đại thử thách phản xạ 7 giây an toàn học đường.', q: '⚡ BOSS TEST: Xe bus bốc khói mùi khét lẹt khi đang chạy trên đường:', a: 'Nghe theo hướng dẫn tài xế, che mũi miệng thoát ra cửa khẩn cấp', b: 'Hoảng loạn chen lấn đạp lên nhau', c: 'Cố nán lại tìm cặp sách đồ chơi' },
    ],
  },

  // ==========================================
  // VÙNG 8: NƠI CÔNG CỘNG & CẠM BẪY ĐÔ THỊ
  // ==========================================
  {
    zoneNumber: 8,
    title: 'Vùng 8: Nơi Công Cộng & Cạm Bẫy Đô Thị',
    description: 'Sinh tồn đô thị: Thủ tay Boxer Stance thoát đám đông, kẹt thang máy & thang cuốn.',
    iconName: 'shopping-bag',
    themeColor: '#D62828',
    badgeName: 'Huy Hiệu Vệ Binh Đô Thị',
    badgeCode: 'BADGE_ZONE_8',
    stages: [
      { num: 1, title: 'Tư Thế Thủ Tay Boxer Stance Giữ Thở', desc: 'Hai tay gập trước ngực bảo vệ lồng ngực không bị chèn ép ngạt thở.', q: 'Bị mắc kẹt giữa đám đông lễ hội chen lấn nghẹt thở, tư thế tay đúng là:', a: 'Gập 2 tay trước ngực như võ sĩ quyền anh (Boxer Stance) giữ khoang thở', b: 'Buông thõng hai tay sát hông', c: 'Giơ hai tay lên cao đầu hàng' },
      { num: 2, title: 'Di Chuyển Chéo Theo Dòng Người', desc: 'Di chuyển theo đường zíc-zắc chếch dần ra mép ngoài đám đông.', q: 'Cách thoát hiểm khỏi đám đông hỗn loạn đang xô đẩy là gì?', a: 'Di chuyển chéo góc zíc-zắc chếch dần ra rìa mép ngoài đám đông', b: 'Cố gắng đi ngược chiều dòng người', c: 'Ngồi sụp xuống đất ăn vạ' },
      { num: 3, title: 'Tuyệt Đối Không Cúi Xuống Nhặt Đồ Rơi', desc: 'Cúi người xuống trong đám đông đang đẩy sẽ bị giẫm đạp nguy hiểm.', q: 'Rơi điện thoại hoặc giày trong đám đông đang di chuyển dồn dập:', a: 'TUYỆT ĐỐI KHÔNG cúi xuống nhặt, giữ thăng bằng tiếp tục đi', b: 'Cúi người rạp xuống sàn nhặt đồ', c: 'Nằm xuống sàn mò tìm' },
      { num: 4, title: 'Tư Thế Cuộn Tròn Bảo Vệ Tạng Khi Bị Ngã', desc: 'Nằm nghiêng cuộn tròn như thai nhi, lấy hai tay ôm chặt đầu cổ.', q: 'Không may bị trượt ngã xuống sàn giữa đám đông giẫm đạp:', a: 'Nằm nghiêng cuộn tròn như thai nhi, hai tay ôm chặt bảo vệ đầu và gáy', b: 'Nằm ngửa dạng chân tay', c: 'Nằm sấp ngẩng cao đầu' },
      { num: 5, title: 'Kẹt Thang Máy: Bấm Chuông Cứu Hộ Intercom', desc: 'Nhấn nút chuông vàng và nút nói chuyện cứu hộ trên bảng điều khiển.', q: 'Thang máy tòa nhà đột ngột dừng lại và mất điện tối om, bé làm gì?', a: 'Bình tĩnh nhấn nút Chuông Vàng và nút Intercom gọi phòng kỹ thuật', b: 'Dùng tay cạy mép cửa thang máy', c: 'Nhảy chồm chồm trong buồng thang' },
      { num: 6, title: 'Tựa Lưng Cong Nhẹ Gối Khi Thang Rơi', desc: 'Tựa sát lưng vào vách thang máy và cong đầu gối giảm chấn.', q: 'Thang máy rung lắc tụt xuống nhanh, tư thế giảm chấn thương là gì?', a: 'Tựa sát lưng vào vách thang, tay bám tay vịn, hơi cong đầu gối', b: 'Đứng thẳng tắp giữa buồng thang', c: 'Nhảy lên cao liên tục' },
      { num: 7, title: 'Nút Dừng Khẩn Cấp Màu Đỏ Ở Thang Cuốn', desc: 'Nhận diện vị trí nút bấm dừng khẩn cấp ở hai đầu chân thang cuốn.', q: 'Thấy áo quần của bạn bị kẹt vào khe thang cuốn siêu thị:', a: 'Nhấn ngay NÚT ĐỎ DỪNG KHẨN CẤP ở đầu thang cuốn và hô hoán cứu hộ', b: 'Đứng nhìn bạn bị cuốn vào', c: 'Tiếp tục bước lên thang cuốn' },
      { num: 8, title: 'Chú Ý Bước Qua Khe Hở Cuối Thang Cuốn', desc: 'Nhấc cao chân bước qua răng lược, không để giày dép bị kẹt.', q: 'Khi đi thang cuốn sắp đến điểm kết thúc, bé cần chú ý điều gì?', a: 'Nhấc cao chân bước qua gờ răng lược kim loại, không để dép chạm khe', b: 'Ngồi bệt mông xuống bậc thang cuốn', c: 'Đứng nghịch chân ở mép khe hẹp' },
      { num: 9, title: 'Nhận Diện Sơ Đồ Biển Báo Thoát Hiểm EXIT', desc: 'Biển xanh lá có người chạy hướng về lối thoát hiểm an toàn.', q: 'Biển báo màu xanh lá cây có chữ EXIT và hình người đang chạy chỉ dẫn gì?', a: 'Lối thoát hiểm khẩn cấp an toàn dẫn ra ngoài tòa nhà', b: 'Lối vào rạp chiếu phim', c: 'Phòng vệ sinh công cộng' },
      { num: 10, title: '👑 BOSS TEST: Bậc Thầy Thoát Hiểm Đô Thị', desc: 'Đại thử thách phản xạ 7 giây sinh tồn nơi công cộng.', q: '⚡ BOSS TEST: Trung tâm thương mại mất điện hỗn loạn báo có cháy:', a: 'Nhìn biển EXIT xanh lá phát sáng, di chuyển theo cầu thang bộ thoát hiểm', b: 'Chạy vội vào thang máy bấm nút', c: 'Chạy ngược lên tầng cao nhất trốn' },
    ],
  },

  // ==========================================
  // VÙNG 9: VỆ BINH KHÔNG GIAN MẠNG
  // ==========================================
  {
    zoneNumber: 9,
    title: 'Vùng 9: Vệ Binh Không Gian Mạng',
    description: 'An toàn kỹ thuật số: Bảo mật thông tin, cảnh giác bẫy kim cương & chống bắt nạt mạng.',
    iconName: 'shield-check',
    themeColor: '#00B4D8',
    badgeName: 'Huy Hiệu Khiên Chắn Không Gian Mạng',
    badgeCode: 'BADGE_ZONE_9',
    stages: [
      { num: 1, title: 'Bảo Mật Danh Tính: Không Chia Sẻ Địa Chỉ Nhà', desc: 'Giữ bí mật họ tên thật, địa chỉ nhà, tên trường và lớp học.', q: 'Một người bạn quen trên game online hỏi địa chỉ nhà và số điện thoại bố mẹ:', a: 'TUYỆT ĐỐI KHÔNG chia sẻ thông tin cá nhân cho người lạ trên mạng', b: 'Gửi ngay địa chỉ nhà và trường học', c: 'Đọc số thẻ ngân hàng của mẹ' },
      { num: 2, title: 'Giữ Kín Mật Khẩu Cá Nhân Tuyệt Đối', desc: 'Không chia sẻ mật khẩu tài khoản cho bất kỳ ai trừ ba mẹ.', q: 'Bạn thân cùng lớp xin mật khẩu tài khoản học tập để chơi cùng:', a: 'Từ chối nhẹ nhàng, mật khẩu là thông tin bí mật chỉ chia sẻ với bố mẹ', b: 'Đưa mật khẩu ngay cho bạn', c: 'Đặt mật khẩu dễ đoán là 123456' },
      { num: 3, title: 'Không Bật Camera/Webcam Cho Người Lạ Online', desc: 'Từ chối các yêu cầu gọi video bất thường từ tài khoản lạ.', q: 'Tài khoản lạ trên mạng yêu cầu bật camera khoe phòng ngủ của bé:', a: 'Tắt ngay cuộc gọi, chặn tài khoản và kể với bố mẹ', b: 'Bật camera quay khắp nhà', c: 'Mở cửa phòng cho người đó xem' },
      { num: 4, title: 'Cảnh Giác Bẫy "Nạp Kim Cương Game Miễn Phí"', desc: 'Không cung cấp số điện thoại ba mẹ để nhận quà game ảo.', q: 'Thông báo trên mạng: "Nhập số điện thoại mẹ để nhận 10.000 Kim Cương":', a: 'ĐÂY LÀ BẪY LỪA ĐẢO! Đóng trang web lại ngay lập tức', b: 'Lấy điện thoại mẹ nhập mã OTP nhận quà', c: 'Chia sẻ đường link cho cả lớp' },
      { num: 5, title: 'Tuyệt Đối Không Click Vào Đường Link Lạ', desc: 'Các đường link lạ thường chứa mã độc đánh cắp tài khoản.', q: 'Nhận tin nhắn từ tài khoản lạ gửi đường link trúng thưởng xe đạp điện:', a: 'Không bấm vào link lạ, xóa tin nhắn ngay lập tức', b: 'Bấm vào xem trúng thưởng thật không', c: 'Tải phần mềm lạ về máy tính' },
      { num: 6, title: 'Ứng Phó Khi Nhận Tin Nhắn Đe Dọa Tống Tiền', desc: 'Bình tĩnh kể ngay với ba mẹ, không làm theo lời đe dọa.', q: 'Kẻ xấu trên mạng gửi tin nhắn đe dọa sẽ tung tin xấu nếu không nộp tiền:', a: 'Bình tĩnh chụp ảnh màn hình và báo ngay cho bố mẹ, thầy cô', b: 'Lấy trộm tiền bố mẹ chuyển cho kẻ xấu', c: 'Sợ hãi trốn vào góc phòng khóc' },
      { num: 7, title: 'Chụp Màn Hình Bằng Chứng & Chặn Kẻ Xấu', desc: 'Lưu lại tin nhắn bắt nạt và nhấn Block chặn tài khoản đó.', q: 'Bị một tài khoản liên tục bình luận xúc phạm trên mạng xã hội:', a: 'Chụp màn hình làm bằng chứng ➔ Nhấn nút Chặn (Block) tài khoản đó', b: 'Chửi bới đôi co lại với kẻ xấu', c: 'Xóa tài khoản của chính mình' },
      { num: 8, title: 'Quy Tắc Giới Hạn Giờ Chơi Game Bảo Vệ Mắt', desc: 'Nghỉ ngơi sau mỗi 30-45 phút dùng màn hình thiết bị số.', q: 'Thời gian dùng màn hình máy tính/điện thoại an toàn cho mắt trẻ em:', a: 'Nghỉ giải lao 5-10 phút sau mỗi 30-45 phút học tập/chơi game', b: 'Chơi liên tục 8 tiếng không chớp mắt', c: 'Vừa ăn vừa xem điện thoại sát mắt' },
      { num: 9, title: 'Nhận Diện Thông Tin Giả Mạo (Fake News)', desc: 'Luôn kiểm chứng thông tin giật gân với người lớn có chuyên môn.', q: 'Đọc thấy tin giật gân kỳ lạ chưa được kiểm chứng trên mạng:', a: 'Hỏi lại bố mẹ thầy cô, không tự ý chia sẻ lan truyền tin giả', b: 'Chia sẻ ngay cho tất cả bạn bè', c: 'Tin sái cổ 100%' },
      { num: 10, title: '👑 BOSS TEST: Khiên Chắn Không Gian Mạng', desc: 'Đại thử thách phản xạ 7 giây vệ binh an toàn số.', q: '⚡ BOSS TEST: Người lạ tự xưng admin đòi gửi mã bảo mật OTP tài khoản:', a: 'TUYỆT ĐỐI KHÔNG GỬI! Mã OTP là chìa khóa bí mật bất khả xâm phạm', b: 'Đọc mã OTP cho người đó ngay', c: 'Đổi mật khẩu thành họ tên mình' },
    ],
  },

  // ==========================================
  // VÙNG 10: TỔNG HÀNH DINH CỨU HỘ KHẨN CẤP
  // ==========================================
  {
    zoneNumber: 10,
    title: 'Vùng 10: Tổng Hành Dinh Cứu Hộ Khẩn Cấp',
    description: 'Tổng hành dinh sinh tồn: 4 số cứu nạn (111-115), khai báo 3 bước & Morse SOS.',
    iconName: 'siren',
    themeColor: '#1D3557',
    badgeName: 'Huy Hiệu Đại Sứ Cứu Hộ Tối Thượng',
    badgeCode: 'BADGE_ZONE_10',
    stages: [
      { num: 1, title: 'Ghi Nhớ 4 Số Cứu Nạn (111 - 113 - 114 - 115)', desc: '111 (Trẻ em), 113 (Công an), 114 (Cứu hỏa), 115 (Cấp cứu y tế).', q: 'Khi xảy ra hỏa hoạn cháy nhà, số điện thoại cứu hỏa khẩn cấp là số mấy?', a: '114 (Cứu Hỏa & Cứu Nạn Cứu Hộ Quốc Gia)', b: '113 (Công An)', c: '115 (Cấp Cứu)' },
      { num: 2, title: 'Khai Báo 3 Thông Tin Vàng: Địa Chỉ - Sự Cố - Số Người', desc: 'Cung cấp chính xác vị trí và tình hình khẩn cấp cho trực ban.', q: 'Gọi điện cho tổng đài 114 báo cháy, 3 thông tin vàng cần nói rõ là gì?', a: 'ĐỊA CHỈ NHÀ ➔ LOẠI SỰ CỐ ĐANG XẢY RA ➔ SỐ LƯỢNG NGƯỜI GẶP NẠN', b: 'Kể chuyện cười cho chú cứu hỏa nghe', c: 'Hỏi chú cứu hỏa có bận không' },
      { num: 3, title: 'Giữ Máy Làm Theo Hướng Dẫn Cứu Nạn', desc: 'Không cúp máy trước khi điều phối viên hoàn tất thông tin.', q: 'Sau khi khai báo thông tin sự cố cho trực ban cứu nạn:', a: 'Giữ máy lắng nghe và làm theo hướng dẫn sơ cứu của chuyên viên', b: 'Cúp máy ngay lập tức', c: 'Chửi bới thúc giục người trực ban' },
      { num: 4, title: 'Mật Mã SOS Đèn Pin: 3 Ngắn - 3 Dài - 3 Ngắn', desc: 'Mật mã Morse quốc tế duy nhất được mọi lực lượng cứu hộ nhận biết.', q: 'Quy tắc nhấp nháy đèn pin phát tín hiệu cầu cứu SOS chuẩn Morse quốc tế:', a: '3 LẦN NHÁY NGẮN ➔ 3 LẦN NHÁY DÀI ➔ 3 LẦN NHÁY NGẮN ( • • • — — — • • • )', b: 'Bật đèn sáng liên tục không tắt', c: 'Nháy đèn loạn xạ không theo nhịp' },
      { num: 5, title: 'Tạo Âm Thanh Cầu Cứu Bằng Gõ Kim Loại', desc: 'Gõ vật kim loại vào đường ống dẫn nước/tường gạch để vang xa.', q: 'Bị mắc kẹt trong đống đổ nát, cách tạo âm thanh vang xa tiết kiệm sức:', a: 'Dùng hòn đá hoặc thanh kim loại gõ theo nhịp 3 tiếng vào đường ống nước', b: 'Hét to hết sức cho đến khi mất giọng', c: 'Khóc lóc giãy giụa' },
      { num: 6, title: 'Dùng Gương Phản Chiếu Báo Hiệu Trực Thăng', desc: 'Nghiêng mặt kính gương phản chiếu ánh nắng lên máy bay tìm kiếm.', q: 'Thấy máy bay trực thăng cứu hộ bay trên trời, cách ra hiệu ban ngày là gì?', a: 'Dùng mặt gương soi phản chiếu tia nắng mặt trời về phía buồng lái trực thăng', b: 'Đứng im dưới bóng râm', c: 'Ném đá lên trời' },
      { num: 7, title: 'Vẫy Áo Dạ Quang / Khăn Đỏ Báo Vị Trí Từ Xa', desc: 'Treo vải màu sặc sỡ ở vị trí cao dễ quan sát nhất.', q: 'Vật dụng nào giúp đội cứu hộ nhìn thấy vị trí của bạn từ khoảng cách xa nhất?', a: 'Áo khoác phản quang màu dạ quang hoặc mảnh vải đỏ sặc sỡ giơ cao', b: 'Áo quần màu đen tệp với bóng tối', c: 'Khăn giấy trắng nhỏ xíu' },
      { num: 8, title: 'Kỹ Năng Chỉ Đường Cho Lính Cứu Hỏa Tiếp Cận', desc: 'Mô tả rõ số tầng, số phòng và chướng ngại vật trong tòa nhà.', q: 'Gặp chú lính cứu hỏa ở sảnh chung cư, bé cung cấp thông tin thế nào?', a: 'Chỉ rõ: "Nhà cháu ở tầng 5, phòng 502, trong phòng còn có em nhỏ ạ!"', b: 'Nói: "Ở trển đó chú ơi"', c: 'Im lặng bỏ chạy ra ngoài' },
      { num: 9, title: 'Phối Hợp Đồng Đội: Trấn An Các Bạn Nhỏ Tuổi', desc: 'Dẫn dắt các bạn nhỏ tuổi hơn giữ trật tự cùng thoát hiểm.', q: 'Khi cùng các em nhỏ thoát hiểm, tinh thần của Đại Sứ Cứu Hộ là gì?', a: 'Bình tĩnh, nắm tay dắt các em nhỏ đi theo hàng lối an toàn', b: 'Xô ngã các em nhỏ để chạy trước', c: 'Hù dọa làm các em khóc thét' },
      { num: 10, title: '👑 BOSS TEST: Đại Sứ Cứu Hộ Tối Thượng', desc: 'Đại thử thách phản xạ 7 giây tốt nghiệp khóa huấn luyện Milo.', q: '⚡ BOSS TEST TỐT NGHIỆP: Tình huống tổng hợp khẩn cấp, nguyên tắc tối thượng:', a: 'BÌNH TĨNH QUAN SÁT ➔ BẢO VỆ BẢN THÂN ➔ GỌI 111/114/115 ➔ THOÁT HIỂM AN TOÀN!', b: 'Hoảng sợ bỏ chạy tán loạn', c: 'Đứng lại quay video đăng mạng xã hội' },
    ],
  },
];

async function main() {
  if (process.env.ALLOW_UNREVIEWED_CONTENT_SEED !== 'true') throw new Error('Nội dung chưa được duyệt. Chỉ seed vào DB thử riêng khi ALLOW_UNREVIEWED_CONTENT_SEED=true.');
  console.log('Bắt đầu nạp nội dung NHÁP vào môi trường thử.');

  // Content draft seeding must never create or overwrite learner progress.
  let totalZones = 0;
  let totalStages = 0;
  let totalQuestions = 0;

  // 2. Nạp tuần tự 10 Vùng Đất
  for (const zoneSpec of ZONES_100_STAGES_SPEC) {
    totalZones++;
    console.log(`📌 Đang nạp [${zoneSpec.title}]...`);

    const zone = await prisma.zone.upsert({
      where: { zoneNumber: zoneSpec.zoneNumber },
      update: {
        title: zoneSpec.title,
        description: zoneSpec.description,
        iconName: zoneSpec.iconName,
        themeColor: zoneSpec.themeColor,
        unlockLevel: zoneSpec.zoneNumber,
      },
      create: {
        zoneNumber: zoneSpec.zoneNumber,
        title: zoneSpec.title,
        description: zoneSpec.description,
        iconName: zoneSpec.iconName,
        themeColor: zoneSpec.themeColor,
        unlockLevel: zoneSpec.zoneNumber,
      },
    });

    await prisma.badge.upsert({
      where: { code: zoneSpec.badgeCode },
      update: { name: zoneSpec.badgeName },
      create: {
        zoneId: zone.id,
        name: zoneSpec.badgeName,
        code: zoneSpec.badgeCode,
        description: `Vinh danh nhà thám hiểm nhí xuất sắc hoàn thành trọn bộ 10 ải tại ${zoneSpec.title}.`,
        iconUrl: `https://cdn.kidssafe.ai/badges/badge_zone_${zoneSpec.zoneNumber}.png`,
        requiredShardsCount: 3,
      },
    });

    for (const stg of zoneSpec.stages) {
      // Withdrawn from new draft seeds pending expert replacement. Existing DBs need a separate withdrawal migration.
      if (stg.title.includes('Lightning Crouch')) continue;
      totalStages++;
      const stage = await prisma.stage.upsert({
        where: { zoneId_stageNumber: { zoneId: zone.id, stageNumber: stg.num } },
        update: { title: stg.title, description: stg.desc },
        create: {
          zoneId: zone.id,
          stageNumber: stg.num,
          title: stg.title,
          description: stg.desc,
        },
      });

      const lesson = await prisma.lesson.upsert({
        where: { stageId_lessonNumber: { stageId: stage.id, lessonNumber: 1 } },
        update: { title: stg.title, description: stg.desc },
        create: {
          stageId: stage.id,
          lessonNumber: 1,
          title: stg.title,
          description: stg.desc,
          lessonType: stg.num === 10 ? LessonType.PRACTICE : LessonType.STORY_INTERACTIVE,
          durationMinutes: 5,
          rewardXp: stg.num === 10 ? 200 : 70,
          contentJson: JSON.stringify({
            scenario: `Tình huống thực tế: ${stg.title}. Kỹ năng cứu mạng: ${stg.desc}`,
            miloAdvice: stg.a,
          }),
        },
      });

      const checkpoint = await prisma.checkpoint.upsert({
        where: { lessonId_checkpointNumber: { lessonId: lesson.id, checkpointNumber: 1 } },
        update: { title: `Thử Thách: ${stg.title}` },
        create: {
          lessonId: lesson.id,
          checkpointNumber: 1,
          title: `Thử Thách: ${stg.title}`,
          description: stg.desc,
          passScoreThreshold: 80,
          timeLimitSeconds: stg.num === 10 ? 7 : 15,
        },
      });

      const question = await prisma.testQuestion.upsert({
        where: { checkpointId_questionNumber: { checkpointId: checkpoint.id, questionNumber: 1 } },
        update: { promptText: stg.q },
        create: {
          checkpointId: checkpoint.id,
          questionNumber: 1,
          promptText: stg.q,
          questionType: stg.num === 10 ? QuestionType.TIMED_REFLEX : QuestionType.SINGLE_CHOICE,
          hazardLevel: stg.num === 10 ? HazardLevel.CRITICAL_EMERGENCY : HazardLevel.SAFE,
          timeLimitSeconds: stg.num === 10 ? 7 : 10,
          explanation: `Lời khuyên của Đội Trưởng Milo: ${stg.a}`,
          orderIndex: 1,
        },
      });
      totalQuestions++;

      // Xóa và tạo lại options cho sạch
      await prisma.questionOption.deleteMany({ where: { testQuestionId: question.id } });
      await prisma.questionOption.createMany({
        data: [
          { testQuestionId: question.id, optionText: stg.a, isCorrect: true, displayOrder: 1, feedbackSpeech: 'Chính xác 100%! Hành động này cứu mạng bé!' },
          { testQuestionId: question.id, optionText: stg.b, isCorrect: false, displayOrder: 2, feedbackSpeech: 'Nguy hiểm! Tuyệt đối không làm như vậy!' },
          { testQuestionId: question.id, optionText: stg.c, isCorrect: false, displayOrder: 3, feedbackSpeech: 'Không đúng! Cần quan sát kỹ và làm theo Milo nhé!' },
        ],
      });
    }
  }

  console.log('======================================================');
  console.log(`Đã nạp nội dung NHÁP — chưa được phép xuất bản:`);
  console.log(`   - Tổng số Vùng Đất (Zones): ${totalZones} / 10`);
  console.log(`   - Tổng số Màn Chơi (Stages): ${totalStages} / 100`);
  console.log(`   - Tổng số Câu Hỏi Thực Chiến: ${totalQuestions} / 100`);
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding 100 Stages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
