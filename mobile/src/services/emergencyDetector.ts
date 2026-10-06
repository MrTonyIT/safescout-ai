import { soundService } from './sound';
import { voiceService } from './voice';
import { bleMeshSos } from './meshSos';

export type EmergencyCategory =
  | 'FIRE_SMOKE'
  | 'KIDNAPPING_STRANGER'
  | 'DROWNING_WATER'
  | 'TRAPPED_VEHICLE_ELEVATOR'
  | 'SEVERE_INJURY'
  | 'LOST_WILDERNESS'
  | 'UNKNOWN';

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'SAFE';
  category: EmergencyCategory;
  detectedKeywords: string[];
  immediateActionSpeech: string;
  recommendedHotline: string;
  recommendedHotlineNumber: string;
  actionGuidance: string[];
}

interface DangerKeywordRule {
  category: EmergencyCategory;
  severity: 'CRITICAL' | 'WARNING';
  keywords: string[];
  speech: string;
  hotline: string;
  hotlineNumber: string;
  guidance: string[];
}

const DANGER_DICTIONARY: DangerKeywordRule[] = [
  {
    category: 'FIRE_SMOKE',
    severity: 'CRITICAL',
    keywords: [
      'cháy',
      'cháy nhà',
      'khói',
      'khói đen',
      'ngạt khói',
      'bốc hỏa',
      'lửa cháy',
      'fire',
      'smoke',
      'hỏa hoạn',
    ],
    speech: 'CẢNH BÁO HỎA HOẠN! Bé hãy bò thấp sát sàn nhà, bịt khăn ướt vào mũi miệng và ra ban công cầu cứu ngay!',
    hotline: 'Cứu hỏa PCCC',
    hotlineNumber: '114',
    guidance: [
      'Bò thấp sát sàn nhà dưới 30cm (nơi có không khí sạch).',
      'Dùng khăn nhúng nước ướt bịt chặt mũi và miệng.',
      'Sờ mu bàn tay vào cánh cửa trước khi mở.',
      'Tuyệt đối không dùng thang máy.',
    ],
  },
  {
    category: 'KIDNAPPING_STRANGER',
    severity: 'CRITICAL',
    keywords: [
      'bắt cóc',
      'người lạ kéo',
      'người lạ bế',
      'lôi cháu đi',
      'cứu cháu với',
      'cháu không quen',
      'bịt miệng',
      'kidnap',
      'stranger',
    ],
    speech: 'CẢNH BÁO BẮT CÓC! Bé hãy hét thật to "CHÁU KHÔNG QUEN NGƯỜI NÀY" và chạy ngay đến chú bảo vệ hoặc cô thu ngân!',
    hotline: 'Cảnh sát 113 & Tổng đài Trẻ em',
    hotlineNumber: '111',
    guidance: [
      'Hét thật to: "CỨU CHÁU VỚI, CHÁU KHÔNG QUEN NGƯỜI NÀY!"',
      'Ngồi bệt xuống đất hoặc ôm chặt chân người đi đường.',
      'Chạy về phía cửa hàng có đèn sáng hoặc trạm bảo vệ.',
    ],
  },
  {
    category: 'DROWNING_WATER',
    severity: 'CRITICAL',
    keywords: [
      'đuối nước',
      'chìm',
      'sắp chìm',
      'cứu bạn dưới nước',
      'dòng rip',
      'xoáy nước',
      'hút xuống',
      'chuột rút dưới nước',
      'drowning',
    ],
    speech: 'CẢNH BÁO ĐUỐI NƯỚC! Quy tắc sống còn: Reach or Throw, Don\'t Go! Tuyệt đối không nhảy xuống nước, hãy ném phao hoặc chìa sào dài cho bạn!',
    hotline: 'Cứu nạn Cứu hộ',
    hotlineNumber: '114',
    guidance: [
      'Không bao giờ nhảy xuống nước cứu bạn.',
      'Ném phao, can nhựa rỗng hoặc chìa cành cây dài.',
      'Nằm sát mép bờ khi kéo bạn vào.',
      'Nếu là chính mình: Thả lỏng toàn thân, nổi ngửa hình sao biển.',
    ],
  },
  {
    category: 'TRAPPED_VEHICLE_ELEVATOR',
    severity: 'CRITICAL',
    keywords: [
      'kẹt trên xe',
      'bị bỏ quên trên xe bus',
      'kẹt xe bus',
      'kẹt thang máy',
      'thang máy rơi',
      'bị nhốt trong xe',
      'trapped in bus',
    ],
    speech: 'CẢNH BÁO KẸT TRONG XE! Bé hãy trèo lên ghế lái, nhấn còi vô lăng to liên tục và bật nút đèn tam giác khẩn cấp!',
    hotline: 'Cảnh sát & Cứu nạn',
    hotlineNumber: '113',
    guidance: [
      'Leo lên ghế lái bấm còi vô lăng liên tục để báo động.',
      'Bấm nút đèn tam giác đỏ khẩn cấp trên bảng điều khiển.',
      'Đứng sát cửa kính vẫy áo sáng màu kêu cứu.',
      'Nếu trong thang máy: Bấm nút chuông vàng Intercom.',
    ],
  },
  {
    category: 'SEVERE_INJURY',
    severity: 'CRITICAL',
    keywords: [
      'chảy máu nhiều',
      'gãy tay',
      'gãy chân',
      'hóc nghẹn',
      'hóc kẹo',
      'bỏng nặng',
      'bỏng nước sôi',
      'điện giật',
      'ngất xỉu',
      'bất tỉnh',
      'bleeding',
      'choking',
    ],
    speech: 'CẢNH BÁO Y TẾ KHẨN CẤP! Milo đang kết nối còi cấp cứu. Hãy gọi ngay 115 và làm theo hướng dẫn sơ cứu!',
    hotline: 'Cấp cứu Y tế Toàn quốc',
    hotlineNumber: '115',
    guidance: [
      'Bỏng nước sôi: Xả dưới vòi nước mát chảy nhẹ 15-20 phút.',
      'Chảy máu: Dùng gạc sạch ép chặt trực tiếp lên vết thương.',
      'Hóc dị vật: Thực hiện vỗ lưng ấn ngực hoặc Heimlich.',
      'Điện giật: Không chạm trực tiếp, dùng gậy gỗ gạt nguồn điện.',
    ],
  },
  {
    category: 'LOST_WILDERNESS',
    severity: 'WARNING',
    keywords: [
      'lạc đường',
      'lạc trong rừng',
      'không thấy ba mẹ',
      'mất phương hướng',
      'bị lạc',
      'lost in forest',
      'lost',
    ],
    speech: 'Bé bình tĩnh nhé! Hãy thực hiện ngay quy tắc Ôm Cây Hug-a-Tree: Đứng yên tại chỗ, ôm cây to và thổi còi 3 tiếng cứu hộ!',
    hotline: 'Đường dây nóng Trẻ em',
    hotlineNumber: '111',
    guidance: [
      'Đứng yên tại chỗ ôm một cây to gần nhất (Hug-a-Tree).',
      'Thổi 3 tiếng còi ngắt quãng (To - To - To).',
      'Tránh xa khe suối sâu và vách đá dốc.',
      'Lót lá khô giữ ấm cơ thể.',
    ],
  },
];

type EmergencySubscriber = (result: EmergencyDetectionResult) => void;

class EmergencyDetectorEngine {
  private subscribers: EmergencySubscriber[] = [];

  subscribe(callback: EmergencySubscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  // Phân tích văn bản tiếng Việt & tiếng Anh on-device
  evaluateText(inputText: string): EmergencyDetectionResult {
    if (!inputText || typeof inputText !== 'string') {
      return this.createSafeResult();
    }

    const normalized = inputText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const rawLower = inputText.toLowerCase();

    for (const rule of DANGER_DICTIONARY) {
      const matched = rule.keywords.filter((kw) => {
        const normKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return rawLower.includes(kw) || normalized.includes(normKw);
      });

      if (matched.length > 0) {
        return {
          isEmergency: true,
          severity: rule.severity,
          category: rule.category,
          detectedKeywords: matched,
          immediateActionSpeech: rule.speech,
          recommendedHotline: rule.hotline,
          recommendedHotlineNumber: rule.hotlineNumber,
          actionGuidance: rule.guidance,
        };
      }
    }

    return this.createSafeResult();
  }

  // Tự động kích hoạt phản ứng khẩn cấp tức thì (Instant Emergency Dispatch)
  async triggerAutoEmergency(
    result: EmergencyDetectionResult,
    navigateToSosCallback?: () => void,
  ): Promise<void> {
    if (!result.isEmergency) return;

    // 1. Phát âm thanh báo động khẩn cấp
    soundService.playAlertSound();

    // 2. Milo đọc hướng dẫn xử lý khẩn cấp bằng giọng nói AI
    voiceService.speakMilo(result.immediateActionSpeech, 'DANGER_ALERT');

    // 3. Phát sóng định vị khẩn cấp BLE Mesh SOS
    bleMeshSos.startMeshBroadcast(
      `🚨 [AUTO-TRIGGER] Phát hiện nguy hiểm: ${result.detectedKeywords.join(', ')} (${result.category})`,
      10.7769,
      106.7009,
    );

    // 4. Thông báo đến các subscribers
    this.subscribers.forEach((cb) => {
      try {
        cb(result);
      } catch (e) {}
    });

    // 5. Chuyển hướng ngay lập tức đến SosScreen
    if (navigateToSosCallback) {
      navigateToSosCallback();
    }
  }

  private createSafeResult(): EmergencyDetectionResult {
    return {
      isEmergency: false,
      severity: 'SAFE',
      category: 'UNKNOWN',
      detectedKeywords: [],
      immediateActionSpeech: 'Tình huống an toàn. Hãy luôn chú ý quan sát xung quanh nhé!',
      recommendedHotline: 'Tổng đài Trẻ em',
      recommendedHotlineNumber: '111',
      actionGuidance: ['Luôn tuân theo hướng dẫn an toàn của ba mẹ và thầy cô.'],
    };
  }
}

export const emergencyDetector = new EmergencyDetectorEngine();
