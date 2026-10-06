import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone5(prisma: PrismaClient) {
  console.log('🌋 Đang nạp dữ liệu Vùng 5: Thung Lũng Thiên Tai...');

  const zone5 = await prisma.zone.upsert({
    where: { zoneNumber: 5 },
    update: {
      title: 'Vùng 5: Thung Lũng Thiên Tai',
      description: 'Ứng phó thiên tai: quy tắc Drop-Cover-Hold On khi động đất, tư thế Lightning Crouch tránh sét và cảnh giác lũ quét.',
      iconName: 'cloud-lightning',
      themeColor: '#6A4C93',
      unlockLevel: 3,
    },
    create: {
      zoneNumber: 5,
      title: 'Vùng 5: Thung Lũng Thiên Tai',
      description: 'Ứng phó thiên tai: quy tắc Drop-Cover-Hold On khi động đất, tư thế Lightning Crouch tránh sét và cảnh giác lũ quét.',
      iconName: 'cloud-lightning',
      themeColor: '#6A4C93',
      unlockLevel: 3,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_5' },
    update: {},
    create: {
      zoneId: zone5.id,
      name: 'Huy Hiệu Khiên Bão Địa Chấn',
      code: 'BADGE_ZONE_5',
      description: 'Trao cho dũng sĩ sinh tồn làm chủ kỹ năng ứng phó động đất, sấm sét và mưa bão.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/disaster_shield_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Động Đất & Rung Chấn
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone5.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone5.id,
      stageNumber: 1,
      title: 'Phòng Tuyến Địa Chấn: Drop - Cover - Hold On',
      description: 'Kỹ thuật chui gầm bàn bảo vệ đầu khi mặt đất rung chuyển dữ dội.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Quy Tắc Động Đất: DROP - COVER - HOLD ON',
      description: 'Tránh xa cửa kính, không đi thang máy và giữ chặt chân bàn vững chắc.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Khiên Địa Chấn',
      contentJson: JSON.stringify({
        story: 'Mặt đất rung lắc bần bật! Milo hét lớn: "ĐỘNG ĐẤT RỒI! Không chạy ra cửa sổ, không đi thang máy! Hãy DROP (Ngồi thụp), COVER (Chui gầm bàn) và HOLD ON (Giữ chặt chân bàn) ngay!"',
        coreRule: 'Động đất: DROP (Hạ thấp) -> COVER (Che đầu dưới gầm bàn) -> HOLD ON (Giữ chặt chân bàn).',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Động Đất Rung Chuyển',
      description: 'Thực hiện chính xác thao tác chui gầm bàn để nhận Mảnh Khiên Địa Chấn.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Khiên Địa Chấn',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Khi mặt đất và đồ đạc bắt đầu rung lắc dữ dội vì động đất, hành động ngay lập tức là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Quy tắc Drop, Cover & Hold On giúp bảo vệ não bộ và cơ thể khỏi trần nhà, quạt trần, đèn chùm đổ sập.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Quy tắc DROP - COVER - HOLD ON: Ngồi thụp xuống, chui dưới gầm bàn vững chắc và giữ chặt chân bàn',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Gầm bàn vững chắc bảo vệ đầu khỏi các vật thể rơi vỡ!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Chạy thật nhanh vào thang máy để xuống tầng trệt',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Thang máy sẽ bị mất điện kẹt cứng hoặc đứt cáp!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Chạy ra đứng sát cửa sổ kính nhìn ra bên ngoài',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Cửa kính sẽ vỡ vụn bắn vào người gây thương tích rất nặng!',
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
      promptText: 'Nếu đang đi ở ngoài đường phố lúc xảy ra động đất, vị trí trú ẩn an toàn nhất là ở đâu?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Di chuyển ra các khoảng đất trống rộng rãi, tránh xa cột điện, tường gạch cũ, tòa nhà cao tầng và biển quảng cáo.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Di chuyển ra bãi đất trống, tránh xa cột điện, tường gạch cũ và biển quảng cáo cao tầng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Tránh xa các vật thể có nguy cơ đổ sụp!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Đứng nép sát vào chân tường của một tòa nhà cao ốc',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Gạch đá và kính từ trên cao ốc có thể rơi trúng đầu!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Trèo lên cây to bên đường',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Cây to có thể bị gãy đổ hoặc va vào đường dây điện!',
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
      promptText: 'Sắp xếp đúng thứ tự 3 bước sinh tồn trong quy tắc "DROP - COVER - HOLD ON":',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. DROP (Hạ thấp người) -> 2. COVER (Che chắn đầu cổ) -> 3. HOLD ON (Giữ chặt điểm tựa).',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. DROP: Ngồi thụp xuống sàn nhà để không bị mất thăng bằng ngã',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Ngồi thụp xuống!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. COVER: Chui dưới gầm bàn và lấy tay che kín đầu và gáy',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Che đầu cổ!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. HOLD ON: Giữ chặt chân bàn cho đến khi hết rung lắc hoàn toàn',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Giữ chặt chân bàn!',
      },
    ],
  });

  // Stage 2: Sấm Sét & Lũ Quét
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone5.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone5.id,
      stageNumber: 2,
      title: 'Tư Thế Ngồi Xổm Tránh Sét & Thoát Lũ Quét',
      description: 'Kỹ thuật Lightning Crouch và nhận diện sớm dấu hiệu lũ quét đầu nguồn.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Tư Thế Lightning Crouch & Cảnh Giác Lũ Suối',
      description: 'Tuyệt đối không trú sét dưới cây to và sơ tán khi nước suối đổi màu.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Thu Lôi Vàng',
      contentJson: JSON.stringify({
        story: 'Sấm chớp rạch ngang trời! Milo cảnh báo: "Không bao giờ nấp dưới gốc cây to cô độc! Hãy ngồi xổm kiễng gót (Lightning Crouch) và bịt tai. Và khi suối đục ngầu ầm ầm, chạy lên đồi cao ngay!"',
        coreRule: '1. Sấm sét đồng trống: Ngồi xổm kiễng gót chân, cúi đầu. 2. Lũ quét: Chạy lên đồi cao.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Sấm Sét & Dòng Nước Lũ',
      description: 'Phòng tránh sét đánh và nhận diện lũ quét để nhận Mảnh Thu Lôi Vàng.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Thu Lôi Vàng',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Khi đang ở bãi đất trống bỗng có giông sét dữ dội mà không có nhà trú ẩn, tư thế chuẩn để giảm nguy cơ sét đánh là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Tư thế Lightning Crouch: Ngồi xổm, kiễng hai gót chân chụm vào nhau, cúi đầu bịt tai để giảm tối đa dòng điện chạy qua tim nếu sét đánh gần.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Tư thế Lightning Crouch: Ngồi xổm thấp, hai gót chân chụm kiễng cao, hai tay bịt tai và cúi đầu sát đầu gối',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Giảm diện tích tiếp xúc đất và không tạo thành cột thu lôi!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Chạy lại nấp ngay dưới gốc cây cổ thụ to nhất trên cánh đồng',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Cây cao cô độc là nơi sét đánh trúng nhiều nhất!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Nằm dài áp thẳng cả người và ngực xuống mặt đất ướt',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Nằm dài làm tăng diện tích tiếp xúc với dòng điện lan truyền trên đất!',
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
      promptText: 'Dấu hiệu nhận biết sớm lũ quét nguy hiểm khi đang cắm trại gần suối rừng là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Nước suối bỗng dưng đổi màu đục ngầu, cuốn theo cành cây rác và có tiếng gầm rống từ đầu nguồn -> Phải sơ tán lên vị trí cao ráo ngay lập tức.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Nước suối bỗng đổi màu đục ngầu, mực nước dâng nhanh và có tiếng ầm ầm từ trên nguồn dội xuống',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Hãy lập tức bỏ lại đồ đạc và chạy lên ngọn đồi cao an toàn!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Nước suối trong vắt và cá bơi lội nhiều hơn',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nước suối đục ngầu và dâng cao mới là dấu hiệu lũ quét!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Gió ngừng thổi hoàn toàn',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Lũ quét liên quan trực tiếp đến mưa lớn và dòng nước đầu nguồn!',
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
      promptText: 'Khi đang ở trong nhà lúc bên ngoài trời có sấm sét dữ dội, bé KHÔNG NÊN làm điều gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Không tắm bồn hay dùng vòi sen (ống nước kim loại dẫn sét), không đứng sát cửa sổ kim loại và hạn chế dùng thiết bị điện cắm sạc.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Đi tắm bồn / vòi sen và cắm sạc điện thoại ngồi gần cửa sổ kính',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Nước, ống kim loại và thiết bị cắm điện có thể dẫn sét!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Ngồi ở phòng khách đọc truyện tranh',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Đọc truyện trong nhà cách xa cửa sổ là hành động an toàn!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Đóng kín các cửa sổ và cửa ra vào',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đóng cửa sổ giúp ngăn gió lốc và mưa tạt vào nhà!',
      },
    ],
  });
}
