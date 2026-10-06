export interface MedicalStandardItem {
  id: string;
  authority: 'AHA_2024' | 'IFRC' | 'ILS' | 'FEMA';
  title: string;
  protocolSummary: string;
  vitalMetric: string;
  contraindications: string;
}

export const CERTIFIED_MEDICAL_STANDARDS: MedicalStandardItem[] = [
  {
    id: 'std_cpr',
    authority: 'AHA_2024',
    title: 'Phác Đồ Hồi Sinh Tim Phổi Nhi Khoa (CPR)',
    protocolSummary: 'Tỉ lệ 30 lần ép ngực : 2 lần thổi ngạt liên tục.',
    vitalMetric: 'Tần số 100-120 nhịp/phút (Giai điệu Stayin Alive)',
    contraindications: 'Không ép ngực khi nạn nhân còn tỉnh táo thở bình thường.',
  },
  {
    id: 'std_burn',
    authority: 'IFRC',
    title: 'Phác Đồ Sơ Cứu Bỏng Nhiệt Độ Thường',
    protocolSummary: 'Xả dưới vòi nước mát chảy nhẹ 15-20 phút rồi băng gạc vô khuẩn.',
    vitalMetric: 'Nhiệt độ nước 15°C - 25°C trong 15-20 phút',
    contraindications: 'Tuyệt đối CẤM chườm đá lạnh, bôi kem đánh răng, nước mắm hay mỡ trăn.',
  },
  {
    id: 'std_drown',
    authority: 'ILS',
    title: 'Phác Đồ Cứu Đuối Gián Tiếp (Reach, Throw, Don\'t Go)',
    protocolSummary: 'Đưa cành cây, sào dài hoặc ném can nhựa/phao, tuyệt đối không nhảy xuống.',
    vitalMetric: 'Khoảng cách an toàn tối thiểu 2 mét bờ',
    contraindications: 'Trẻ em dưới 18 tuổi chưa qua huấn luyện cứu hộ tuyệt đối không nhảy xuống nước cứu người.',
  },
];
