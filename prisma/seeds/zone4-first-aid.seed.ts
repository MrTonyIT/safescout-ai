import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone4(prisma: PrismaClient) {
  console.log('🩺 Đang nạp dữ liệu Vùng 4: Trạm Y Tế Thần Tốc...');

  const zone4 = await prisma.zone.upsert({
    where: { zoneNumber: 4 },
    update: {
      title: 'Vùng 4: Trạm Y Tế Thần Tốc',
      description: 'Sơ cấp cứu chuẩn y khoa: xử lý bỏng nước sôi, cấp cứu hóc dị vật Heimlich và chảy máu cam.',
      iconName: 'cross',
      themeColor: '#06D6A0',
      unlockLevel: 2,
    },
    create: {
      zoneNumber: 4,
      title: 'Vùng 4: Trạm Y Tế Thần Tốc',
      description: 'Sơ cấp cứu chuẩn y khoa: xử lý bỏng nước sôi, cấp cứu hóc dị vật Heimlich và chảy máu cam.',
      iconName: 'cross',
      themeColor: '#06D6A0',
      unlockLevel: 2,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_4' },
    update: {},
    create: {
      zoneId: zone4.id,
      name: 'Huy Hiệu Quân Y Thần Tốc',
      code: 'BADGE_ZONE_4',
      description: 'Vinh danh nhà thám hiểm nắm vững kiến thức sơ cấp cứu y khoa sống còn.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/medic_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Sơ Cứu Bỏng & Hóc Dị Vật
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone4.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone4.id,
      stageNumber: 1,
      title: 'Cứu Bỏng Nước Sôi & Giải Cứu Hóc Dị Vật',
      description: 'Kỹ thuật xả nước mát 15-20 phút và nhận diện dấu hiệu hóc dị vật nghẹt thở.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Sơ Cứu Bỏng Chuẩn Y Khoa & Dấu Hiệu Hóc Dị Vật',
      description: 'Nói không với kem đánh răng/nước mắm và giải cứu bạn bị hóc thạch.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Túi Cứu Thương',
      contentJson: JSON.stringify({
        story: 'Milo chỉ vào vòi nước mát: "Khi bị bỏng, người bạn tốt nhất là dòng nước mát chảy nhẹ 15-20 phút! Tuyệt đối không bôi kem đánh răng hay mỡ trăn. Và khi ai đó ôm cổ không thở được, hãy gọi người lớn làm nghiệm pháp Heimlich ngay!"',
        coreRule: '1. Bỏng: Xả nước mát 15-20 phút. 2. Hóc dị vật: Vỗ lưng 5 lần & Ép bụng Heimlich.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Sơ Cứu Bỏng & Hóc Dị Vật',
      description: 'Xử lý chuẩn xác các tình huống y tế khẩn cấp để nhận Mảnh Túi Cứu Thương.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Túi Cứu Thương',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Nếu vô tình bị nước sôi hoặc canh nóng bắn vào cánh tay gây bỏng rát, hành động ĐẦU TIÊN đúng y khoa là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Ngay lập tức xả nước mát sạch chảy nhẹ từ 15-20 phút giúp hạ nhiệt độ mô sâu, giảm phồng rộp và giảm đau đớn hiệu quả nhất.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Đặt ngay vết bỏng dưới vòi nước mát chảy nhẹ liên tục từ 15 đến 20 phút',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Nước mát sạch là phương pháp hạ nhiệt bỏng chuẩn y khoa!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Bôi ngay kem đánh răng hoặc mỡ trăn lên vết bỏng',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Sai lầm nguy hiểm! Bôi kem đánh răng làm giữ nhiệt và gây nhiễm trùng nặng!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Lấy đá viên chườm trực tiếp thật lâu lên vết bỏng',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Chườm đá lạnh trực tiếp có thể gây bỏng lạnh và hoại tử da!',
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
      promptText: 'Khi thấy bạn đang ăn bỗng nhiên hai tay ôm lấy cổ họng, mặt đỏ bừng tím tái, không nói và không thở được, đây là dấu hiệu của gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Hai tay ôm cổ họng và không phát ra tiếng là dấu hiệu quốc tế của nạn nhân bị hóc dị vật đường thở nguy kịch.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Hóc dị vật đường thở nguy kịch, cần gọi người lớn cấp cứu vỗ lưng / ép bụng Heimlich ngay',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Đây là dấu hiệu nghẹt thở khẩn cấp cần cấp cứu tức thì!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Bạn chỉ đang bị sặc nước nhẹ, bảo bạn uống thêm một cốc nước đầy',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Cho uống nước khi đang nghẹt dị vật sẽ làm sặc tràn vào phổi!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Đưa tay vào sâu trong họng bạn móc dị vật ra',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Móc mù bằng tay có thể đẩy dị vật vào sâu hơn bít kín đường thở!',
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
      promptText: 'Sắp xếp đúng thứ tự các bước sơ cứu hóc dị vật đường thở cho trẻ em / người lớn:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 15,
      explanation: 'Quy trình: 1. Đứng sau đỡ ngực cúi người -> 2. Vỗ 5 cái vào lưng -> 3. Vòng tay ép bụng Heimlich.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. Đứng phía sau, một tay đỡ ngực nạn nhân và cho người hơi cúi ra trước',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Tư thế chuẩn bị!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. Dùng gót bàn tay vỗ mạnh 5 lần dứt khoát vào giữa 2 bả vai',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Vỗ lưng tống dị vật!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. Nếu chưa ra, vòng 2 tay qua eo ép bụng Heimlich theo hướng vào trong và lên trên',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Nghiệm pháp Heimlich!',
      },
    ],
  });

  // Stage 2: Sơ Cứu Chảy Máu Cam & Trầy Xước
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone4.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone4.id,
      stageNumber: 2,
      title: 'Xử Lý Chảy Máu Cam & Chăm Sóc Vết Thương',
      description: 'Tư thế cúi nhẹ đầu cầm máu mũi và sát trùng vết thương đúng chuẩn.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Tư Thế Cầm Máu Cam Chuẩn Y Khoa',
      description: 'Chấm dứt sai lầm ngửa cổ ra sau khi bị chảy máu cam.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Băng Gạc Vàng',
      contentJson: JSON.stringify({
        story: 'Milo nhắc nhở: "Khi chảy máu cam: Ngồi thẳng lưng, hơi cúi nhẹ đầu về phía trước và bóp chặt 2 cánh mũi trong 10 phút. Tuyệt đối KHÔNG NGỬA CỔ vì máu sẽ chảy ngược vào họng gây sặc nôn mửa!"',
        coreRule: 'Chảy máu cam: Ngồi thẳng, cúi nhẹ đầu, bóp cánh mũi 10 phút, thở bằng miệng.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Cầm Máu Cam & Sát Trùng Vết Cắt',
      description: 'Cầm máu đúng cách để nhận Mảnh Băng Gạc Vàng.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Băng Gạc Vàng',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Khi bị chảy máu cam (chảy máu mũi), tư thế đầu đúng y khoa nhất là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 7,
      explanation: 'Ngồi thẳng lưng, cúi nhẹ đầu về trước và bóp chặt hai cánh mũi trong 10 phút giúp máu đông lại mà không chảy vào đường thở.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Ngồi thẳng lưng, hơi CÚI NHẸ ĐẦU về phía trước và dùng tay bóp chặt hai cánh mũi trong 10 phút',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Cúi nhẹ đầu giúp máu không chảy ngược vào khí quản hay dạ dày!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Ngửa cổ thật cao ra phía sau và nằm thẳng xuống đất',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Sai lầm nguy hiểm! Ngửa cổ làm máu chảy ngược vào họng gây sặc và nôn mửa!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Nhét thật nhiều giấy ăn khô vào trong lỗ mũi',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Giấy ăn khô có thể làm xước thêm niêm mạc và gây nhiễm trùng!',
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
      promptText: 'Khi ngón tay bị trầy xước nhẹ do ngã xe đạp, bước sơ cứu đầu tiên cần làm là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Rửa sạch bụi bẩn dưới vòi nước chảy với xà phòng nhẹ, thấm khô và dán băng cá nhân tiệt trùng.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Rửa sạch vết thương dưới vòi nước sạch chảy nhẹ, thấm khô rồi dán băng cá nhân tiệt trùng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Rửa sạch bằng nước sạch giúp loại bỏ vi khuẩn và bụi đất!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Rắc bột thuốc kháng sinh hoặc lá cây dại vò nát lên',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Đắp lá dại bẩn có thể gây nhiễm trùng uốn ván chết người!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Bỏ mặc không cần rửa vết thương',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Bụi bẩn bám lại sẽ làm vết thương mưng mủ nhiễm trùng!',
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
      promptText: 'Nếu vết cắt lớn chảy máu nhiều không ngừng, cách xử lý khẩn cấp là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Dùng một miếng gạc hoặc khăn sạch ép chặt trực tiếp lên vết thương (áp lực trực tiếp) và đưa ngay tới trạm y tế.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Dùng gạc hoặc khăn sạch ép chặt trực tiếp lên vết thương và nhờ người lớn đưa đến cơ sở y tế',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Ép chặt trực tiếp là nguyên tắc vàng để cầm máu vết thương lớn!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Rửa liên tục dưới vòi nước mạnh',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Xả nước mạnh làm trôi cục máu đông và máu sẽ chảy nhiều hơn!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Để tay thõng xuống dưới cho máu chảy hết',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Hạ thấp tay làm áp lực máu tăng khiến mất máu nhanh hơn!',
      },
    ],
  });
}
