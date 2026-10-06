import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone7(prisma: PrismaClient) {
  console.log('🚌 Đang nạp dữ liệu Vùng 7: Chuyến Xe & Trường Học...');

  const zone7 = await prisma.zone.upsert({
    where: { zoneNumber: 7 },
    update: {
      title: 'Vùng 7: Chuyến Xe & Trường Học',
      description: 'An toàn giao thông trường học: kỹ năng sống sót khi bị bỏ quên trên xe bus và nhận diện điểm mù xe tải lớn.',
      iconName: 'bus',
      themeColor: '#38B000',
      unlockLevel: 4,
    },
    create: {
      zoneNumber: 7,
      title: 'Vùng 7: Chuyến Xe & Trường Học',
      description: 'An toàn giao thông trường học: kỹ năng sống sót khi bị bỏ quên trên xe bus và nhận diện điểm mù xe tải lớn.',
      iconName: 'bus',
      themeColor: '#38B000',
      unlockLevel: 4,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_7' },
    update: {},
    create: {
      zoneId: zone7.id,
      name: 'Huy Hiệu Hoa Tiêu Xe Buýt',
      code: 'BADGE_ZONE_7',
      description: 'Vinh danh nhà thám hiểm am hiểu kỹ năng thoát hiểm xe đưa đón và an toàn giao thông học đường.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/bus_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Thoát Hiểm Xe Bus Kín
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone7.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone7.id,
      stageNumber: 1,
      title: 'Kỹ Năng Sống Sót Khi Bị Bỏ Quên Trên Xe Bus',
      description: 'Kích hoạt còi vô lăng xe, bật đèn tam giác khẩn cấp và dùng búa cứu nạn.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Bấm Còi Vô Lăng & Bật Đèn Khẩn Cấp Xe Bus',
      description: 'Bí kíp tạo sự chú ý khi bị kẹt một mình trong xe đưa đón học sinh.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Vô Lăng Cứu Hộ',
      contentJson: JSON.stringify({
        story: 'Milo dặn dò: "Nếu ngủ quên trên xe bus và bị nhốt: Hãy bình tĩnh leo lên ghế lái! Còi ở giữa vô lăng LUÔN KÊU dù xe đã tắt máy. Hãy đè cả người lên bấm còi liên tục và bấm nút tam giác đỏ bật đèn khẩn cấp!"',
        coreRule: 'Bị nhốt trên xe bus: 1. Bấm còi vô lăng liên tục. 2. Bật nút tam giác đèn khẩn cấp. 3. Vẫy áo trước kính lái.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Thoát Hiểm Xe Bus Kín',
      description: 'Phản xạ bấm còi và báo động khẩn cấp để nhận Mảnh Vô Lăng Cứu Hộ.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Vô Lăng Cứu Hộ',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Nếu thức dậy thấy mình bị nhốt một mình trên xe bus đưa đón đóng kín cửa, hành động ĐẦU TIÊN là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Còi xe ở vô lăng nối trực tiếp với ắc quy nên luôn hoạt động kể cả khi xe đã tắt máy rút chìa khóa.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Trèo lên ghế lái tài xế, dùng hai tay hoặc tì cả người lên chính giữa vô lăng bấm còi xe liên tục không ngừng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Còi xe bus luôn kêu để báo động cho mọi người xung quanh đến cứu!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Ngồi khóc ở hàng ghế cuối cùng chờ tài xế quay lại đón',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Xe đóng kín dưới trời nắng sẽ gây sốc nhiệt ngạt thở rất nhanh!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Cố gắng chui xuống gầm ghế nằm trốn',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Trốn dưới gầm ghế làm người ngoài không thể nhìn thấy bé!',
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
      promptText: 'Nút bấm có hình TAM GIÁC MÀU ĐỎ trên bảng điều khiển xe ô tô / xe bus có chức năng gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Nút tam giác đỏ là nút bật đèn khẩn cấp (Hazard lights) làm chớp sáng cả 4 góc xe để người đi đường chú ý tới chiếc xe đang gặp sự cố.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Bật đèn cảnh báo khẩn cấp (Hazard lights) nhấp nháy 4 góc xe để người đi đường chú ý cứu hộ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Đèn khẩn cấp là tín hiệu cầu cứu trực quan từ xa!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Bật máy nghe nhạc thiếu nhi trên xe',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nút tam giác đỏ không phải là nút mở nhạc!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Phun nước rửa kính xe',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Nút tam giác đỏ là nút khẩn cấp cứu nạn!',
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
      promptText: 'Sắp xếp đúng thứ tự các bước thoát hiểm khi bị bỏ quên trong xe đưa đón:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. Di chuyển lên ghế lái -> 2. Bấm còi và bật nút tam giác đỏ -> 3. Vẫy áo ra hiệu qua kính lái.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. Di chuyển ngay lên hàng ghế lái của bác tài xế phía trước xe',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Lên ghế lái!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. Nhấn còi xe liên tục và bấm nút tam giác đỏ bật đèn khẩn cấp',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Bấm còi & bật đèn!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. Cầm áo màu sáng vẫy mạnh liên tục qua kính lái phía trước để người ngoài nhìn thấy',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Vẫy áo ra hiệu!',
      },
    ],
  });

  // Stage 2: Điểm Mù Xe Tải & Qua Đường
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone7.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone7.id,
      stageNumber: 2,
      title: 'Tử Địa Điểm Mù Xe Tải Lớn & Qua Đường An Toàn',
      description: 'Nhận diện vùng tài xế không nhìn thấy và quy tắc qua đường giơ cao tay.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Tránh Xa Điểm Mù Xe Container & Qua Đường Đúng Chuẩn',
      description: 'Nếu không thấy mặt tài xế trong gương, tài xế cũng không thấy bé.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Kính Chiếu Hậu Vàng',
      contentJson: JSON.stringify({
        story: 'Milo chỉ vào chiếc xe tải khổng lồ: "QUY TẮC GƯƠNG CHIẾU HẬU: Nếu bé không nhìn thấy mắt bác tài xế trong gương, bác ấy hoàn toàn KHÔNG THỂ NHÌN THẤY BÉ! Tuyệt đối không đứng sát đầu xe, hông xe hay đuôi xe tải!"',
        coreRule: '1. Điểm mù xe tải: Cách xa ít nhất 5 mét. 2. Qua đường: Nhìn trái - phải - trái và giơ cao tay.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Tránh Xa Điểm Mù Xe Lớn',
      description: 'Nhận diện điểm mù giao thông để nhận Mảnh Kính Chiếu Hậu Vàng.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Kính Chiếu Hậu Vàng',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Quy tắc vàng để nhận biết mình có đang đứng trong "Điểm mù tử thần" của xe tải lớn hay không là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Nếu bạn không thể nhìn thấy khuôn mặt tài xế qua gương chiếu hậu của xe, thì tài xế cũng hoàn toàn mù tầm nhìn và không thể thấy bạn.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Nếu bé không nhìn thấy mặt bác tài xế qua gương chiếu hậu, thì bác tài xế cũng KHÔNG THỂ NHÌN THẤY BÉ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Hãy lập tức lùi xa ra khỏi khu vực xe tải đang đỗ hoặc rẽ!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Xe tải to và cao nên bác tài luôn nhìn thấy mọi thứ xung quanh',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Sai lầm chết người! Xe càng cao thì vùng điểm mù sát thân xe càng rộng!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Chỉ cần đứng im sát bánh xe sau là an toàn',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đứng sát bánh xe khi xe chuyển bánh sẽ bị cuốn vào gầm rất nguy hiểm!',
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
      promptText: 'Khi đi bộ qua đường ở ngã tư, hành động nào là ĐÚNG QUY TẮC AN TOÀN NHẤT?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Đi trên vạch kẻ đường cho người đi bộ, quan sát trái - phải - trái và giơ cao tay để các phương tiện nhìn thấy từ xa.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Đi trên vạch ngựa vằn, dừng lại quan sát Trái - Phải - Trái và giơ cao một tay ra hiệu xin đường',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Giơ cao tay giúp các xe từ xa nhìn thấy bé rõ ràng!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Vừa cắm đầu chạy thật nhanh sang đường vừa nhìn điện thoại',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Chạy ẩu làm tài xế không kịp phanh!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Băng qua đường ở ngay phía sau đuôi một chiếc xe buýt đang đỗ',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Băng sau đuôi xe buýt sẽ bị che khuất tầm nhìn của các xe vượt lên!',
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
      promptText: 'Khi được ba mẹ chở đi học bằng xe máy, quy tắc bảo vệ an toàn đầu là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Luôn đội mũ bảo hiểm đạt chuẩn vừa vặn kích cỡ đầu, cài quai chắc chắn (đút vừa 1-2 ngón tay) và ôm chặt eo người lớn.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Luôn đội mũ bảo hiểm đạt chuẩn vừa vặn đầu, cài quai chắc chắn và ôm chặt eo ba mẹ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Mũ bảo hiểm bảo vệ bộ não thông minh của bé!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Đội mũ lưỡi trai vải mềm là đủ',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Mũ vải không có khả năng chống va đập khi xảy ra tai nạn!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Đứng thẳng hai chân lên yên xe phía sau để ngắm cảnh',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đứng trên yên xe rất dễ bị ngã xuống đường khi xe phanh gấp!',
      },
    ],
  });
}
