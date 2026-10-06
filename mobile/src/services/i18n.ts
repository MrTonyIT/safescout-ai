export type SupportedLanguage = 'vi' | 'en' | 'ja' | 'ko' | 'es';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  voiceLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', voiceLocale: 'vi-VN' },
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', voiceLocale: 'en-US' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', voiceLocale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', voiceLocale: 'ko-KR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', voiceLocale: 'es-ES' },
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  vi: {
    appTitle: 'Học Viện Thám Hiểm Bí Mật',
    mapTab: 'Bản Đồ',
    aiTab: 'Quét AI',
    sosTab: 'Cứu Hộ',
    parentTab: 'Ba Mẹ',
    level: 'Cấp',
    stars: 'Sao',
    miloTipTag: 'Mẹo Cứu Hộ Milo 🛡️',
    startStage: 'BẮT ĐẦU VƯỢT ẢI 🚀',
    scanTitle: 'Balo Cứu Hộ Lượng Tử 🛡️',
    captureBtn: 'SOI VẬT THỂ 📸',
    sosTitle: 'Cứu Hộ Khẩn Cấp (SOS) 🚨',
    giantSosBtn: 'CÒI HÚ SOS',
    giantSosBtnActive: 'TẮT CÒI HÚ',
    strobeBtn: 'ĐÈN CHỚP SOS MORSE',
    strobeBtnActive: 'TẮT ĐÈN MORSE',
    speedDialTitle: '📞 4 PHÍM GỌI CỨU NẠN KHẨN CẤP (1-CHẠM):',
    parentGateTitle: 'Cổng Dành Cho Ba Mẹ 🛡️',
    enterPin: 'Nhập Mã PIN Phụ Huynh',
    readinessScore: 'Chỉ Số Sinh Tồn',
    vulnerabilityTitle: 'BẢN ĐỒ ĐIỂM YẾU & LỖ HỔNG KỸ NĂNG',
    drillsTitle: '3 HOẠT ĐỘNG DIỄN TẬP GIA ĐÌNH THỰC TẾ',
    screenTimeTitle: 'GIỚI HẠN THỜI GIAN HỌC',
    meshNetworkStatus: 'MẠNG LƯỚI VÔ TUYẾN BLE MESH P2P',
    edgeAiActive: 'EDGE VISION ON-DEVICE: SUY LUẬN SIÊU TỐC <30MS',
  },
  en: {
    appTitle: 'The Secret Explorer Academy',
    mapTab: 'World Map',
    aiTab: 'AI Scan',
    sosTab: 'SOS Rescue',
    parentTab: 'Parents',
    level: 'Lvl',
    stars: 'Stars',
    miloTipTag: "Milo's Survival Tip 🛡️",
    startStage: 'START QUEST 🚀',
    scanTitle: 'Quantum Rescue Scanner 🛡️',
    captureBtn: 'SCAN OBJECT 📸',
    sosTitle: 'Emergency SOS Toolkit 🚨',
    giantSosBtn: 'SOS SIREN',
    giantSosBtnActive: 'STOP SIREN',
    strobeBtn: 'MORSE SOS STROBE',
    strobeBtnActive: 'STOP STROBE',
    speedDialTitle: '📞 4 EMERGENCY SPEED DIALS (1-TAP):',
    parentGateTitle: 'Parental Audit Gate 🛡️',
    enterPin: 'Enter Secret Parent PIN',
    readinessScore: 'Survival Readiness Score',
    vulnerabilityTitle: 'VULNERABILITY & SKILL DEFICIT MAP',
    drillsTitle: '3 ACTIONABLE FAMILY PRACTICE DRILLS',
    screenTimeTitle: 'DAILY SCREEN TIME LIMIT',
    meshNetworkStatus: 'P2P BLE MESH RESCUE NETWORK',
    edgeAiActive: 'ON-DEVICE EDGE VISION: ULTRA-FAST <30MS',
  },
  ja: {
    appTitle: 'ひみつのたんけんアカデミー',
    mapTab: 'マップ',
    aiTab: 'AIスキャン',
    sosTab: 'きゅうじょ',
    parentTab: 'ほごしゃ',
    level: 'レベル',
    stars: 'スター',
    miloTipTag: 'マイロのサバイバルヒント 🛡️',
    startStage: '冒険をはじめる 🚀',
    scanTitle: 'レスキュースキャナー 🛡️',
    captureBtn: 'スキャンする 📸',
    sosTitle: 'きんきゅう SOS ツール 🚨',
    giantSosBtn: 'SOS サイレン',
    giantSosBtnActive: 'サイレン停止',
    strobeBtn: 'モールス信号ライト',
    strobeBtnActive: 'ライト停止',
    speedDialTitle: '📞 緊急ダイヤル (ワンタップ):',
    parentGateTitle: '保護者用ゲート 🛡️',
    enterPin: 'PINコードを入力',
    readinessScore: 'サバイバル能力スコア',
    vulnerabilityTitle: '弱点と改善ポイントの分析',
    drillsTitle: '家庭でできる3つの安全訓練',
    screenTimeTitle: '1日の利用時間制限',
    meshNetworkStatus: 'P2P BLE メッシュ緊急通信ネットワーク',
    edgeAiActive: '端末内 EDGE VISION: 超高速 <30MS 推論',
  },
  ko: {
    appTitle: '비밀 탐험가 아카데미',
    mapTab: '지도',
    aiTab: 'AI 스캔',
    sosTab: '구조 SOS',
    parentTab: '부모님',
    level: '레벨',
    stars: '별',
    miloTipTag: '마일로의 생존 팁 🛡️',
    startStage: '탐험 시작하기 🚀',
    scanTitle: '양자 구조 스캐너 🛡️',
    captureBtn: '물체 스캔 📸',
    sosTitle: '비상 SOS 툴킷 🚨',
    giantSosBtn: 'SOS 사이렌',
    giantSosBtnActive: '사이렌 중지',
    strobeBtn: '모스 부호 플래시',
    strobeBtnActive: '플래시 중지',
    speedDialTitle: '📞 긴급 구조 원터치 전화:',
    parentGateTitle: '학부모 전용 게이트 🛡️',
    enterPin: '보안 PIN 번호 입력',
    readinessScore: '생존 준비도 점수',
    vulnerabilityTitle: '취약점 및 대처 능력 분석',
    drillsTitle: '가정 내 3대 안전 훈련',
    screenTimeTitle: '일일 이용 시간 제한',
    meshNetworkStatus: 'P2P BLE 메시 비상 통신망',
    edgeAiActive: '온디바이스 엣지 AI: <30MS 초고속 추론',
  },
  es: {
    appTitle: 'Academia Secreta de Exploradores',
    mapTab: 'Mapa',
    aiTab: 'Escaneo AI',
    sosTab: 'Rescate SOS',
    parentTab: 'Padres',
    level: 'Nivel',
    stars: 'Estrellas',
    miloTipTag: 'Consejo de Milo 🛡️',
    startStage: 'COMENZAR MISIÓN 🚀',
    scanTitle: 'Escáner Cuántico de Rescate 🛡️',
    captureBtn: 'ESCANEAR OBJETO 📸',
    sosTitle: 'Herramientas de Emergencia SOS 🚨',
    giantSosBtn: 'SIRENA SOS',
    giantSosBtnActive: 'DETENER SIRENA',
    strobeBtn: 'LUZ MORSE SOS',
    strobeBtnActive: 'DETENER LUZ',
    speedDialTitle: '📞 4 NÚMEROS DE EMERGENCIA (1-TOQUE):',
    parentGateTitle: 'Portal para Padres 🛡️',
    enterPin: 'Ingrese PIN de Padres',
    readinessScore: 'Puntuación de Supervivencia',
    vulnerabilityTitle: 'MAPA DE VULNERABILIDADES Y HABILIDADES',
    drillsTitle: '3 EJERCICIOS PRÁCTICOS EN FAMILIA',
    screenTimeTitle: 'LÍMITE DE TIEMPO DIARIO',
    meshNetworkStatus: 'RED INALÁMBRICA P2P BLE MESH',
    edgeAiActive: 'EDGE VISION EN EL DISPOSITIVO: <30MS',
  },
};

class I18nService {
  private currentLang: SupportedLanguage = 'vi';
  private listeners: Array<(lang: SupportedLanguage) => void> = [];

  public getLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLang = lang;
    this.notifyListeners();
  }

  public getLanguageMeta(): LanguageMeta {
    return SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLang) || SUPPORTED_LANGUAGES[0];
  }

  public t(key: string): string {
    return TRANSLATIONS[this.currentLang]?.[key] || TRANSLATIONS.vi[key] || key;
  }

  public subscribe(listener: (lang: SupportedLanguage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.currentLang));
  }
}

export const i18n = new I18nService();
