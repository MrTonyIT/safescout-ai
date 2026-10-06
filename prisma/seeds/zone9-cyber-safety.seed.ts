import { PrismaClient } from '@prisma/client';
import { LessonType, QuestionType, HazardLevel } from '../../src/common/enums/safety.enum';

export async function seedZone9(prisma: PrismaClient) {
  console.log('💻 Đang nạp dữ liệu Vùng 9: Vệ Binh Không Gian Mạng...');

  const zone9 = await prisma.zone.upsert({
    where: { zoneNumber: 9 },
    update: {
      title: 'Vùng 9: Vệ Binh Không Gian Mạng',
      description: 'An toàn kỹ thuật số: bảo mật thông tin cá nhân, phòng tránh bẫy lừa đảo nạp game và chống bắt nạt trên mạng.',
      iconName: 'shield-alert',
      themeColor: '#457B9D',
      unlockLevel: 5,
    },
    create: {
      zoneNumber: 9,
      title: 'Vùng 9: Vệ Binh Không Gian Mạng',
      description: 'An toàn kỹ thuật số: bảo mật thông tin cá nhân, phòng tránh bẫy lừa đảo nạp game và chống bắt nạt trên mạng.',
      iconName: 'shield-alert',
      themeColor: '#457B9D',
      unlockLevel: 5,
    },
  });

  await prisma.badge.upsert({
    where: { code: 'BADGE_ZONE_9' },
    update: {},
    create: {
      zoneId: zone9.id,
      name: 'Huy Hiệu Khiên Lượng Tử Mạng',
      code: 'BADGE_ZONE_9',
      description: 'Vinh danh hiệp sĩ số làm chủ kỹ năng bảo mật thông tin và an toàn trên Internet.',
      iconUrl: 'https://cdn.kidssafe.ai/badges/cyber_guardian_badge.png',
      requiredShardsCount: 3,
    },
  });

  // Stage 1: Bảo Mật Thông Tin & Bẫy Game Ảo
  const stage1 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone9.id, stageNumber: 1 } },
    update: {},
    create: {
      zoneId: zone9.id,
      stageNumber: 1,
      title: 'Bảo Mật Thông Tin & Bẫy Quà Game Miễn Phí',
      description: 'Nhận diện kẻ xấu giả mạo tặng kim cương và giữ kín bí mật gia đình.',
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage1.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage1.id,
      lessonNumber: 1,
      title: 'Bảo Vệ Bí Mật Số & Bẫy Nạp Kim Cương Ảo',
      description: 'Không chia sẻ mật khẩu, địa chỉ nhà hay số điện thoại cho bạn ảo.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Tường Lửa Lượng Tử',
      contentJson: JSON.stringify({
        story: 'Milo - Hiệp sĩ số giải thích: "Thế giới Internet rất rộng lớn nhưng cũng có kẻ xấu rình rập! Lời mời tặng kim cương/quà game miễn phí đòi mật khẩu hoặc số điện thoại là BẪY LỪA ĐẢO! Hãy giữ bí mật tuyệt đối thông tin cá nhân!"',
        coreRule: '1. Không cho mật khẩu/số điện thoại/địa chỉ. 2. Không bấm link lạ nhận quà ảo.',
      }),
    },
  });

  const cp1 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson1.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson1.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Cạm Bẫy Không Gian Mạng',
      description: 'Phòng tránh bẫy game lừa đảo để nhận Mảnh Tường Lửa Lượng Tử.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Tường Lửa Lượng Tử',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp1.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp1.id,
      questionNumber: 1,
      promptText: 'Một tài khoản lạ nhắn tin: "Tặng em 10.000 Kim Cương game miễn phí, hãy gửi mật khẩu và số điện thoại của mẹ em nhé!". Phản xạ là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 7,
      explanation: 'Không có quà tặng game miễn phí đòi mật khẩu. Đây là chiêu trò lừa đảo để cướp nick và chiếm đoạt tiền trong tài khoản ba mẹ.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q1.id,
        optionText: 'Tuyệt đối KHÔNG gửi bất kỳ thông tin nào, chụp màn hình và báo ngay cho ba mẹ vì đây là bẫy lừa đảo',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Bé rất tỉnh táo nhận diện chiêu trò lừa đảo qua mạng!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Gửi mật khẩu ngay để lấy 10.000 kim cương',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Bé sẽ bị mất sạch tài khoản và dữ liệu!',
      },
      {
        testQuestionId: q1.id,
        optionText: 'Chỉ gửi số điện thoại của mẹ thôi',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Kẻ xấu sẽ dùng số điện thoại của mẹ để gửi mã rút tiền lừa đảo!',
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
      promptText: 'Những thông tin nào dưới đây là "BÍ MẬT CÁ NHÂN" tuyệt đối không được đăng công khai lên mạng xã hội?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 10,
      explanation: 'Họ tên thật, địa chỉ nhà, số điện thoại, tên trường lớp, vị trí GPS và ảnh mặc đồng phục là thông tin nhạy cảm bảo mật.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2.id,
        optionText: 'Họ tên đầy đủ, địa chỉ nhà ở, số điện thoại, tên trường lớp, mật khẩu và ảnh mặc đồng phục',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Giữ kín thông tin cá nhân giúp kẻ xấu không thể theo dõi bé!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Tên một nhân vật siêu nhân trong truyện tranh',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Tên nhân vật hoạt hình không phải là thông tin cá nhân bí mật!',
      },
      {
        testQuestionId: q2.id,
        optionText: 'Màu sắc yêu thích của bé',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Sở thích màu sắc thông thường an toàn để chia sẻ!',
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
      promptText: 'Sắp xếp đúng 3 bước ứng phó khi nhận được đường link lạ hoặc tin nhắn đáng ngờ trên mạng:',
      questionType: QuestionType.DRAG_DROP_ORDER,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 15,
      explanation: '1. Không bấm vào link -> 2. Chặn tài khoản lạ -> 3. Kể lại ngay cho ba mẹ.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q3.id,
        optionText: '1. Tuyệt đối KHÔNG bấm vào đường link lạ gửi qua tin nhắn hay bình luận',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Bước 1: Không bấm link lạ!',
      },
      {
        testQuestionId: q3.id,
        optionText: '2. Nhấn nút Chặn (Block) và Báo cáo (Report) tài khoản đáng ngờ đó',
        isCorrect: true,
        displayOrder: 2,
        feedbackSpeech: 'Bước 2: Chặn tài khoản!',
      },
      {
        testQuestionId: q3.id,
        optionText: '3. Kể lại ngay cho ba mẹ hoặc thầy cô giáo để được hướng dẫn an toàn',
        isCorrect: true,
        displayOrder: 3,
        feedbackSpeech: 'Bước 3: Báo người lớn!',
      },
    ],
  });

  // Stage 2: Phòng Chống Bắt Nạt Qua Mạng
  const stage2 = await prisma.stage.upsert({
    where: { zoneId_stageNumber: { zoneId: zone9.id, stageNumber: 2 } },
    update: {},
    create: {
      zoneId: zone9.id,
      stageNumber: 2,
      title: 'Phòng Chống Bắt Nạt Mạng & An Toàn Camera',
      description: 'Ứng phó khi bị nói xấu trên mạng và quy tắc sử dụng webcam riêng tư.',
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { stageId_lessonNumber: { stageId: stage2.id, lessonNumber: 1 } },
    update: {},
    create: {
      stageId: stage2.id,
      lessonNumber: 1,
      title: 'Nói Không Với Cyberbullying & Bảo Mật Camera',
      description: 'Chụp màn hình làm bằng chứng, không trả đũa và bảo vệ sự riêng tư qua webcam.',
      lessonType: LessonType.STORY_INTERACTIVE,
      durationMinutes: 5,
      rewardXp: 150,
      badgeShardName: 'Mảnh Khiên Chống Độc',
      contentJson: JSON.stringify({
        story: 'Milo nhắc nhở: "Nếu ai đó gửi tin nhắn bắt nạt hoặc đòi bật camera xem những điều nhạy cảm: Hãy CHỤP MÀN HÌNH lại làm bằng chứng, CHẶN TÀI KHOẢN và BÁO NGAY CHO BA MẸ! Bé không làm gì sai và ba mẹ luôn bảo vệ bé!"',
        coreRule: '1. Bắt nạt mạng: Chụp ảnh bằng chứng, chặn, báo ba mẹ. 2. Không bật camera với người lạ.',
      }),
    },
  });

  const cp2 = await prisma.checkpoint.upsert({
    where: { lessonId_checkpointNumber: { lessonId: lesson2.id, checkpointNumber: 1 } },
    update: {},
    create: {
      lessonId: lesson2.id,
      checkpointNumber: 1,
      title: 'Thử Thách: Vệ Binh Không Gian Số',
      description: 'Xử lý tình huống bắt nạt trên mạng để nhận Mảnh Khiên Chống Độc.',
      passScoreThreshold: 80,
      timeLimitSeconds: 30,
      badgeShardReward: 'Mảnh Khiên Chống Độc',
    },
  });

  // Question 1: TIMED_REFLEX (7s)
  const q2_1 = await prisma.testQuestion.upsert({
    where: { checkpointId_questionNumber: { checkpointId: cp2.id, questionNumber: 1 } },
    update: {},
    create: {
      checkpointId: cp2.id,
      questionNumber: 1,
      promptText: 'Khi thấy có người đăng bài chế giễu, đe dọa hoặc gửi lời lẽ xúc phạm bé trong nhóm chat, hành động chuẩn là gì?',
      questionType: QuestionType.TIMED_REFLEX,
      hazardLevel: HazardLevel.CAUTION,
      timeLimitSeconds: 7,
      explanation: 'Chụp ảnh màn hình làm bằng chứng, không cãi vã chửi lại, chặn tài khoản đó và cho ba mẹ/thầy cô xem ngay.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_1.id,
        optionText: 'Chụp lại màn hình làm bằng chứng, không nhắn tin cãi vã lại, chặn tài khoản và báo ngay cho ba mẹ',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Chính xác 100%! Chụp bằng chứng và báo người lớn là cách xử lý văn minh và an toàn!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Dùng lời lẽ độc hại chửi bới lại người đó',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cãi vã qua lại sẽ làm sự việc căng thẳng và tổn thương nhiều hơn!',
      },
      {
        testQuestionId: q2_1.id,
        optionText: 'Âm thầm chịu đựng khóc một mình không dám nói với ai',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Đừng im lặng! Ba mẹ và thầy cô luôn luôn ở bên để bảo vệ bé!',
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
      promptText: 'Quy tắc an toàn khi sử dụng Webcam / Camera máy tính khi học online là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.CRITICAL_EMERGENCY,
      timeLimitSeconds: 10,
      explanation: 'Chỉ bật camera trong các buổi học chính thức có thầy cô và bạn bè. Tuyệt đối không bật camera gọi riêng với người lạ hoặc làm theo yêu cầu nhạy cảm.',
      orderIndex: 2,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_2.id,
        optionText: 'Chỉ bật camera khi học với thầy cô, tuyệt đối không gọi video riêng tư với người lạ qua mạng',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Tuyệt vời! Bảo vệ hình ảnh và không gian riêng tư của bé!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Bật camera mọi lúc mọi nơi kể cả khi đang thay quần áo',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Cực kỳ nguy hiểm! Hình ảnh riêng tư có thể bị ghi lại phát tán xấu!',
      },
      {
        testQuestionId: q2_2.id,
        optionText: 'Làm theo mọi yêu cầu kỳ lạ của bạn quen trên mạng qua camera',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Tuyệt đối từ chối các yêu cầu bất thường qua video call!',
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
      promptText: 'Quy tắc 20-20-20 để bảo vệ đôi mắt sáng khi học tập trên máy tính là gì?',
      questionType: QuestionType.SINGLE_CHOICE,
      hazardLevel: HazardLevel.SAFE,
      timeLimitSeconds: 10,
      explanation: 'Mỗi 20 phút nhìn màn hình -> Nhìn ra xa 20 feet (khoảng 6 mét) trong 20 giây để mắt thư giãn nghỉ ngơi.',
      orderIndex: 3,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      {
        testQuestionId: q2_3.id,
        optionText: 'Mỗi 20 phút nhìn màn hình -> Hãy nhìn ra xa khoảng 6 mét trong vòng 20 giây để thư giãn mắt',
        isCorrect: true,
        displayOrder: 1,
        feedbackSpeech: 'Rất chính xác! Quy tắc 20-20-20 giúp bảo vệ mắt sáng khỏe mạnh!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Xem liên tục 20 tiếng không nghỉ',
        isCorrect: false,
        displayOrder: 2,
        feedbackSpeech: 'Nhìn màn hình quá lâu sẽ gây mỏi mắt và suy giảm thị lực nặng!',
      },
      {
        testQuestionId: q2_3.id,
        optionText: 'Đặt mắt sát màn hình cách 5cm',
        isCorrect: false,
        displayOrder: 3,
        feedbackSpeech: 'Khoảng cách an toàn tới màn hình là từ 40 đến 50cm!',
      },
    ],
  });
}
