export interface GuardianContact {
  id: string;
  name: string;
  role: 'PRIMARY_PARENT' | 'SECONDARY_FAMILY' | 'TEACHER' | 'NEIGHBOR';
  phone: string;
  priorityTier: 1 | 2 | 3;
  status: 'READY' | 'NOTIFIED' | 'CONFIRMED_EN_ROUTE';
}

class MultiTierGuardianRing {
  private guardians: GuardianContact[] = [
    {
      id: 'g_1',
      name: 'Mẹ Thu Hà (Chính)',
      role: 'PRIMARY_PARENT',
      phone: '0901234567',
      priorityTier: 1,
      status: 'NOTIFIED',
    },
    {
      id: 'g_2',
      name: 'Ông Nội (Dự phòng Cấp 2)',
      role: 'SECONDARY_FAMILY',
      phone: '0912345678',
      priorityTier: 2,
      status: 'READY',
    },
    {
      id: 'g_3',
      name: 'Cô Giáo Mai (Chủ Nhiệm)',
      role: 'TEACHER',
      phone: '0987654321',
      priorityTier: 2,
      status: 'READY',
    },
    {
      id: 'g_4',
      name: 'Tổng Đài Bảo Vệ Trẻ Em (111)',
      role: 'NEIGHBOR',
      phone: '111',
      priorityTier: 3,
      status: 'READY',
    },
  ];

  public getGuardians(): GuardianContact[] {
    return this.guardians;
  }

  public dispatchSosToGuardians(): GuardianContact[] {
    this.guardians[0].status = 'NOTIFIED';
    // Sau 45s mô phỏng nếu ba mẹ chưa ack, tự động kích hoạt Cấp 2
    setTimeout(() => {
      this.guardians[1].status = 'NOTIFIED';
      this.guardians[2].status = 'NOTIFIED';
    }, 2000);
    return this.guardians;
  }
}

export const guardianRing = new MultiTierGuardianRing();
