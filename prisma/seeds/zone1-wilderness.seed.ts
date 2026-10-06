import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone1(prisma: PrismaClient) {
  console.log('🌲 Đang nạp dữ liệu Vùng 1: Rừng Xanh Hoang Dã...');

  // 1. Tạo Zone 1
  const zone1 = await prisma.zone.upsert({
    where: { zoneNumber: 1 },
    update: {
      title: 'Vùng 1: Rừng Xanh Hoang Dã',
      description: 'Học cách sinh tồn trong rừng rậm, kỹ năng không bị lạc, phát tín hiệu SOS và tự vệ trước thú dữ.',
      iconName: 'tree-pine',
      themeColor: '#2A9D8F',
      unlockLevel: 1,
    },
    create: {
      zoneNumber: 1,
      title: 'Vùng 1: Rừng Xanh Hoang Dã',
      description: 'Học cách sinh tồn trong rừng rậm, kỹ năng không bị lạc, phát tín hiệu SOS và tự vệ trước thú dữ.',
      iconName: 'tree-pine',
      themeColor: '#2A9D8F',
      unlockLevel: 1,
    },
  });

  // 2. Tạo Badge Vùng 1
  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_1' },
    update: {},
    create: {
      zoneId: zone1.id,
      name: 'Huy Hiệu Vệ Sĩ Rừng Xanh',
      code: 'BADGE_ZONE_1',
      description: 'Vinh danh nhà thám hiểm nhí làm chủ kỹ năng Ôm Cây Cứu Mạng và tự vệ trong rừng hoang dã.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/forest_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // 3. Stage 1: Kỹ Năng Lạc Rừng & Tín Hiệu SOS
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone1.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone1.id,
      stageNumber: 1,
      title: 'Kỹ Năng Lạc Rừng & Tín Hiệu Cứu Hộ',
      description: 'Quy tắc vàng Hug-a-Tree và phương thức phát tín hiệu cầu cứu quốc tế.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Kỹ Năng Ôm Cây Cứu Mạng (Hug-a-Tree)',
      description: 'Bí kíp sống còn khi nhận ra mình bị lạc khỏi ba mẹ hoặc đoàn dã ngoại.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Vỏ Cây Kỳ Diệu',
      contentJson: JSON.stringify({
        story: 'Đội Trưởng Milo đưa bé vào khu rừng rậm. Milo dặn: "Khi không thấy ba mẹ đâu, hãy đứng yên và ôm lấy một cây to bên cạnh. Cây sẽ là người bạn bảo vệ bé!"',
        coreRule: 'QUY TẮC: DỪNG LẠI & ÔM CÂY (STAY PUT & HUG-A-TREE). Càng hoảng loạn chạy tìm đường, bé sẽ càng bị lạc sâu hơn!',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách Phản Xạ: Ôm Cây & Thổi Còi Cứu Hộ',
      description: 'Vượt qua 3 tình huống phản xạ để nhận Mảnh Vỏ Cây Kỳ Diệu từ Milo.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Vỏ Cây Kỳ Diệu',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Khi nhận ra mình không nhìn thấy ba mẹ ở trong rừng cây, hành động ĐẦU TIÊN bé phải làm là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Đứng yên một chỗ và ôm cây to gần nhất giúp bé an toàn, không bị rơi xuống hố sâu và đội cứu hộ sẽ tìm thấy bé nhanh nhất!',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Đứng yên một chỗ và tìm một thân cây to gần nhất để ôm chặt (Stay put & Hug a tree)',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Ôm cây to giúp bé an toàn và kiểm lâm tìm thấy nhanh nhất!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Chạy thật nhanh về phía trước để tìm đường ra',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Càng chạy bé sẽ càng bị lạc sâu hơn vào rừng rậm!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Trèo lên ngọn cây thật cao để quan sát',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Cẩn thận! Trèo cây cao rất dễ trượt chân gãy tay chân!',
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
      promptText: 'Chiếc còi cứu hộ của Milo nên được thổi như thế nào để phát tín hiệu khẩn cấp đúng chuẩn quốc tế?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: '3 tiếng còi to ngắt quãng là tín hiệu cứu hộ SOS quốc tế mà mọi nhân viên cứu hộ đều nhận diện được.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Thổi 3 tiếng thật to, ngắt quãng rõ ràng (To... To... To...)',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt đỉnh! 3 tiếng còi là mật mã SOS cứu hộ quốc tế!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Thổi một hơi dài liên tục không ngừng',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Thổi liên tục sẽ khiến bé bị hụt hơi và kiệt sức rất nhanh!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Thổi thì thầm thật nhỏ để không làm phiền thú rừng',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Còi cứu hộ cần thổi thật to để vang xa đến tai người cứu hộ nhé!',
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
      promptText: 'Hãy sắp xếp thứ tự 3 bước sinh tồn chuẩn của Đội Trưởng Milo khi bé bị lạc trong rừng:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: 'Quy tắc 3 bước: 1. Dừng lại -> 2. Ôm cây -> 3. Phát tín hiệu cầu cứu.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. DỪNG LẠI (Stop): Đứng yên ngay khi nhận ra mình bị lạc',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Dừng lại ngay lập tức!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. ÔM CÂY (Hug-a-Tree): Tìm một cây to an toàn đứng sát vào',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Ôm cây để giữ vị trí an toàn!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. PHÁT TÍN HIỆU (Signal): Thổi 3 tiếng còi hoặc hô to để người lớn tìm thấy',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Phát tín hiệu còi cứu hộ!',
      },
    ],
  });

  // 4. Stage 2: Cạm Bẫy Sinh Vật Rừng
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone1.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone1.id,
      stageNumber: 2,
      title: 'Nhận Diện Nấm Độc & Tự Vệ Trước Ong Vò Vẽ',
      description: 'Phòng tránh ngộ độc nấm rừng và tư thế tự vệ khi bị ong tấn công.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Tư Thế Nằm Cuộn Tròn Tự Vệ & Cảnh Giác Nấm Độc',
      description: 'Tuyệt chiêu cuộn tròn bảo vệ vùng trọng yếu và nguyên tắc nấm sặc sỡ.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Lá Chắn Rừng Xanh',
      contentJson: JSON.stringify({
        story: 'Milo chỉ vào những cây nấm đỏ đốm trắng: "Nấm càng sặc sỡ càng chứa kịch độc! Và nếu nghe tiếng vò vẽ của ong dữ, hãy cuộn tròn bảo vệ mắt và mặt ngay!"',
        coreRule: '1. Không ăn nấm lạ. 2. Khi gặp ong dữ: Nằm sấp cuộn tròn, che mặt, không vung tay loạn xạ.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Tự Vệ Trước Ong Dữ & Nấm Lạ',
      description: 'Vượt qua bài test phản xạ tự vệ sinh vật rừng để nhận Mảnh Lá Chắn Rừng Xanh.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Lá Chắn Rừng Xanh',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Nếu vô tình chạm phải tổ ong rừng và đàn ong bắt đầu bay ra tấn công, tư thế tự vệ đúng nhất là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Nằm sấp cuộn tròn, dùng áo và tay che kín mắt, mũi, cổ giúp bảo vệ các cơ quan trọng yếu khỏi vết chích độc!',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Nằm sấp cuộn tròn người, lấy tay và áo che kín đầu, mặt, cổ và nằm im không cử động',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Nằm sấp cuộn tròn bảo vệ mắt mũi cổ và ong sẽ mất mục tiêu!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Đứng tại chỗ vung hai tay loạn xạ để đuổi đàn ong đi',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Rất nguy hiểm! Vung tay càng kích động đàn ong đốt dữ dội hơn!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Vừa chạy vừa hét lớn và cởi áo ném đi',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Cởi áo sẽ làm lộ da thịt cho ong chích nhiều hơn!',
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
      promptText: 'Những cây nấm mọc hoang trong rừng có màu đỏ tươi, vàng cam hoặc có đốm sặc sỡ thì có an toàn để hái ăn thử không?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Nấm rừng có màu sắc sặc sỡ và vòng cổ dưới mũ thường chứa độc tố cực mạnh gây suy gan thận chết người.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Tuyệt đối không hái, không chạm tay vào và không bao giờ được ăn thử',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Tuyệt đối không nếm nấm rừng sặc sỡ vì kịch độc!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Có thể hái nếm thử một chút nếu thấy nấm thơm',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Chỉ một mẩu nấm độc nhỏ cũng có thể gây ngộ độc nặng!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Rửa sạch bằng nước suối là có thể ăn được',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Nước suối không thể rửa trôi chất độc bên trong thân nấm!',
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
      promptText: 'Nếu từ xa nhìn thấy một chú chó hoang hoặc thú dữ trong rừng, hành động an toàn nhất của bé là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Không nhìn thẳng vào mắt thú dữ, từ từ lùi lại phía sau và không bao giờ quay lưng bỏ chạy vì sẽ kích hoạt bản năng săn mồi.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Đứng thẳng, không nhìn chằm chằm vào mắt nó, từ từ đi lùi lại phía sau',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Lùi lại từ từ giúp thú dữ thấy bé không có ý định tấn công!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Quay lưng chạy thục mạng và hét lớn',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Quay lưng chạy sẽ kích thích con vật đuổi theo cắn!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Nhặt đá ném về phía con thú để dọa nó',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Ném đá sẽ làm con thú nổi giận và tấn công ngay lập tức!',
      },
    ],
  });
}
