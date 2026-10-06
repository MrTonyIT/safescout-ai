export interface EncryptedGeoPayload {
  cipherText: string;
  ephemeralPublicKey: string;
  nonce: string;
  algorithm: 'CURVE25519_AES_256_GCM';
  timestamp: string;
  signature: string;
}

export interface DecryptedGeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string;
  isVerified: boolean;
}

class EndToEndEncryptionSecurity {
  private readonly PARENT_PUBLIC_KEY = 'PUB_CURVE25519_MILO_PARENT_49A8F';
  private readonly PARENT_PRIVATE_KEY = 'PRIV_CURVE25519_MILO_PARENT_SECRET_KEY';

  /**
   * Mã hóa tọa độ GPS của trẻ bằng Public Key của cha mẹ trước khi truyền lên Server
   */
  public encryptCoordinates(
    lat: number,
    lng: number,
    accuracy: number = 5,
  ): EncryptedGeoPayload {
    throw new Error('Mã hóa đầu cuối chưa được triển khai.');
  }

  /**
   * Giải mã tọa độ GPS trên cổng phụ huynh bằng Private Key bí mật
   */
  public decryptCoordinates(payload: EncryptedGeoPayload): DecryptedGeoLocation {
    throw new Error('Không thể xác minh hoặc giải mã dữ liệu.');
  }
}

export const e2eeSecurity = new EndToEndEncryptionSecurity();
