import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone6(prisma: PrismaClient) {
  console.log('🌊 Đang nạp dữ liệu Vùng 6: Vùng Nước Sâu...');

  const zone6 = await prisma.zone.upsert({
    where: { zoneNumber: 6 },
    update: {
      title: 'Vùng 6: Vùng Nước Sâu',
      description: 'An toàn sông nước: tư thế nổi ngửa sao biển, nguyên tắc cứu hộ Reach or Throw và thoát dòng chảy xa bờ Rip Current.',
      iconName: 'waves',
      themeColor: '#0077B6',
      unlockLevel: 2,
    },
    create: {
      zoneNumber: 6,
      title: 'Vùng 6: Vùng Nước Sâu',
      description: 'An toàn sông nước: tư thế nổi ngửa sao biển, nguyên tắc cứu hộ Reach or Throw và thoát dòng chảy xa bờ Rip Current.',
      iconName: 'waves',
      themeColor: '#0077B6',
      unlockLevel: 2,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_6' },
    update: {},
    create: {
      zoneId: zone6.id,
      name: 'Huy Hiệu Kình Ngư Cứu Nạn',
      code: 'BADGE_ZONE_6',
      description: 'Trao cho kình ngư nhí làm chủ kỹ năng sống sót sông nước và cứu hộ an toàn.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/water_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Nổi Sao Biển & Cứu Hộ Ném Phao
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone6.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone6.id,
      stageNumber: 1,
      title: 'Nổi Ngửa Sao Biển & Nguyên Tắc "Reach or Throw"',
      description: 'Tiết kiệm sức khi rơi xuống nước và cứu bạn mà không nguy hiểm tính mạng.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Kỹ Thuật Nổi Sao Biển & Reach or Throw, Don\'t Go',
      description: 'Tự nổi ngửa giữ đường thở và cứu hộ người ngã nước chuẩn quốc tế.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Phao Cứu Sinh',
      contentJson: JSON.stringify({
        story: 'Milo - chú rái cá cứu hộ bơi lội điêu luyện chia sẻ: "Khi kiệt sức dưới nước, hãy thả lỏng ngửa mặt như chú sao biển để tự nổi! Và khi thấy bạn chới với: REACH OR THROW, DON\'T GO! Dùng sào dài hoặc ném phao, tuyệt đối không nhảy xuống!"',
        coreRule: '1. Đuối sức: Nổi ngửa sao biển. 2. Cứu bạn: Nằm rạp chìa sào hoặc ném can phao, hô người lớn.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Nước Sâu Sống Sót',
      description: 'Làm chủ tư thế nổi sao biển và cứu hộ an toàn để nhận Mảnh Phao Cứu Sinh.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Phao Cứu Sinh',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Nếu đang ở vùng nước sâu mà bị chuột rút hoặc đuối sức không bơi tiếp được, tư thế sống còn là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Tư thế nổi sao biển (Starfish Float): Thả lỏng toàn thân, ngửa mặt lên trời, dang tay chân giúp phổi chứa khí đẩy cơ thể tự nổi tự nhiên.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Tư thế Nổi Sao Biển (Starfish Float): Thả lỏng người, ngửa mặt lên trời, dang rộng tay chân để cơ thể tự nổi',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Nổi sao biển giúp mũi miệng trên mặt nước và tiết kiệm sức!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Cố đập hai tay thật mạnh xuống nước và vùng vẫy hét lớn',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Vùng vẫy làm sặc nước và chìm nhanh hơn!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Cố lặn sâu xuống đáy hồ lấy đà bật nhảy lên',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Lặn sâu ở nước sâu sẽ làm hết hơi và không ngoi lên được!',
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
      promptText: 'Theo nguyên tắc "Reach or Throw, Don\'t Go", khi thấy bạn đang chới với dưới ao sâu, hành động đúng là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Người đang đuối nước trong cơn hoảng loạn sẽ bám chặt và dìm bất kỳ ai nhảy xuống. Trẻ em phải nằm rạp chìa sào hoặc ném vật nổi và gọi người lớn.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'KHÔNG nhảy xuống! Nằm rạp người chìa cành cây/sào dài hoặc ném can nhựa/phao và hô to người lớn',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Tuyệt đối không nhảy xuống nước mà hãy dùng sào hoặc ném phao!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Nhảy ngay xuống nước để bơi lại ôm bạn kéo vào',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm chết người! Bản năng hoảng loạn của bạn sẽ ôm chặt dìm bé chìm cùng!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Đứng nhìn và quay video lại',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Mỗi giây đều quý giá, phải lập tức hô to và tìm sào/phao cứu bạn!',
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
      promptText: 'Sắp xếp đúng quy trình 3 bước cứu bạn đuối nước an toàn từ trên bờ:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. Hô hoán cầu cứu -> 2. Chìa sào / Ném phao -> 3. Kéo từ từ vào bờ khi bạn đã bám chắc.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. HÔ HOÁN: Hét to "CÓ NGƯỜI ĐUỐI NƯỚC" để gọi người lớn và cứu hộ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Hô hoán báo động!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. NÉM VẬT NỔI: Nằm rạp người chìa cành cây hoặc ném can nhựa/phao cứu sinh',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Chìa sào / Ném phao!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. KÉO AN TOÀN: Khi bạn đã bám chắc, kéo từ từ bạn vào sát mép bờ',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Kéo vào bờ!',
      },
    ],
  });

  // Stage 2: Dòng Chảy Xa Bờ (Rip Current)
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone6.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone6.id,
      stageNumber: 2,
      title: 'Bí Kíp Thoát Dòng Chảy Xa Bờ (Rip Current)',
      description: 'Nhận biết cái bẫy sóng phẳng lặng và kỹ thuật bơi song song bờ biển.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Thoát Hiểm Khỏi Dòng Chảy Xa Bờ (Rip Current)',
      description: 'Không bơi ngược dòng và nhận diện vùng nước biển phẳng lặng nguy hiểm.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh La Bàn Đại Dương',
      contentJson: JSON.stringify({
        story: 'Milo chỉ ra biển: "Vùng nước phẳng lặng không có sóng trắng xóa giữa bãi biển có thể là DÒNG CHẢY XA BỜ (Rip Current) cuốn người ra khơi! Nếu bị cuốn vào: Tuyệt đối KHÔNG bơi ngược dòng, hãy bơi ngang SONG SONG VỚI BỜ BIỂN để thoát ra!"',
        coreRule: 'Rip Current: Bơi ngang song song bờ biển thoát khỏi luồng nước rồi mới bơi vào bờ.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Thoát Khỏi Dòng Chảy Xa Bờ',
      description: 'Làm chủ kỹ thuật bơi song song bờ để nhận Mảnh La Bàn Đại Dương.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh La Bàn Đại Dương',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Nếu đang tắm biển mà bị cuốn vào dòng chảy xa bờ (Rip Current) kéo trôi ra biển, cách bơi thoát hiểm là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Không cố bơi ngược dòng vì dòng chảy rất mạnh làm kiệt sức. Hãy bơi ngang song song bờ biển để thoát khỏi phễu hút rồi mới bơi vào bờ.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Bình tĩnh, KHÔNG bơi ngược dòng, bơi ngang SONG SONG VỚI BỜ BIỂN để thoát khỏi dòng chảy',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Bơi song song bờ giúp thoát khỏi luồng nước chảy xiết ra khơi!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Dốc hết toàn bộ sức lực bơi ngược thẳng vào bờ đấu lại dòng nước',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Dòng chảy xa bờ rất mạnh sẽ làm bé kiệt sức chìm!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Lặn sâu xuống nước bơi men theo đáy biển',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Lặn sâu khiến bé mất phương hướng và nhanh hết oxy!',
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
      promptText: 'Đặc điểm nhận diện dòng chảy xa bờ (Rip Current) nguy hiểm trên bãi biển là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Vùng nước phẳng lặng có màu sẫm hơn, không có sóng bạc đầu vỡ, có bọt nước và rong rêu trôi nhanh ngược ra khơi.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Vùng nước phẳng lặng ngắt quãng giữa các đợt sóng bạc đầu, màu nước sẫm hơn và có bọt trôi ra khơi',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Đừng để vẻ phẳng lặng của dòng chảy xa bờ đánh lừa nhé!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Nơi có sóng trắng xóa to nhất vỗ vào bờ',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nơi sóng vỡ bạc đầu thường đẩy nước vào bờ, ít nguy hiểm hơn dòng chảy phẳng lặng!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Nơi có nhiều vỏ ốc đẹp trên bờ cát',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Vỏ ốc không phản ánh dòng chảy ngầm nguy hiểm!',
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
      promptText: 'Quy tắc an toàn số 1 bắt buộc khi đi thuyền bè, ca nô hoặc chơi cano nước là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Phải luôn mặc áo phao cứu hộ cài khóa chắc chắn vừa vặn cơ thể trong suốt hành trình.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Phải mặc áo phao cứu hộ cài khóa chắc chắn vừa vặn cơ thể trong suốt toàn bộ chuyến đi',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Áo phao là lá bùa hộ mệnh trên sông nước!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Chỉ cần cầm áo phao trên tay là được',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Khi xảy ra sự cố va chạm bất ngờ, bé sẽ không kịp mặc áo phao!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Người biết bơi giỏi thì không cần mặc áo phao',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Dù bơi giỏi đến đâu cũng có thể bị choáng ngất khi rơi xuống nước!',
      },
    ],
  });
}
