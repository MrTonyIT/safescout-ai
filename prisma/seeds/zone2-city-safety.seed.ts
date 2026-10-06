import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone2(prisma: PrismaClient) {
  console.log('🏙️ Đang nạp dữ liệu Vùng 2: Thành Phố Nhộn Nhịp...');

  const zone2 = await prisma.zone.upsert({
    where: { zoneNumber: 2 },
    update: {
      title: 'Vùng 2: Thành Phố Nhộn Nhịp',
      description: 'Quy tắc an toàn trước người lạ (Stranger Danger), bảo vệ vùng riêng tư PANTS và mật mã an toàn gia đình.',
      iconName: 'traffic-light',
      themeColor: '#E76F51',
      unlockLevel: 2,
    },
    create: {
      zoneNumber: 2,
      title: 'Vùng 2: Thành Phố Nhộn Nhịp',
      description: 'Quy tắc an toàn trước người lạ (Stranger Danger), bảo vệ vùng riêng tư PANTS và mật mã an toàn gia đình.',
      iconName: 'traffic-light',
      themeColor: '#E76F51',
      unlockLevel: 2,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_2' },
    update: {},
    create: {
      zoneId: zone2.id,
      name: 'Huy Hiệu Vệ Binh Thành Phố',
      code: 'BADGE_ZONE_2',
      description: 'Trao cho hiệp sĩ nhí thuần thục quy tắc No-Go-Yell-Tell và bảo vệ cơ thể an toàn.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/city_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: No-Go-Yell-Tell & Mật Mã Gia Đình
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone2.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone2.id,
      stageNumber: 1,
      title: 'Phòng Tuyến Người Lạ & Mật Mã An Toàn',
      description: 'Kỹ năng từ chối cám dỗ và nhận diện kẻ xấu giả danh người quen.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Quy Tắc NO - GO - YELL - TELL & Mật Mã Gia Đình',
      description: '4 bước phản xạ thép khi người lạ tiếp cận và chìa khóa mật mã Safe Word.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Khóa An Toàn',
      contentJson: JSON.stringify({
        story: 'Milo cảnh báo: "Người xấu không mang biển tên! Họ có thể cho kẹo ngọt, đồ chơi hoặc bảo ba mẹ nhờ đón. Hãy luôn hỏi MẬT MÃ GIA ĐÌNH và hét to NO-GO-YELL-TELL!"',
        coreRule: '1. Không nhận quà người lạ. 2. Không đi theo nếu không có Mật mã an toàn của ba mẹ.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách Phản Xạ: Cạm Bẫy Người Lạ',
      description: 'Phản xạ chính xác trước các chiêu trò dụ dỗ để nhận Mảnh Khóa An Toàn.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Khóa An Toàn',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Một người lạ dừng xe lại, đưa gói kẹo lớn và nói: "Lên xe chú chở về với mẹ nhé!". Bé phản xạ thế nào?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Quy tắc No-Go-Yell-Tell: Hét to KHÔNG, lùi xa xe và chạy ngay về phía người lớn tin cậy!',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Hét to "KHÔNG ĐƯỢC!", lùi xa xe ít nhất 3 bước và chạy nhanh về nơi đông người',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt đỉnh! Phản xạ hét KHÔNG và chạy lùi xa là chuẩn xác nhất!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Lại gần nhận kẹo rồi mới bảo không lên xe',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nguy hiểm! Lại gần sẽ tạo cơ hội cho kẻ xấu lôi kéo bé!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Lên xe vì chú ấy nói quen biết mẹ',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Kẻ xấu thường nói dối là bạn của bố mẹ!',
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
      promptText: 'Ý nghĩa của "Mật Mã An Toàn Gia Đình (Family Safe Word)" là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Mật mã gia đình là từ khóa bí mật giữa bé và ba mẹ. Bất kỳ ai đón hộ không đọc được từ này đều là giả mạo.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Một từ bí mật chỉ bé và ba mẹ biết, người đón thay không đọc đúng thì tuyệt đối không đi cùng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác! Mật mã gia đình là tấm khiên chống kẻ mạo danh!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Tên trường học hoặc lớp học của bé',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Tên trường học rất dễ bị người lạ tìm hiểu được!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Món ăn mà bé yêu thích nhất',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Món ăn yêu thích không phải là mật khẩu bảo mật gia đình!',
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
      promptText: 'Sắp xếp đúng thứ tự 4 bước phản xạ trong quy tắc an toàn "NO - GO - YELL - TELL":',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: 'Thứ tự chuẩn: 1. NO (Hét không) -> 2. GO (Chạy đi) -> 3. YELL (Hô hoán) -> 4. TELL (Kể lại).',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. NO: Hét to "KHÔNG ĐƯỢC" từ chối dứt khoát',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Hét KHÔNG!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. GO: Chạy thật nhanh rời xa người lạ',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Chạy ngay!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. YELL: Hô hoán thật to để mọi người xung quanh chú ý',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Hô cứu!',
      },
      {
        testQuestionId: q3.id,
        optionText: '4. TELL: Kể lại ngay cho ba mẹ hoặc thầy cô giáo',
        isCorrect: true,
        displayOrder: 4,
        feedbackSpeech: 'Bước 4: Kể ba mẹ!',
      },
    ],
  });

  // Stage 2: Quy Tắc Đồ Lót PANTS & Người Lạ An Toàn
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone2.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone2.id,
      stageNumber: 2,
      title: 'Bảo Vệ Cơ Thể PANTS & Người Lạ An Toàn',
      description: 'Quy tắc đồ lót quốc tế và nhận biết những người lạ có thể tin cậy khi đi lạc.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Quy Tắc Đồ Lót PANTS & Tìm Kiếm Trợ Giúp',
      description: 'Cơ thể là của bé, không ai được phép xâm phạm vùng riêng tư.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Huy Hiệu Tự Chủ',
      contentJson: JSON.stringify({
        story: 'Milo dặn dò: "Vùng đồ lót che kín là lãnh thổ bất khả xâm phạm của bé. Nếu ai đòi xem hay chạm vào, hãy nói KHÔNG và báo ngay ba mẹ. Không có bí mật xấu nào phải giấu cả!"',
        coreRule: 'Quy tắc PANTS: Vùng đồ lót là của riêng bé. Khi lạc, tìm Chú Công An, Thu Ngân mặc đồng phục hoặc Cô chú bế em bé.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Người Lạ An Toàn & Vùng Riêng Tư',
      description: 'Làm chủ quy tắc PANTS để nhận Mảnh Huy Hiệu Tự Chủ.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Huy Hiệu Tự Chủ',
    },
  });

  // Question 1: SINGLE_CHOICE
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Theo quy tắc đồ lót PANTS, những vùng cơ thể được che bởi đồ bơi/đồ lót thì ai được phép chạm vào?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Vùng đồ lót là của riêng bé. Chỉ ba mẹ khi giúp vệ sinh hoặc bác sĩ khám bệnh khi có ba mẹ bên cạnh mới được phép.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Chỉ có chính bé, hoặc ba mẹ/bác sĩ khi tắm rửa hoặc khám bệnh có ba mẹ ở bên',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Cơ thể là của riêng bé và không ai được chạm vào tùy tiện!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Bất kỳ người lớn nào nếu họ cho bé đồ chơi đẹp',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Tuyệt đối không! Quà tặng không bao giờ đổi lấy quyền chạm vào cơ thể!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Bất kỳ ai nếu họ bảo đó là một trò chơi bí mật',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Không bao giờ tham gia trò chơi chạm vào vùng kín bí mật!',
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
      promptText: 'Nếu bị lạc trong siêu thị hoặc công viên, bé nên tìm nhóm "Người Lạ An Toàn" nào để nhờ giúp đỡ?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Người lạ an toàn gồm: Chú công an, bảo vệ, nhân viên thu ngân có bảng tên đồng phục hoặc một người mẹ đang dắt con nhỏ.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Chú công an, chú bảo vệ, cô thu ngân có bảng tên hoặc một người mẹ đang dắt con nhỏ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Đây là những người lạ an toàn nhất để bé nhờ gọi điện cho ba mẹ!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Một người lạ đi một mình ở góc vắng vẻ',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Không nên lại gần góc vắng vẻ!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Tự ý đi bộ ra ngoài đường lớn tìm đường về nhà',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đi ra đường lớn xe cộ rất nguy hiểm và dễ bị lạc xa hơn!',
      },
    ],
  });

  // Question 3: TIMED_REFLEX (7s)
  const q2_3 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 3 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 3,
      promptText: 'Nếu có ai đó yêu cầu bé phải giữ "bí mật xấu" về việc họ chạm vào người bé, phản xạ đúng là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Không bao giờ giữ bí mật làm bé cảm thấy khó chịu. Hãy nói ngay với ba mẹ hoặc người lớn tin cậy!',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Tuyệt đối không giữ bí mật, kể lại ngay lập tức cho ba mẹ hoặc thầy cô giáo',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất dũng cảm! Bé nói ra là việc làm đúng đắn và an toàn nhất!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Giữ bí mật vì sợ bị người đó mắng phạt',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Đừng sợ hãi! Ba mẹ luôn ở bên cạnh để bảo vệ bé!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Chỉ giữ bí mật nếu người đó hứa mua đồ chơi cho mình',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Không bao giờ giữ bí mật nguy hiểm dù có bất kỳ điều kiện gì!',
      },
    ],
  });
}
