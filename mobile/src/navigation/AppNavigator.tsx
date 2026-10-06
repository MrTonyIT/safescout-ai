import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { WelcomeScreen as OnboardingScreen, LearningHomeScreen as WorldMapScreen, LessonScreen as QuestTestScreen } from '../screens/LearningFlow';
import { UnavailableScreen } from '../screens/UnavailableScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import {CollectionScreen} from '../screens/CollectionScreen';
import {fetchMode} from '../services/api';
import {Action,Frame,Notice} from '../components/LearningUI';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [familyMode,setFamilyMode]=useState(false),[error,setError]=useState('');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setError('');
      const mode=await fetchMode();
      if(!mode.internal&&!mode.families){setError('Ứng dụng chưa được mở trên máy chủ này.');return;}
      setFamilyMode(mode.families);
      if(mode.families){setInitialRoute('Onboarding');return;}
      const hasOnboarded = await AsyncStorage.getItem('milo_has_onboarded_v1');
      if (hasOnboarded === 'true') {
        setInitialRoute('WorldMap');
      } else {
        setInitialRoute('Onboarding');
      }
    } catch (e) {
      setError('Chưa kết nối máy chủ. Hãy kiểm tra kết nối rồi thử lại.');
    }
  };

  if (!initialRoute) {
    if(error)return <Frame title="Milo"><Notice text={error}/><Action label="Kết nối lại" onPress={checkOnboardingStatus}/></Frame>;
    return (
      <View style={{ flex: 1, backgroundColor: '#071936', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00F0FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        animation: 'none',
          contentStyle: { backgroundColor: '#071936' },
        }}
      >
        <Stack.Screen name="Onboarding" component={familyMode?FamilyScreen:OnboardingScreen} />
        <Stack.Screen name="WorldMap" component={WorldMapScreen} />
        <Stack.Screen name="QuestTest" component={QuestTestScreen} />
        <Stack.Screen name="Scanner" component={UnavailableScreen} />
        <Stack.Screen name="Inventory" component={CollectionScreen} />
        <Stack.Screen name="Sos" component={UnavailableScreen} />
        <Stack.Screen name="ParentAuth" component={UnavailableScreen} />
        <Stack.Screen name="Family" component={familyMode?FamilyScreen:UnavailableScreen} />
        <Stack.Screen name="ParentDashboard" component={UnavailableScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
