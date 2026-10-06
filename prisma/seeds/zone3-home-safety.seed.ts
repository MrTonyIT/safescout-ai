import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone3(prisma: PrismaClient) {
  console.log('🏠 Đang nạp dữ liệu Vùng 3: Pháo Đài Tại Gia...');

  const zone3 = await prisma.zone.upsert({
    where: { zoneNumber: 3 },
    update: {
      title: 'Vùng 3: Pháo Đài Tại Gia',
      description: 'Kỹ năng thoát hiểm hỏa hoạn, bò thấp dưới khói, kỹ thuật Dừng-Nằm-Lăn và an toàn ổ cắm điện.',
      iconName: 'home-shield',
      themeColor: '#E63946',
      unlockLevel: 1,
    },
    create: {
      zoneNumber: 3,
      title: 'Vùng 3: Pháo Đài Tại Gia',
      description: 'Kỹ năng thoát hiểm hỏa hoạn, bò thấp dưới khói, kỹ thuật Dừng-Nằm-Lăn và an toàn ổ cắm điện.',
      iconName: 'home-shield',
      themeColor: '#E63946',
      unlockLevel: 1,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_3' },
    update: {},
    create: {
      zoneId: zone3.id,
      name: 'Huy Hiệu Dũng Sĩ Pháo Đài',
      code: 'BADGE_ZONE_3',
      description: 'Vinh danh nhà thám hiểm làm chủ kỹ năng thoát hiểm hỏa hoạn và an toàn điện gia đình.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/home_sentinel_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Thoát Hiểm Khói Độc & Kiểm Tra Cửa Cháy
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone3.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone3.id,
      stageNumber: 1,
      title: 'Phòng Tuyến Thoát Hiểm Khói Độc',
      description: 'Bò thấp sát đất để hít thở khí sạch và kiểm tra cửa trước khi mở.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Bò Thấp Dưới Khói & Mu Bàn Tay Kiểm Tra Cửa Cháy',
      description: 'Bảo vệ lá phổi khỏi ngạt khí và tránh mở vào căn phòng đang rực lửa.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Khiên Chống Khói',
      contentJson: JSON.stringify({
        story: 'Cảnh báo khói kêu vang! Milo hướng dẫn: "Khói độc luôn bốc lên cao trần nhà. Hãy bò thấp sát sàn nhà, dùng khăn ẩm bịt mũi và dùng mu bàn tay thử nhiệt độ cửa!"',
        coreRule: '1. Bò thấp men theo tường. 2. Mu bàn tay chạm nhẹ thử cửa nóng.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Bò Thấp & Thử Cửa Nóng',
      description: 'Phản xạ chính xác khi có khói để nhận Mảnh Khiên Chống Khói.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Khiên Chống Khói',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Nếu trong phòng có khói đen dày đặc bốc lên, tư thế di chuyển đúng nhất để tránh bị ngạt khí độc là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Khí độc luôn bốc lên cao. Khoảng cách 30-50cm sát sàn nhà là nơi có nhiều oxy sạch nhất!',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Bò thấp sát sàn nhà, dùng khăn hoặc áo ẩm bịt kín mũi và miệng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Bò thấp sát đất và bịt khăn ẩm bảo vệ lá phổi của bé!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Đứng thẳng người và chạy thật nhanh ra phía cửa',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Rất nguy hiểm! Đứng thẳng sẽ hít phải khói độc bốc lên phía trên!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Nấp vào trong tủ quần áo hoặc gầm giường đóng kín lại',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Tuyệt đối không trốn trong tủ kín, lính cứu hỏa sẽ khó tìm thấy bé!',
      },
    ],
  });

  // Question 2: SINGLE_CHOICE
  const q2 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 2 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 2,
      promptText: 'Trước khi mở cánh cửa để thoát ra ngoài, bé PHẢI dùng bộ phận nào để kiểm tra nhiệt độ cửa?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Mu bàn tay (lưng bàn tay) rất nhạy cảm với nhiệt độ. Nếu cửa quá nóng, phản xạ tự nhiên sẽ rụt tay lại mà không bị bỏng dính lòng bàn tay.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Dùng MU BÀN TAY (lưng bàn tay) chạm nhẹ vào cánh cửa hoặc tay nắm',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Mu bàn tay giúp nhận biết nhiệt độ an toàn mà không làm bỏng lòng bàn tay!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Dùng cả lòng bàn tay nắm thật chặt vào tay nắm kim loại',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Tay nắm kim loại nóng bỏng sẽ làm bỏng dính lòng bàn tay!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Áp má hoặc trán vào cánh cửa để nghe ngóng',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Tuyệt đối không áp mặt vào cửa vì có thể bị bỏng da mặt rất nguy hiểm!',
      },
    ],
  });

  // Question 3: DRAG_DROP_ORDER
  const q3 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 3 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 3,
      promptText: 'Sắp xếp đúng thứ tự các bước thoát hiểm khi phát hiện cháy trong nhà:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: 'Thứ tự chuẩn: 1. Báo động -> 2. Bò thấp thoát ra ngoài -> 3. Gọi 114 khi đã an toàn.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. BÁO ĐỘNG: Hô to "CHÁY" để báo cho mọi người và ba mẹ biết',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Báo động ngay!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. BÒ THẤP: Bịt khăn ẩm vào mũi, bò thấp men theo chân tường ra cửa',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Bò thấp thoát ra!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. GỌI CỨU HỎA: Khi đã ra ngoài an toàn, nhờ người lớn gọi ngay 114',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Gọi 114 khi an toàn!',
      },
    ],
  });

  // Stage 2: Kỹ Thuật Dừng-Nằm-Lăn & An Toàn Điện
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone3.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone3.id,
      stageNumber: 2,
      title: 'Kỹ Thuật Dừng - Nằm - Lăn & An Toàn Điện',
      description: 'Dập tắt lửa trên quần áo và bảo vệ bản thân trước nguy cơ điện giật.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Kỹ Thuật Stop - Drop - Roll & Phòng Ngừa Điện Giật',
      description: 'Dập tắt ngọn lửa trên người và nguyên tắc không nghịch ổ cắm điện.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Lá Chắn Dập Lửa',
      contentJson: JSON.stringify({
        story: 'Milo hướng dẫn: "Nếu quần áo bén lửa: Tuyệt đối KHÔNG CHẠY! Hãy DỪNG LẠI (Stop), NẰM XUỐNG (Drop), LĂN QUA LĂN LẠI (Roll) và lấy tay che mặt. Và không bao giờ chạm vào ổ cắm điện khi tay ướt!"',
        coreRule: '1. Quần áo cháy: Dừng - Nằm - Lăn. 2. Không chạm ổ điện bằng tay ướt.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Dừng - Nằm - Lăn & An Toàn Điện',
      description: 'Thực hành dập lửa quần áo để nhận Mảnh Lá Chắn Dập Lửa.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Lá Chắn Dập Lửa',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Nếu quần áo của bé chẳng may bị bén lửa, phản xạ tức thì là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Kỹ thuật Stop, Drop & Roll: Dừng lại không chạy, nằm xuống đất, lăn qua lăn lại và dùng hai tay che kín mặt để dập tắt lửa.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'DỪNG LẠI (Stop), NẰM XUỐNG (Drop), LĂN QUA LẠI (Roll) và lấy 2 tay che mặt',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Dừng-Nằm-Lăn là kỹ thuật vàng dập lửa quần áo!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Chạy thật nhanh để gió thổi tắt ngọn lửa',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Chạy sẽ làm gió thổi lửa bùng cháy dữ dội hơn!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Lấy quạt điện quạt mạnh vào người',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Quạt gió sẽ cung cấp thêm oxy khiến ngọn lửa cháy to hơn!',
      },
    ],
  });

  // Question 2: SINGLE_CHOICE
  const q2_2 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 2 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 2,
      promptText: 'Khi tay đang bị ướt nước, bé có được phép cắm hoặc rút phích cắm điện không?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Nước dẫn điện cực kỳ tốt. Chạm vào thiết bị điện khi tay ướt có thể gây giật điện tử vong ngay lập tức.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Tuyệt đối không! Phải lau khô tay hoàn toàn hoặc nhờ người lớn làm giúp',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Luôn giữ tay khô ráo khi sử dụng đồ điện!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Được phép nếu cắm thật nhanh',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Dòng điện truyền qua nước chỉ trong tích tắc!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Được phép nếu dùng ngón chân cắm',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Tuyệt đối không dùng chân nghịch ổ điện!',
      },
    ],
  });

  // Question 3: SINGLE_CHOICE
  const q2_3 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 3 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 3,
      promptText: 'Nếu phát hiện dây điện quạt hoặc tivi trong nhà bị chuột cắn tróc vỏ lòi lõi đồng, bé phải làm gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Dây điện hở lõi đồng có thể phóng điện gây giật. Bé cần lùi xa ít nhất 3 bước và báo ngay người lớn sửa chữa.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Lùi xa ít nhất 3 bước, không chạm vào và báo ngay cho ba mẹ hoặc người lớn',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Tuyệt đối không chạm vào dây điện hở lõi đồng nhé!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Lấy băng dính dán lại ngay',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Trẻ em không được tự ý sửa điện hở, rất dễ bị điện giật!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Lấy kéo cắt đứt sợi dây đó đi',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Dùng kéo kim loại cắt dây điện đang cắm sẽ bị điện giật cực mạnh!',
      },
    ],
  });
}
