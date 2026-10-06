import { Platform } from 'react-native';
import { apiClient, CURRENT_USER_ID } from './api';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  googleMapsUrl: string;
}

export async function getCurrentEmergencyLocation(): Promise<LocationCoords> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) throw new Error('Chưa hỗ trợ định vị trên thiết bị này.');
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(pos => {
    const {latitude, longitude, accuracy} = pos.coords;
    resolve({latitude, longitude, accuracy, googleMapsUrl: 'https://www.google.com/maps?q=' + latitude + ',' + longitude});
  }, () => reject(new Error('Chưa xác định được vị trí.')), {timeout: 4000, enableHighAccuracy: true}));
}

export async function dispatchSosBeaconToParent(_alertType: 'SOS_SIREN' | 'HAZARD_CRITICAL' | 'SPEED_DIAL' | 'MANUAL', _customMessage?: string, _userId = CURRENT_USER_ID) {
  return {success: false, status: 'DISABLED', message: 'Chưa gửi cảnh báo. Chức năng gửi từ xa chưa được mở.'};
}
