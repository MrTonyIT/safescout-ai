import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone10(prisma: PrismaClient) {
  console.log('🚨 Đang nạp dữ liệu Vùng 10: Tổng Hành Dinh Cứu Hộ Khẩn Cấp...');

  const zone10 = await prisma.zone.upsert({
    where: { zoneNumber: 10 },
    update: {
      title: 'Vùng 10: Tổng Hành Dinh Cứu Hộ Khẩn Cấp',
      description: 'Tổng hành dinh sinh tồn: 4 số cứu nạn quốc gia (111, 113, 114, 115), kỹ năng khai báo khẩn và mật mã SOS đèn pin.',
      iconName: 'trophy-star',
      themeColor: '#1D3557',
      unlockLevel: 6,
    },
    create: {
      zoneNumber: 10,
      title: 'Vùng 10: Tổng Hành Dinh Cứu Hộ Khẩn Cấp',
      description: 'Tổng hành dinh sinh tồn: 4 số cứu nạn quốc gia (111, 113, 114, 115), kỹ năng khai báo khẩn và mật mã SOS đèn pin.',
      iconName: 'trophy-star',
      themeColor: '#1D3557',
      unlockLevel: 6,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_10' },
    update: {},
    create: {
      zoneId: zone10.id,
      name: 'Huy Hiệu Đại Sứ Cứu Hộ Tối Thượng',
      code: 'BADGE_ZONE_10',
      description: 'Vinh danh nhà thám hiểm xuất sắc nhất hoàn thành trọn vẹn 10 Vùng Đất Sinh Tồn sánh vai cùng Đội Trưởng Milo.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/master_rescue_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: 4 Số Cứu Nạn Quốc Gia & Khai Báo 3 Bước
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone10.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone10.id,
      stageNumber: 1,
      title: 'Bộ Tứ Số Cứu Nạn Quốc Gia & Khai Báo Khẩn Cấp',
      description: 'Ghi nhớ 111 - 113 - 114 - 115 và 3 thông tin sống còn khi gọi tổng đài.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Bí Kíp 4 Số Cứu Nạn & 3 Thông Tin Vàng',
      description: '111 (Trẻ em), 113 (Công an), 114 (Cứu hỏa), 115 (Cấp cứu y tế).',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 200,
      badgeShardName: 'Mảnh Phù Hiệu Tổng Đài',
      contentJson: JSON.stringify({
        story: 'Milo giơ 4 ngón tay: "GHI NHỚ 4 SỐ CỨU MẠNG: 111 là Bảo vệ trẻ em, 113 là Chú Công An, 114 là Lính Cứu Hỏa và 115 là Bác Sĩ Cấp Cứu! Khi gọi, hãy nói rõ: 1. ĐỊA CHỈ, 2. CHUYỆN GÌ ĐANG XẢY RA, và 3. CÓ BAO NHIÊU NGƯỜI BỊ THƯƠNG!"',
        coreRule: '111 (Trẻ em) | 113 (Công an) | 114 (Cứu hỏa) | 115 (Cấp cứu). Gọi miễn phí cước.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Tổng Đài Cứu Hộ Quốc Gia',
      description: 'Ghi nhớ chính xác các số cứu nạn để nhận Mảnh Phù Hiệu Tổng Đài.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Phù Hiệu Tổng Đài',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Khi phát hiện đám cháy lớn bùng lên, số điện thoại khẩn cấp gọi Cảnh Sát Cứu Hỏa & Cứu Nạn là số mấy?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Số 114 là đầu số khẩn cấp quốc gia gọi Cảnh sát Phòng cháy chữa cháy và Cứu nạn cứu hộ.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Số 114 (Cứu hỏa & Cứu nạn khẩn cấp)',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! 114 là số gọi lính cứu hỏa dập lửa cứu người!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Số 115',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: '115 là số cấp cứu y tế bệnh viện!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Số 113',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: '113 là số công an can thiệp trật tự an ninh!',
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
      promptText: 'Tổng đài Quốc Gia Bảo Vệ Trẻ Em (tư vấn tâm lý, bảo vệ trẻ em khỏi bạo hành, xâm hại) là số nào?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Tổng đài 111 là đường dây nóng quốc gia miễn phí hoạt động 24/7 chuyên bảo vệ quyền lợi và an toàn của trẻ em Việt Nam.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Số 111 (Tổng đài Quốc gia Bảo vệ Trẻ em Việt Nam)',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! 111 là số điện thoại bảo vệ mọi trẻ em 24/7!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Số 119',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: '119 không phải là số bảo vệ trẻ em!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Số 1080',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: '1080 là tổng đài tra cứu thông tin dịch vụ!',
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
      promptText: 'Sắp xếp đúng 3 thông tin quan trọng nhất phải nói khi gọi đến tổng đài cứu nạn:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. ĐỊA CHỈ CHÍNH XÁC -> 2. TÌNH HUỐNG NGUY CẤP -> 3. SỐ LƯỢNG NGƯỜI BỊ THƯƠNG.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. ĐỊA CHỈ: Nói rõ số nhà, tên đường, phường/xã nơi sự việc đang diễn ra',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Địa chỉ chính xác!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. TÌNH HUỐNG: Miêu tả ngắn gọn chuyện gì đang xảy ra (cháy, ngất xỉu, tai nạn)',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Nêu sự cố!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. SỐ NGƯỜI: Cho biết có bao nhiêu người đang bị kẹt hoặc cần cấp cứu',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Số lượng người!',
      },
    ],
  });

  // Stage 2: Mật Mã SOS Đèn Pin & Còi Cứu Hộ
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone10.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone10.id,
      stageNumber: 2,
      title: 'Mật Mã Tín Hiệu SOS Quốc Tế & Vinh Danh',
      description: 'Phát tín hiệu SOS bằng đèn pin/còi: 3 Ngắn - 3 Dài - 3 Ngắn.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Mật Mã SOS Quốc Tế: 3 Ngắn - 3 Dài - 3 Ngắn',
      description: 'Ngôn ngữ cứu hộ toàn cầu trên đất liền, trên biển và trong đêm tối.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 250,
      badgeShardName: 'Mảnh Sao Lượng Tử Tối Thượng',
      contentJson: JSON.stringify({
        story: 'Milo bật đèn pin lượng tử trên mũ nhấp nháy: "TÍN HIỆU SOS QUỐC TẾ: 3 chớp ngắn (Tích-Tích-Tích), 3 chớp dài (Te-Te-Te), 3 chớp ngắn (Tích-Tích-Tích)! Đây là mật mã cứu nạn duy nhất mọi lực lượng trên thế giới đều hiểu!"',
        coreRule: 'Mật mã SOS: 3 Ngắn - 3 Dài - 3 Ngắn ( ... --- ... ). Lặp lại sau mỗi khoảng nghỉ 1 giây.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Đội Trưởng Cứu Hộ Tối Thượng',
      description: 'Vượt qua bài test mật mã SOS để nhận Mảnh Sao Lượng Tử Tối Thượng.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Sao Lượng Tử Tối Thượng',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Mật mã phát tín hiệu cứu nạn quốc tế SOS bằng đèn pin hoặc tiếng còi có nhịp điệu chuẩn là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Mật mã Morse chuẩn cho chữ SOS là 3 Ngắn - 3 Dài - 3 Ngắn ( ... --- ... ).',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: '3 NHỊP NGẮN - 3 NHỊP DÀI - 3 NHỊP NGẮN ( ... --- ... ) lặp lại liên tục',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! 3 Ngắn - 3 Dài - 3 Ngắn là mật mã SOS quốc tế duy nhất!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Chớp đèn liên tục thật nhanh không ngừng nghỉ',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Chớp không theo nhịp sẽ bị nhầm lẫn với đèn hỏng chập mạch!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: '1 nhịp dài duy nhất kéo dài 1 tiếng',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: '1 nhịp dài không phải là mật mã SOS chuẩn!',
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
      promptText: 'Khi gọi điện thoại tới các đầu số cứu nạn khẩn cấp 111, 113, 114, 115 có bị mất phí tiền cước không?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Tất cả các cuộc gọi tới các số cứu nạn khẩn cấp quốc gia đều hoàn toàn MIỄN PHÍ cước viễn thông, kể cả khi điện thoại hết tiền hoặc không có SIM.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Hoàn toàn MIỄN PHÍ, điện thoại hết tiền vẫn kết nối cứu hộ được bình thường',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Các đầu số cứu hộ quốc gia luôn mở và miễn phí cho người dân!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Mất phí rất nhiều tiền',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cuộc gọi cứu nạn quốc gia không bao giờ tính phí cước!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Chỉ gọi được nếu nạp tiền trả trước trên 50.000đ',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Tài khoản 0 đồng vẫn bấm gọi 111, 113, 114, 115 thoải mái!',
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
      promptText: 'Khi nào bé được phép bấm gọi các số cứu nạn 111, 113, 114, 115?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Chỉ gọi khi có tình huống nguy hiểm khẩn cấp thực sự. Gọi trêu đùa sẽ làm nghẽn đường dây cứu người khác và bị pháp luật xử phạt nghiêm khắc.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Chỉ gọi khi có tình huống nguy hiểm khẩn cấp thực sự, tuyệt đối không bao giờ gọi trêu đùa',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Đường dây cứu nạn chỉ dành cho các tình huống khẩn cấp cứu người!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Gọi lúc nào buồn ngủ để nói chuyện cho vui',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Hành vi gọi trêu đùa tổng đài cứu nạn là vi phạm pháp luật!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Gọi để nhờ chú cứu hỏa làm bài tập về nhà giúp',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Không chiếm dụng đường dây nóng cứu nạn!',
      },
    ],
  });
}
