import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone1(prisma: PrismaClient) {
  console.log('🌲 Đang nạp dữ liệu Vùng 1: Rừng Xanh Hoang Dã (10 Màn Chơi)...');

  const zone = await prisma.zone.upsert({
    where: { zoneNumber: 1 },
    update: {
      title: 'Vùng 1: Rừng Xanh Hoang Dã',
      description: 'Kỹ năng sinh tồn rừng rậm: Cắm trại an toàn, Hug-a-tree, còi SOS, nấm độc, ong dữ & Boss Test 48h.',
      iconName: 'trees',
      themeColor: '#2A9D8F',
      unlockLevel: 1,
    },
    create: {
      zoneNumber: 1,
      title: 'Vùng 1: Rừng Xanh Hoang Dã',
      description: 'Kỹ năng sinh tồn rừng rậm: Cắm trại an toàn, Hug-a-tree, còi SOS, nấm độc, ong dữ & Boss Test 48h.',
      iconName: 'trees',
      themeColor: '#2A9D8F',
      unlockLevel: 1,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_1' },
    update: {},
    create: {
      zoneId: zone.id,
      name: 'Huy Hiệu Vệ Sĩ Rừng Xanh',
      code: 'BADGE_ZONE_1',
      description: 'Vinh danh nhà thám hiểm vượt qua 10 ải sinh tồn Rừng Xanh Hoang Dã.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/forest_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  const stagesData = [
    { num: 1, title: 'Ranh Giới An Toàn Khi Cắm Trại', desc: 'Nhận diện cột mốc và không tự ý đi xa khỏi khu cắm trại.', q: 'Khi cắm trại cùng gia đình, quy tắc khoảng cách an toàn là gì?', a: 'Luôn ở trong tầm mắt của người lớn, không tự ý đi sâu vào bụi rậm', b: 'Tự ý đi khám phá một mình', c: 'Chạy đuổi bắt bướm vào rừng sâu' },
    { num: 2, title: 'Quy Tắc Cây Ôm "Hug-a-Tree"', desc: 'Đứng yên ôm chặt thân cây to khi nhận ra mình đã bị lạc.', q: 'Khi bị lạc trong rừng rậm, hành động ĐẦU TIÊN đúng nhất là gì?', a: 'Đứng yên tại chỗ và ôm một cái cây to gần nhất (Hug-a-Tree)', b: 'Cắm đầu chạy thật nhanh tìm đường về', c: 'Trèo lên ngọn cây thật cao' },
    { num: 3, title: 'Thổi Còi Cứu Nạn 3 Tiếng SOS', desc: 'Thổi 3 tiếng ngắt quãng dứt khoát định kỳ phát tín hiệu.', q: 'Nhịp điệu thổi còi cứu hộ SOS chuẩn quốc tế trong rừng là gì?', a: 'Thổi 3 tiếng còi thật to, dứt khoát rồi ngắt quãng (To - To - To)', b: 'Thổi 1 tiếng nhẹ rồi cất còi đi', c: 'Thổi liên tục không ngừng' },
    { num: 4, title: 'Phân Biệt Nấm Ăn & Nấm Độc', desc: 'Nhận diện nấm màu sắc sặc sỡ và quy tắc tuyệt đối không nếm.', q: 'Gặp cây nấm có màu đỏ chấm trắng rất đẹp trong rừng, bé phải làm gì?', a: 'Tuyệt đối KHÔNG chạm hay ăn, đây là nấm độc nguy hiểm', b: 'Hái về nấu canh ăn', c: 'Rửa nước suối rồi nếm thử' },
    { num: 5, title: 'Quả Mọng Rừng & Hứng Nước Sương', desc: 'Tránh xa quả dại độc hại và cách hứng nước sương sạch.', q: 'Nguồn nước uống khẩn cấp an toàn nhất trong rừng là gì?', a: 'Hứng giọt sương đọng trên lá cây to sạch buổi sáng', b: 'Uống nước vũng bùn tù đọng', c: 'Uống nước suối có xác lá mục thối' },
    { num: 6, title: 'Tư Thế "Đứng Như Tượng" Trước Ong Vò Vẽ', desc: 'Bình tĩnh đứng im không vung tay đánh đuổi ong dữ.', q: 'Khi một đàn ong vò vẽ bay xung quanh bé, phản xạ đúng nhất là gì?', a: 'Đứng yên bất động như tượng đá, lấy hai tay che mặt và cổ', b: 'Vung tay đập loạn xạ vào bầy ong', c: 'Cởi áo quạt mạnh đuổi ong' },
    { num: 7, title: 'Tư Thế "Cuộn Tròn Như Tảng Đá"', desc: 'Nằm sấp cuộn tròn lấy hai tay che kín gáy và mặt.', q: 'Gặp thú rừng hoang dã tiến lại gần, tư thế phòng thủ tự vệ là gì?', a: 'Nằm sấp cuộn tròn bảo vệ mặt và cổ, giữ yên lặng', b: 'Ném đá vào mắt con thú', c: 'Hét to và chạy thục mạng' },
    { num: 8, title: 'Xử Lý Khi Trượt Chân Rơi Xuống Hố', desc: 'Bình tĩnh kiểm tra cơ thể và phát âm thanh cầu cứu.', q: 'Bị trượt chân rơi xuống hố sâu trong rừng, bé nên làm gì?', a: 'Bình tĩnh ngồi dậy, kiểm tra tay chân và thổi còi gọi cứu hộ', b: 'Hoảng sợ khóc lóc giãy giụa', c: 'Cố sức nhảy liên tục làm kiệt sức' },
    { num: 9, title: 'Dựng Dấu Hiệu SOS Bằng Cành Cây & Đá', desc: 'Xếp chữ SOS kích thước lớn trên khoảng đất trống.', q: 'Cách xếp cành cây tạo dấu hiệu SOS cho máy bay trực thăng tìm kiếm:', a: 'Xếp 3 chữ S-O-S kích thước thật to trên bãi đất trống phẳng', b: 'Xếp một đống lá nhỏ dưới gốc cây rậm', c: 'Vứt cành cây rải rác' },
    { num: 10, title: '👑 BOSS TEST: Sinh Tồn 48 Giờ Lạc Rừng', desc: 'Đại thử thách phản xạ 7 giây tổng hợp cứu hộ rừng rậm.', q: '⚡ BOSS TEST: Trời sập tối trong rừng rậm hoang dã, quyết định sinh tồn cứu mạng là gì?', a: 'Ngồi sát gốc cây to đã chọn, trùm áo giữ ấm cơ thể và thổi còi định kỳ', b: 'Tiếp tục đi lang thang trong đêm tối', c: 'Trèo lên đỉnh núi cao trong bóng đêm' },
  ];

  for (const stg of stagesData) {
    const stage = await prisma.stage.upsert({
      where: { zoneId_stageNumber: { zoneId: zone.id, stageNumber: stg.num } },
      update: { title: stg.title, description: stg.desc },
      create: { zoneId: zone.id, stageNumber: stg.num, title: stg.title, description: stg.desc },
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
        contentJson: JSON.stringify({ story: `Kịch bản sinh tồn: ${stg.title}. Milo đồng hành huấn luyện kỹ năng.`, coreRule: stg.desc }),
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

    await prisma.questionOption.createMany({
      data: [
        { testQuestionId: question.id, optionText: stg.a, isCorrect: true, displayOrder: 1, feedbackSpeech: 'Chính xác 100%! Hành động này cứu mạng bé!' },
        { testQuestionId: question.id, optionText: stg.b, isCorrect: false, displayOrder: 2, feedbackSpeech: 'Nguy hiểm! Tuyệt đối không làm như vậy!' },
        { testQuestionId: question.id, optionText: stg.c, isCorrect: false, displayOrder: 3, feedbackSpeech: 'Không đúng! Cần quan sát và giữ an toàn!' },
      ],
    });
  }
}
