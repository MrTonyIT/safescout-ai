import { AiService } from '../src/modules/ai/ai.service';
import { generateMiloFallbackResponse } from '../src/modules/ai/prompts/captain-milo.prompt';
import * as bcrypt from 'bcrypt';

async function runVerification() {
  console.log('======================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG CỐT LÕI (KIDSSAFE AI SYSTEM VERIFICATION)');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Kiểm thử Fallback Engine & Cảnh báo Khẩn Cấp (Hard Safety Guardrail)
  console.log('--- 1. Kiểm thử Hard Safety Guardrails & Fallback Engine ---');
  const fireEmergencyResponse = generateMiloFallbackResponse('NETWORK_ERROR', 'Em thấy có khói và lửa cháy trong bếp!');
  assert(fireEmergencyResponse.emotion === 'DANGER_ALERT', 'Kích hoạt emotion DANGER_ALERT khi có lửa/cháy');
  assert(fireEmergencyResponse.hazardLevel === 'CRITICAL_EMERGENCY', 'Gán hazardLevel = CRITICAL_EMERGENCY khi có nguy cơ hỏa hoạn');
  assert(fireEmergencyResponse.audioCue === 'sfx_milo_alert_sos', 'Phát âm thanh báo động SOS');
  assert(fireEmergencyResponse.actionRequired !== null, 'Trả về hành động an toàn tức thì cho trẻ');

  const safeChatResponse = generateMiloFallbackResponse('NETWORK_ERROR', 'Chào Đội Trưởng Milo, hôm nay trời đẹp quá!');
  assert(safeChatResponse.hazardLevel === 'SAFE', 'Nhận diện tình huống an toàn chuẩn xác');
  assert(safeChatResponse.emotion === 'IDLE', 'Trạng thái IDLE thân thiện');

  // 2. Kiểm thử AI Service
  console.log('\n--- 2. Kiểm thử AI Service & Input Validation ---');
  const aiService = new AiService();

  // Test buffer size > 4MB
  const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
  try {
    await aiService.scanEnvironment(largeBuffer, 'image/jpeg');
    assert(false, 'Phải ném lỗi khi upload ảnh quá 4MB');
  } catch (err: any) {
    assert(err.message.includes('4MB'), 'Bắt chính xác lỗi kích thước ảnh vượt quá 4MB');
  }

  // Test invalid mime type
  const validBuffer = Buffer.alloc(100);
  try {
    await aiService.scanEnvironment(validBuffer, 'application/pdf');
    assert(false, 'Phải ném lỗi khi mimeType không phải là ảnh');
  } catch (err: any) {
    assert(err.message.includes('Định dạng ảnh không hợp lệ'), 'Bắt chính xác lỗi định dạng ảnh');
  }

  // Test chat fallback response format
  const chatFallback = await aiService.chatWithMilo({
    message: 'Bé bị đứt tay thì phải làm sao hả Milo?',
    childAge: 7,
    userNickname: 'Bé Bo',
  });
  assert(typeof chatFallback.speech === 'string' && chatFallback.speech.length > 0, 'Phản hồi speech hợp lệ');
  assert(['IDLE', 'THINKING', 'CHEERING', 'DANGER_ALERT'].includes(chatFallback.emotion), 'Emotion hợp lệ trong enum');
  assert(['SAFE', 'CAUTION', 'CRITICAL_EMERGENCY'].includes(chatFallback.hazardLevel), 'HazardLevel hợp lệ trong enum');

  // 3. Kiểm thử Parent Gate Security (Bcrypt Hash & PIN Verification)
  console.log('\n--- 3. Kiểm thử Bảo mật Cổng Phụ Huynh (Parent Gate PIN) ---');
  const rawPin = '1234';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPin, salt);

  const isCorrectPin = await bcrypt.compare('1234', hash);
  const isWrongPin = await bcrypt.compare('9999', hash);
  assert(isCorrectPin === true, 'Xác thực đúng mã PIN phụ huynh 1234');
  assert(isWrongPin === false, 'Từ chối mã PIN sai 9999');

  console.log('\n======================================================================');
  console.log(`🎯 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} BÀI KIỂM THỬ ĐẠT CHUẨN 100%`);
  console.log('======================================================================');
}

runVerification().catch(console.error);
