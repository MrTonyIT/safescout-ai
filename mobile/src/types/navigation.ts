import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Family: {report?:{checkpointId:string;contentVersion:string;title:string}} | undefined;
  WorldMap: { refresh?: boolean; showTour?: boolean } | undefined;
  QuestTest: {
    checkpointId: string;
    lessonTitle: string;
    zoneTitle: string;
    themeColor: string;
  };
  Scanner: undefined;
  Inventory: undefined;
  Sos: undefined;
  ParentAuth: undefined;
  ParentDashboard: { verifiedPin: string };
};

export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type WorldMapScreenProps = NativeStackScreenProps<RootStackParamList, 'WorldMap'>;
export type QuestTestScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestTest'>;
export type ScannerScreenProps = NativeStackScreenProps<RootStackParamList, 'Scanner'>;
export type InventoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Inventory'>;
export type SosScreenProps = NativeStackScreenProps<RootStackParamList, 'Sos'>;
export type ParentAuthScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentAuth'>;
export type ParentDashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'ParentDashboard'>;
