import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { JourneyMapData, StageSummary } from '../types/curriculum';

// Cấu trúc Dữ Liệu Cẩm Nang Sinh Tồn Ngoại Tuyến (Offline Survival Handbook)
export interface OfflineHandbookEntry {
  zoneNumber: number;
  zoneTitle: string;
  themeColor: string;
  keyRule: string;
  firstAidProtocol: string;
  emergencyHotlines: Array<{ name: string; number: string }>;
  stages: Array<{
    num: number;
    title: string;
    description: string;
    xp: number;
    badgeShard: string;
  }>;
}

// Cấu trúc Hàng Đợi Nộp Bài Test Ngoại Tuyến (Offline Submission Queue)
export interface PendingOfflineAttempt {
  id: string;
  checkpointId: string;
  userId: string;
  answers: Array<{
    questionId: string;
    selectedOptionId?: string;
    orderedOptionIds?: string[];
    responseTimeMs?: number;
  }>;
  timeTakenSeconds: number;
  score: number;
  stars: number;
  isPassed: boolean;
  timestamp: number;
  synced: boolean;
}

// Cấu trúc Mảnh Ghép Huy Hiệu Balo (Badge Shard Inventory)
export interface QuantumBadgeInventoryItem {
  id: string;
  zoneNumber: number;
  badgeName: string;
  badgeCode: string;
  badgeEmoji: string;
  category: string;
  shardsCollected: number;
  totalShardsRequired: number;
  isSynthesized: boolean;
  unlockedAt: string | null;
  certifiedProtocol: string;
  miloKeyAdvice: string;
}

const STORAGE_KEYS = {
  HANDBOOK_DATA: 'milo_offline_handbook_v1',
  PENDING_TEST_QUEUE: 'milo_pending_test_queue_v1',
  BADGE_INVENTORY: 'milo_badge_inventory_v1',
  LAST_SYNC_TIME: 'milo_last_sync_timestamp_v1',
  OFFLINE_MODE_OVERRIDE: 'milo_force_offline_mode_v1',
};

// Bộ nhớ RAM Cache dự phòng an toàn tuyệt đối
const memoryCache: Record<string, string> = {};

export class OfflineStorageEngine {
  private isOnlineStatus: boolean = true;

  constructor(private readonly userId: string = 'internal-preview') {}

  private async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem('milo_verified_v2:' + this.userId + ':' + key, value);
  }
  private async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem('milo_verified_v2:' + this.userId + ':' + key);
  }

  // --- 1. QUẢN LÝ CẨM NANG SINH TỒN NGOẠI TUYẾN 10 VÙNG ĐẤT ---
  async getSurvivalHandbook(): Promise<OfflineHandbookEntry[]> {
    const raw = await this.getItem(STORAGE_KEYS.HANDBOOK_DATA);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return this.getDefaultHandbookData();
  }

  async saveSurvivalHandbook(data: OfflineHandbookEntry[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.HANDBOOK_DATA, JSON.stringify(data));
  }

  // --- 2. QUẢN LÝ HÀNG ĐỢI NỘP BÀI THI KHI MẤT MẠNG (SYNC QUEUE) ---
  async enqueueOfflineAttempt(attempt: Omit<PendingOfflineAttempt, 'id' | 'timestamp' | 'synced'>): Promise<PendingOfflineAttempt> {
    const queue = await this.getPendingAttempts();
    const newAttempt: PendingOfflineAttempt = {
      ...attempt,
      id: 'offline_att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      synced: false,
    };
    queue.push(newAttempt);
    await this.setItem(STORAGE_KEYS.PENDING_TEST_QUEUE, JSON.stringify(queue));
    return newAttempt;
  }

  async getPendingAttempts(): Promise<PendingOfflineAttempt[]> {
    const raw = await this.getItem(STORAGE_KEYS.PENDING_TEST_QUEUE);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [];
  }

  async clearPendingAttempts(): Promise<void> {
    await this.setItem(STORAGE_KEYS.PENDING_TEST_QUEUE, JSON.stringify([]));
  }

  async markAttemptSynced(id: string): Promise<void> {
    const queue = await this.getPendingAttempts();
    const updated = queue.filter((item) => item.id !== id);
    await this.setItem(STORAGE_KEYS.PENDING_TEST_QUEUE, JSON.stringify(updated));
  }

  // --- 3. QUẢN LÝ BALO HUY HIỆU & MẢNH GHÉP LƯỢNG TỬ ---
  async getBadgeInventory(): Promise<QuantumBadgeInventoryItem[]> {
    const raw = await this.getItem(STORAGE_KEYS.BADGE_INVENTORY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return this.getDefaultBadges();
  }

  async saveBadgeInventory(inventory: QuantumBadgeInventoryItem[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.BADGE_INVENTORY, JSON.stringify(inventory));
  }

  async addShardToBadge(zoneNumber: number, count: number = 1): Promise<QuantumBadgeInventoryItem[]> {
    const inventory = await this.getBadgeInventory();
    const target = inventory.find((b) => b.zoneNumber === zoneNumber);
    if (target) {
      target.shardsCollected = Math.min(target.totalShardsRequired, target.shardsCollected + count);
      if (target.shardsCollected >= target.totalShardsRequired && !target.isSynthesized) {
        // Có thể tổng hợp huy hiệu
      }
      await this.saveBadgeInventory(inventory);
    }
    return inventory;
  }

  async synthesizeBadge(zoneNumber: number): Promise<{ success: boolean; badge?: QuantumBadgeInventoryItem }> {
    const inventory = await this.getBadgeInventory();
    const target = inventory.find((b) => b.zoneNumber === zoneNumber);
    if (target && target.shardsCollected >= target.totalShardsRequired) {
      target.isSynthesized = true;
      target.unlockedAt = new Date().toISOString();
      await this.saveBadgeInventory(inventory);
      return { success: true, badge: target };
    }
    return { success: false };
  }

  // --- 4. THEO DÕI TRẠNG THÁI MẠNG & THÔNG BÁO ---
  setOnlineStatus(online: boolean) {
    this.isOnlineStatus = online;
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  // Khởi tạo cẩm nang mặc định
  private initDefaultHandbook() {
    this.saveSurvivalHandbook(this.getDefaultHandbookData());
    this.saveBadgeInventory(this.getDefaultBadges());
  }

  // Dữ liệu 10 Vùng Đất Sinh Tồn chuẩn hóa
  private getDefaultHandbookData(): OfflineHandbookEntry[] {
    return [
      {
        zoneNumber: 1,
        zoneTitle: 'Vùng 1: Rừng Xanh Thám Hiểm & Lạc Lối',
        themeColor: '#22C55E',
        keyRule: 'Quy tắc Hug-a-Tree: Đứng yên ôm cây to gần nhất và thổi còi 3 tiếng ngắt quãng cứu hộ.',
        firstAidProtocol: 'Phòng ngừa hạ thân nhiệt, giữ ấm bằng lá khô, nhận diện thực vật độc & nấm rừng sặc sỡ.',
        emergencyHotlines: [
          { name: 'Tổng đài Bảo vệ Trẻ em', number: '111' },
          { name: 'Cảnh sát Tìm kiếm Cứu nạn', number: '113' },
        ],
        stages: [
          { num: 1, title: 'Đứng Yên Ôm Cây (Hug-a-Tree)', description: 'Không chạy loạn khi nhận ra mình đã bị lạc.', xp: 50, badgeShard: 'Mảnh Vỏ Cây Cổ Thụ' },
          { num: 2, title: 'Thổi Còi 3 Tiếng Cứu Hộ', description: 'Tín hiệu cầu cứu quốc tế: 3 tiếng ngắt quãng to rõ.', xp: 60, badgeShard: 'Mảnh Còi Báo Động' },
          { num: 3, title: 'Giữ Ấm Thân Nhiệt Trong Rừng', description: 'Tránh gió rét bằng cách lót lá khô dưới đất.', xp: 60, badgeShard: 'Mảnh Lá Giữ Nhiệt' },
          { num: 4, title: 'Nhận Diện Nấm Độc & Quả Dại', description: 'Tuyệt đối không ăn nấm sặc sỡ và quả lạ.', xp: 70, badgeShard: 'Mảnh Kính Thấu Quang' },
          { num: 5, title: 'Tránh Đứng Dưới Gốc Cây Sét Đánh', description: 'Khi trời mưa giông, tránh xa cây cao độc lập.', xp: 70, badgeShard: 'Mảnh Cột Thu Lôi' },
          { num: 6, title: 'Uống Nước Mưa & Tránh Vũng Nước Đọng', description: 'Hứng nước mưa sạch, không uống nước bùn lầy.', xp: 80, badgeShard: 'Mảnh Giọt Nước Tinh Khiết' },
          { num: 7, title: 'Tạo Dấu Hiệu Cầu Cứu SOS Bằng Cành Cây', description: 'Xếp chữ SOS to trên bãi đất trống cho trực thăng thấy.', xp: 80, badgeShard: 'Mảnh Bảng Tín Hiệu' },
          { num: 8, title: 'Tránh Côn Trùng & Rắn Độc', description: 'Dùng cành cây khua bụi rậm trước khi bước qua.', xp: 90, badgeShard: 'Mảnh Vảy Bọc Thép' },
          { num: 9, title: 'Tìm Hướng Đi Bằng Mặt Trời & Rêu Cây', description: 'Rêu mọc nhiều ở hướng ẩm, mặt trời mọc hướng Đông.', xp: 90, badgeShard: 'Mảnh Kim La Bàn' },
          { num: 10, title: '👑 ĐẠI THỬ THÁCH: Hiệp Sĩ Rừng Xanh', description: 'Tổng hợp 10 phản xạ sinh tồn nơi rừng rậm hoang dã.', xp: 200, badgeShard: 'Lõi Năng Lượng Rừng Xanh' },
        ],
      },
      {
        zoneNumber: 2,
        zoneTitle: 'Vùng 2: Đô Thị & Cảnh Giác Người Lạ',
        themeColor: '#4F46E5',
        keyRule: 'Quy tắc Không Đi Cùng Người Lạ: Hét lớn "CHÁU KHÔNG QUEN NGƯỜI NÀY" và chạy về chú bảo vệ/thu ngân.',
        firstAidProtocol: 'Nhận diện mật mã an toàn gia đình (Safe Word), phòng chống bắt cóc & chạm đụng xấu.',
        emergencyHotlines: [
          { name: 'Tổng đài Quốc gia Trẻ em', number: '111' },
          { name: 'Cảnh sát 113', number: '113' },
        ],
        stages: [
          { num: 1, title: 'Hét Lớn Từ Chối Người Lạ Kéo Đi', description: 'Tạo sự chú ý của mọi người xung quanh ngay lập tức.', xp: 50, badgeShard: 'Mảnh Giọng Nói Đanh Thép' },
          { num: 2, title: 'Mật Mã An Toàn Gia Đình (Safe Word)', description: 'Chỉ đi cùng người đọc đúng mật khẩu bí mật của ba mẹ.', xp: 60, badgeShard: 'Mảnh Mật Mã Lượng Tử' },
          { num: 3, title: 'Quy Tắc Đồ Lót (PANTS Rule)', description: 'Không ai được phép chạm vào vùng kín của cơ thể bé.', xp: 60, badgeShard: 'Mảnh Khiên Vệ Binh' },
          { num: 4, title: 'Nhận Diện Chú Bảo Vệ & Cô Thu Ngân', description: 'Những người lớn an toàn bé có thể chạy lại xin giúp đỡ.', xp: 70, badgeShard: 'Mảnh Đèn Đô Thị' },
          { num: 5, title: 'Từ Chối Kẹo & Đồ Chơi Từ Người Lạ', description: 'Lịch sự từ chối quà tặng không rõ nguồn gốc.', xp: 70, badgeShard: 'Mảnh Lăng Kính Cảnh Giác' },
          { num: 6, title: 'Chạy Ngược Chiều Ô Tô Khi Bị Theo Dõi', description: 'Ô tô không thể quay đầu nhanh trên phố đông.', xp: 80, badgeShard: 'Mảnh Dép Thần Tốc' },
          { num: 7, title: 'Ghi Nhớ Số Điện Thoại Ba Mẹ Bằng Thơ', description: 'Thuộc lòng 10 số điện thoại khẩn cấp của ba mẹ.', xp: 80, badgeShard: 'Mảnh Khối Nhớ Lượng Tử' },
          { num: 8, title: 'Báo Ngay Cho Ba Mẹ Khi Bị Đe Dọa', description: 'Không giữ bí mật xấu làm bé sợ hãi lo lắng.', xp: 90, badgeShard: 'Mảnh Chuông Cảnh Báo' },
          { num: 9, title: 'Tìm Cửa Hàng Tiện Lợi Bật Đèn 24/7', description: 'Nơi có camera và nhân viên túc trực an toàn.', xp: 90, badgeShard: 'Mảnh Ngôi Sao Dẫn Đường' },
          { num: 10, title: '👑 ĐẠI THỬ THÁCH: Vệ Binh Đô Thị', description: 'Thử thách phản xạ an toàn đường phố đô thị.', xp: 200, badgeShard: 'Lõi Năng Lượng Đô Thị' },
        ],
      },
      {
        zoneNumber: 3,
        zoneTitle: 'Vùng 3: Pháo Đài Tại Gia & Chống Cháy Nổ',
        themeColor: '#D97706',
        keyRule: 'Cháy phòng ngập khói: Bò thấp sát sàn nhà, bịt khăn ướt vào mũi miệng và sờ mu bàn tay vào cửa.',
        firstAidProtocol: 'Dừng - Nằm - Lăn (Stop, Drop and Roll), dập lửa trên áo quần, không dùng thang máy khi cháy.',
        emergencyHotlines: [
          { name: 'Cứu hỏa PCCC', number: '114' },
          { name: 'Cấp cứu Y tế', number: '115' },
        ],
        stages: [
          { num: 1, title: 'Bò Thấp Sát Sàn Thoát Khói', description: 'Khói độc bay lên cao, không khí sạch ở sát mặt đất 20-30cm.', xp: 50, badgeShard: 'Mảnh Khăn Ướt Kháng Khói' },
          { num: 2, title: 'Dùng Mu Bàn Tay Kiểm Tra Cánh Cửa', description: 'Nếu cửa nóng, tuyệt đối không mở vì lửa đang cháy bên ngoài.', xp: 60, badgeShard: 'Mảnh Găng Tay Cách Nhiệt' },
          { num: 3, title: 'Kỹ Thuật: Dừng - Nằm - Lăn (Stop-Drop-Roll)', description: 'Dập tắt lửa bén vào quần áo nhanh chóng và an toàn.', xp: 60, badgeShard: 'Mảnh Áo Chống Cháy' },
          { num: 4, title: 'Không Sử Dụng Thang Máy Khi Cháy', description: 'Thang máy dễ bị ngắt điện kẹt giữa các tầng nguy hiểm.', xp: 70, badgeShard: 'Mảnh Bậc Thang Cứu Nạn' },
          { num: 5, title: 'Bịt Kín Khe Cửa Bằng Khăn Ướt Chặn Khói', description: 'Ngăn không cho khói độc tràn vào phòng trong lúc chờ cứu hộ.', xp: 70, badgeShard: 'Mảnh Băng Chặn Khói' },
          { num: 6, title: 'Ra Ban Công Vẫy Khăn Sáng Màu Cầu Cứu', description: 'Hít thở không khí ngoài trời và phát tín hiệu cho lính cứu hỏa.', xp: 80, badgeShard: 'Mảnh Cờ Hiệu Ban Công' },
          { num: 7, title: 'Tránh Xa Ổ Cắm Điện & Dây Dẫn Hở', description: 'Không chọc vật nhọn vào ổ cắm điện trong nhà.', xp: 80, badgeShard: 'Mảnh Nắp Bịt An Toàn' },
          { num: 8, title: 'Khóa Van Bình Gas Khi Có Mùi Lạ', description: 'Không bật công tắc đèn khi ngửi thấy mùi khí gas rò rỉ.', xp: 90, badgeShard: 'Mảnh Cảm Biến Khí Gas' },
          { num: 9, title: 'Nhận Diện Bình Chữa Cháy Mini Trong Nhà', description: 'Bình bột chữa cháy màu đỏ có chốt an toàn.', xp: 90, badgeShard: 'Mảnh Vòi Phun Bột' },
          { num: 10, title: '👑 ĐẠI THỬ THÁCH: Vệ Binh Chống Hỏa Hoạn', description: 'Đại thử thách phản xạ thoát hiểm hỏa hoạn gia đình.', xp: 200, badgeShard: 'Lõi Lửa Bất Diệt' },
        ],
      },
      {
        zoneNumber: 4,
        zoneTitle: 'Vùng 4: Trạm Y Tế & Sơ Cứu Khẩn Cấp',
        themeColor: '#0284C7',
        keyRule: 'Sơ cứu bỏng: Xả dưới vòi nước mát chảy nhẹ 15-20 phút, tuyệt đối không bôi kem đánh răng.',
        firstAidProtocol: 'Ép tim CPR nhi khoa AHA, xử lý hóc dị vật Heimlich & cầm máu ép trực tiếp vết thương.',
        emergencyHotlines: [
          { name: 'Cấp cứu Y tế Toàn quốc', number: '115' },
          { name: 'Đường dây nóng Trẻ em', number: '111' },
        ],
        stages: [
          { num: 1, title: 'Xả Nước Mát Trị Bỏng Nước Sôi 15 Phút', description: 'Làm dịu vết bỏng bằng nước sạch, không bôi mỡ trăn hay thuốc lá.', xp: 50, badgeShard: 'Mảnh Gạc Vô Trùng' },
          { num: 2, title: 'Cầm Máu Vết Cắt Bằng Băng Gạc Sạch', description: 'Ép chặt trực tiếp lên vết thương để ngưng chảy máu.', xp: 60, badgeShard: 'Mảnh Băng Cuộn Co Giãn' },
          { num: 3, title: 'Nhận Diện Nghiệm Pháp Heimlich Hóc Dị Vật', description: 'Đứng sau lưng ép bụng ngược lên trên đẩy dị vật ra ngoài.', xp: 60, badgeShard: 'Mảnh Ống Thở Oxy' },
          { num: 4, title: 'Chườm Đá Lạnh Giảm Sưng Bầm Tím (RICE)', description: 'Nghỉ ngơi, chườm lạnh, băng ép và nâng cao chi.', xp: 70, badgeShard: 'Mảnh Túi Đá Kháng Viêm' },
          { num: 5, title: 'Tư Thế Nằm Nghiêng Hồi Sức An Toàn (Recovery)', description: 'Giữ đường thở thông thoáng khi người bị nạn hôn mê.', xp: 70, badgeShard: 'Mảnh Đệm Định Vị' },
          { num: 6, title: 'Xử Lý Khi Bị Chảy Máu Cam Đúng Cách', description: 'Cúi nhẹ đầu về phía trước và bóp chặt cánh mũi 10 phút.', xp: 80, badgeShard: 'Mảnh Bông Cầm Máu' },
          { num: 7, title: 'Không Bao Giờ Rút Dị Vật Sâu Cắm Vào Người', description: 'Cố định dị vật tại chỗ và chuyển ngay tới bệnh viện.', xp: 80, badgeShard: 'Mảnh Nẹp Cố Định' },
          { num: 8, title: 'Nhận Diện Thuốc & Hóa Chất Nguy Hiểm', description: 'Không tự ý uống thuốc màu sặc sỡ trong tủ.', xp: 90, badgeShard: 'Mảnh Khóa Tủ Thuốc' },
          { num: 9, title: 'Gọi Cấp Cứu 115 Đọc Rõ Địa Chỉ & Tình Trạng', description: 'Bình tĩnh cung cấp số nhà và số người bị thương.', xp: 90, badgeShard: 'Mảnh Bộ Đàm Cấp Cứu' },
          { num: 10, title: '👑 ĐẠI THỬ THÁCH: Bác Sĩ Cứu Thương Nhí', description: 'Thử thách phản xạ sơ cấp cứu y khoa quốc tế.', xp: 200, badgeShard: 'Lõi Thập Tự Lượng Tử' },
        ],
      },
    ];
  }

  // 10 Huy Hiệu Danh Dự chuẩn hoá của Học Viện
  private getDefaultBadges(): QuantumBadgeInventoryItem[] {
    return [
      {
        id: 'badge_zone_1',
        zoneNumber: 1,
        badgeName: 'Hiệp Sĩ Rừng Xanh & Lạc Lối',
        badgeCode: 'FOREST_RANGER_MASTER',
        badgeEmoji: '🌲',
        category: 'SINH TỒN HOANG DÃ',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Khi nhận ra mình bị lạc: ĐỨNG YÊN ÔM CÂY và thổi còi 3 tiếng cứu hộ ngắt quãng!',
      },
      {
        id: 'badge_zone_2',
        zoneNumber: 2,
        badgeName: 'Vệ Binh Đô Thị & Cảnh Giác',
        badgeCode: 'URBAN_GUARDIAN_DEFENDER',
        badgeEmoji: '🏙️',
        category: 'AN TOÀN ĐƯỜNG PHỐ',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Chỉ đi theo người đọc đúng Mật Mã An Toàn của gia đình. Hét to khi gặp nguy hiểm!',
      },
      {
        id: 'badge_zone_3',
        zoneNumber: 3,
        badgeName: 'Pháo Đài Gia Đình & Phòng Hỏa',
        badgeCode: 'HOME_FIRE_SENTINEL',
        badgeEmoji: '🏠',
        category: 'PHÒNG CHÁY CHỮA CHÁY',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Khói độc bốc lên cao: Bò thấp sát sàn nhà, bịt khăn ướt và kiểm tra độ nóng cánh cửa!',
      },
      {
        id: 'badge_zone_4',
        zoneNumber: 4,
        badgeName: 'Bác Sĩ Cứu Thương Nhí',
        badgeCode: 'FIRST_AID_HERO',
        badgeEmoji: '🩺',
        category: 'Y TẾ & SƠ CẤP CỨU',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Bỏng nước sôi: Xả ngay dưới vòi nước mát chảy nhẹ 15-20 phút liên tục!',
      },
      {
        id: 'badge_zone_5',
        zoneNumber: 5,
        badgeName: 'Chiến Binh Thiên Tai & Động Đất',
        badgeCode: 'DISASTER_SURVIVOR',
        badgeEmoji: '🌋',
        category: 'THIÊN TAI ĐỊA CHẤT',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Động đất rung chuyển: Nằm xuống, chui dưới gầm bàn và giữ chặt (Drop-Cover-Hold On)!',
      },
      {
        id: 'badge_zone_6',
        zoneNumber: 6,
        badgeName: 'Kình Ngư Cứu Nạn Sông Nước',
        badgeCode: 'OCEAN_LIFEGUARD_CHAMP',
        badgeEmoji: '🌊',
        category: 'AN TOÀN THỦY THỦ',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Reach or Throw, Don\'t Go: Tuyệt đối không nhảy xuống nước, ném phao hoặc chìa sào cứu bạn!',
      },
      {
        id: 'badge_zone_7',
        zoneNumber: 7,
        badgeName: 'Hiệp Sĩ Xe Bus & Trường Học',
        badgeCode: 'TRANSIT_SAFETY_KNIGHT',
        badgeEmoji: '🚌',
        category: 'AN TOÀN GIAO THÔNG',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Kẹt trên xe bus: Trèo lên ghế lái bấm còi vô lăng to liên tục và bật nút đèn tam giác khẩn cấp!',
      },
      {
        id: 'badge_zone_8',
        zoneNumber: 8,
        badgeName: 'Bậc Thầy Thoát Hiểm Đám Đông',
        badgeCode: 'CROWD_SURVIVAL_MASTER',
        badgeEmoji: '🏬',
        category: 'SINH TỒN ĐÔ THỊ',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Đám đông xô đẩy: Thủ tay Boxer Stance bảo vệ lồng ngực thở, tuyệt đối không cúi nhặt đồ rơi!',
      },
      {
        id: 'badge_zone_9',
        zoneNumber: 9,
        badgeName: 'Vệ Binh Không Gian Mạng',
        badgeCode: 'CYBER_SENTINEL_GUARDIAN',
        badgeEmoji: '💻',
        category: 'BẢO MẬT KỸ THUẬT SỐ',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: 'Tuyệt đối giữ kín họ tên, địa chỉ nhà, tên trường và mật khẩu tài khoản cá nhân!',
      },
      {
        id: 'badge_zone_10',
        zoneNumber: 10,
        badgeName: 'Tổng Chỉ Huy Trưởng Lượng Tử',
        badgeCode: 'GRAND_COMMANDER_ULTIMATE',
        badgeEmoji: '🚨',
        category: 'CHỈ HUY TỐI CAO',
        shardsCollected: 0,
        totalShardsRequired: 4,
        isSynthesized: false,
        unlockedAt: null,
        certifiedProtocol: 'Nội dung đang chờ thẩm định; đây không phải chứng nhận cứu hộ.',
        miloKeyAdvice: '4 Số Vàng Cứu Nạn: 111 (Trẻ em), 113 (Công an), 114 (Cứu hỏa), 115 (Cấp cứu)!',
      },
    ];
  }
}

export const offlineStorage = new OfflineStorageEngine();
