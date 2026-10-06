import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone8(prisma: PrismaClient) {
  console.log('🏬 Đang nạp dữ liệu Vùng 8: Nơi Công Cộng & Cạm Bẫy Đô Thị...');

  const zone8 = await prisma.zone.upsert({
    where: { zoneNumber: 8 },
    update: {
      title: 'Vùng 8: Nơi Công Cộng & Cạm Bẫy Đô Thị',
      description: 'Sinh tồn nơi đông người: kỹ năng thoát đám đông hỗn loạn/giẫm đạp, tư thế Boxer và xử lý sự cố kẹt thang máy.',
      iconName: 'users-group',
      themeColor: '#F4A261',
      unlockLevel: 4,
    },
    create: {
      zoneNumber: 8,
      title: 'Vùng 8: Nơi Công Cộng & Cạm Bẫy Đô Thị',
      description: 'Sinh tồn nơi đông người: kỹ năng thoát đám đông hỗn loạn/giẫm đạp, tư thế Boxer và xử lý sự cố kẹt thang máy.',
      iconName: 'users-group',
      themeColor: '#F4A261',
      unlockLevel: 4,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_8' },
    update: {},
    create: {
      zoneId: zone8.id,
      name: 'Huy Hiệu Vệ Binh Đô Thị',
      code: 'BADGE_ZONE_8',
      description: 'Vinh danh nhà thám hiểm giữ vững bình tĩnh và thoát hiểm nơi đông người và thang máy đô thị.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/crowd_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Thoát Khỏi Đám Đông Giẫm Đạp
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone8.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone8.id,
      stageNumber: 1,
      title: 'Thoát Hiểm Đám Đông Chen Lấn & Giẫm Đạp',
      description: 'Tư thế tay thủ Boxer Stance bảo vệ lồng ngực và quy tắc không nhặt đồ rơi.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Tư Thế Boxer Stance & Di Chuyển Chéo Mép Đám Đông',
      description: 'Giữ không gian thở sống còn và tránh bị xô ngã giẫm đạp.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Giáp Đỡ Lồng Ngực',
      contentJson: JSON.stringify({
        story: 'Dòng người xô đẩy ầm ầm! Milo hô to: "TƯ THẾ BOXER: Co hai tay ngang ngực bảo vệ phổi! Di chuyển chéo theo dòng người ra rìa ngoài. Nếu rơi đồ, TUYỆT ĐỐI KHÔNG CÚI XUỐNG NHẶT! Nếu ngã: Cuộn tròn kiểu thai nhi ôm kín đầu gáy!"',
        coreRule: '1. Tay thủ Boxer trước ngực. 2. Không cúi nhặt đồ. 3. Nếu ngã: Nằm nghiêng cuộn tròn ôm đầu.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Đám Đông Nghẹt Thở',
      description: 'Thực hành tư thế thủ Boxer và di chuyển thoát hiểm để nhận Mảnh Giáp Đỡ Lồng Ngực.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Giáp Đỡ Lồng Ngực',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Khi bị kẹt trong đám đông lễ hội xô đẩy dữ dội, tư thế tay chuẩn để bảo vệ lồng ngực không bị ép ngạt thở là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Tư thế Boxer Stance (gập hai tay ngang ngực) tạo thành khung xương chữ nhật cứng cáp che chắn phổi và tim không bị ép nghẹt.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Tư thế Boxer Stance: Đưa 2 tay gập ngang ngực tạo khung chắn bảo vệ lồng ngực và lá phổi',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Khung tay Boxer tạo khoảng thở sống còn bảo vệ phổi!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Thõng hai tay xuôi sát đùi',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Tay xuôi theo người sẽ bị ép chặt vào thân và ép nghẹt thở!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Giơ thẳng hai tay lên trời',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Giơ hai tay lên cao làm mất thăng bằng và rất nhanh bị mỏi ngã!',
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
      promptText: 'Khi đang bị cuốn trôi trong dòng người chen lấn, nếu lỡ làm rơi điện thoại hoặc giày dép, bé PHẢI làm gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Tuyệt đối không cúi xuống nhặt đồ rơi. Trong đám đông, cúi xuống sẽ lập tức bị xô ngã và hàng trăm người giẫm đạp đè lên.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Tuyệt đối KHÔNG ĐƯỢC cúi xuống nhặt đồ! Tiếp tục đứng vững và di chuyển theo dòng người',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Tính mạng là quan trọng nhất, không bao giờ cúi xuống trong đám đông!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Ngồi thụp xuống sàn thật nhanh để nhặt lên',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Ngồi xuống sẽ lập tức bị dòng người xô ngã và giẫm đạp!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Hét to bắt tất cả mọi người dừng lại đứng yên',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đám đông hỗn loạn không thể dừng lại theo ý muốn của một cá nhân!',
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
      promptText: 'Sắp xếp đúng thứ tự các phản xạ sống sót khi bị kẹt trong đám đông hỗn loạn:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. Thủ tay Boxer bảo vệ ngực -> 2. Di chuyển chéo ra mép rìa -> 3. Nếu ngã nằm nghiêng cuộn tròn ôm đầu gáy.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. Gập hai tay ngang ngực bảo vệ lồng ngực và giữ thăng bằng đôi chân',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Thủ tay Boxer!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. Di chuyển theo đường chéo zíc zắc để dần dần dạt ra mép ngoài đám đông',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Di chuyển chéo ra rìa!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. Nếu bị ngã: Nằm nghiêng co tròn người kiểu thai nhi, hai tay đan chặt ôm bảo vệ đầu và gáy',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Cuộn tròn bảo vệ đầu nếu ngã!',
      },
    ],
  });

  // Stage 2: Kẹt Thang Máy & Thang Cuốn
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone8.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone8.id,
      stageNumber: 2,
      title: 'Bình Tĩnh Thoát Kẹt Thang Máy & An Toàn Thang Cuốn',
      description: 'Sử dụng nút chuông cứu hộ intercom và tránh kẹt giày vào mép thang cuốn.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Kỹ Năng Xử Lý Khi Thang Máy Mất Điện',
      description: 'Không cạy cửa, bấm chuông báo động và giữ bình tĩnh chờ kỹ thuật viên.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Chuông Cứu Nạn',
      contentJson: JSON.stringify({
        story: 'Thang máy bỗng dừng lại phụt tắt đèn! Milo nhắc: "Đừng hoảng sợ! Không khí trong thang máy LUÔN ĐẦY ĐỦ. Hãy bấm nút hình CHUÔNG VÀNG hoặc ĐIỆN THOẠI ĐỎ để gọi cứu hộ. Tuyệt đối KHÔNG cạy cửa thang máy!"',
        coreRule: '1. Bấm nút chuông báo động/intercom. 2. Không cạy cửa thang máy.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Kẹt Thang Máy Đô Thị',
      description: 'Xử lý sự cố thang máy bình tĩnh để nhận Mảnh Chuông Cứu Nạn.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Chuông Cứu Nạn',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Khi thang máy đột ngột dừng lại giữa các tầng, đèn tắt và cửa không mở, hành động ĐÚNG NHẤT là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 7,
      explanation: 'Bấm nút chuông báo động (hình chiếc chuông hoặc tai nghe điện thoại) trên bảng điều khiển để liên lạc với đội kỹ thuật tòa nhà.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Bấm nút CHUÔNG CỨU HỘ / INTERCOM màu vàng hoặc đỏ trên bảng điều khiển và bình tĩnh chờ hỗ trợ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Nút chuông intercom kết nối trực tiếp với phòng bảo vệ tòa nhà!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Dùng hết sức cạy mạnh cánh cửa thang máy ra',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Cạy cửa khi thang đang lơ lửng có thể rơi xuống hố thang!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Nhảy nhót thật mạnh bên trong cabin thang máy',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Nhảy nhót làm hệ thống phanh an toàn kích hoạt kẹt chặt hơn!',
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
      promptText: 'Khi đi thang cuốn tự động tại siêu thị, vị trí đứng an toàn là ở đâu?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Đứng vững ở chính giữa bậc thang, không để mũi giày/dép chạm vào mép hông thang cuốn và nắm tay vịn.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Đứng vững ở chính giữa bậc thang, giữ chân cách xa mép rãnh hai bên và nắm tay vịn chuyển động',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Đứng giữa bậc thang giúp dép cao su không bị cuốn vào khe kẹt!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Chèn mũi dép crocs/dép cao su sát vào khe chải lông hai bên hông thang',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Dép cao su rất dễ bị bánh răng thang cuốn hút kẹt gây đứt ngón chân!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Ngồi bệt xuống bậc thang cuốn',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Ngồi bệt làm quần áo dễ bị cuốn vào khe cuối thang!',
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
      promptText: 'Khi bị kẹt trong thang máy, bé có bị hết không khí ngạt thở không?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Thang máy được thiết kế có các khe thông gió tự nhiên liên tục với giếng thang, không khí không bao giờ bị hết.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Không bao giờ! Thang máy có hệ thống khe thông gió tự nhiên, luôn có đủ không khí để thở',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Bé hãy hoàn toàn yên tâm hít thở đều và bình tĩnh nhé!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Có, chỉ sau 2 phút là hết sạch không khí',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Sai! Thang máy không phải là hộp kín khí chân không!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Phải bịt mũi nín thở',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Hãy hít thở đều và bình tĩnh!',
      },
    ],
  });
}
