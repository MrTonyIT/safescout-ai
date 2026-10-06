import { RELEASE } from '../config/release';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Map, Scan, Award, Flame, Users } from 'lucide-react-native';

export interface MeasuredTabLayouts {
  wrapper?: { x: number; y: number; width: number; height: number };
  container?: { x: number; y: number; width: number; height: number };
  map?: { x: number; y: number; width: number; height: number };
  ai?: { x: number; y: number; width: number; height: number };
  backpack?: { x: number; y: number; width: number; height: number };
  sos?: { x: number; y: number; width: number; height: number };
  parent?: { x: number; y: number; width: number; height: number };
}

interface BottomNavBarProps {
  activeTab?: 'map' | 'ai' | 'backpack' | 'badges' | 'sos' | 'parent';
  onTabPress?: (tab: 'map' | 'ai' | 'backpack' | 'badges' | 'sos' | 'parent') => void;
  onTabLayoutsMeasured?: (layouts: MeasuredTabLayouts) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'map',
  onTabPress,
  onTabLayoutsMeasured,
}) => {
  const isBackpack = activeTab === 'backpack' || activeTab === 'badges';
  const isSos = activeTab === 'sos';
  const measured = React.useRef<MeasuredTabLayouts>({}).current;

  const report = () => {
    if (onTabLayoutsMeasured) {
      onTabLayoutsMeasured({ ...measured });
    }
  };

  return (
    <View
      style={styles.dockWrapper}
      pointerEvents="box-none"
      onLayout={(e) => {
        measured.wrapper = e.nativeEvent.layout;
        report();
      }}
    >
      <View
        style={styles.dockContainer}
        onLayout={(e) => {
          measured.container = e.nativeEvent.layout;
          report();
        }}
      >
        {/* Tab 1: 🗺️ Bản Đồ Thế Giới */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onTabPress?.('map')}
          onLayout={(e) => {
            measured.map = e.nativeEvent.layout;
            report();
          }}
          style={[styles.dockItem, activeTab === 'map' ? styles.dockItemActive : null]}
        >
          <View style={[styles.iconCircle, activeTab === 'map' ? styles.iconCircleActiveMap : null]}>
            <Map size={17} color={activeTab === 'map' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'map' ? styles.tabLabelActiveMap : null]}>
            Học
          </Text>
        </TouchableOpacity>

        {RELEASE.scanner && <>
        {/* Tab 2: 👁️ Quét AI */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onTabPress?.('ai')}
          onLayout={(e) => {
            measured.ai = e.nativeEvent.layout;
            report();
          }}
          style={[styles.dockItem, activeTab === 'ai' ? styles.dockItemActive : null]}
        >
          <View style={[styles.iconCircle, activeTab === 'ai' ? styles.iconCircleActiveAi : null]}>
            <Scan size={17} color={activeTab === 'ai' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'ai' ? styles.tabLabelActiveAi : null]}>
            Quét AI
          </Text>
        </TouchableOpacity>

        </>}
        {/* Tab 3: 🎒 Balo Lượng Tử */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onTabPress?.('backpack')}
          onLayout={(e) => {
            measured.backpack = e.nativeEvent.layout;
            report();
          }}
          style={[styles.dockItem, isBackpack ? styles.dockItemActive : null]}
        >
          <View style={[styles.iconCircle, isBackpack ? styles.iconCircleActiveBackpack : null]}>
            <Award size={17} color={isBackpack ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={[styles.tabLabel, isBackpack ? styles.tabLabelActiveBackpack : null]}>
            Balo
          </Text>
        </TouchableOpacity>

        {RELEASE.remoteSos && <>
        {/* Tab 4: 🆘 Cứu Hộ SOS */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onTabPress?.('sos')}
          onLayout={(e) => {
            measured.sos = e.nativeEvent.layout;
            report();
          }}
          style={[styles.dockItem, isSos ? styles.dockItemActive : null]}
        >
          <View style={[styles.iconCircle, isSos ? styles.iconCircleActiveSos : null]}>
            <Flame size={17} color={isSos ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={[styles.tabLabel, isSos ? styles.tabLabelActiveSos : null]}>
            Cứu Hộ
          </Text>
        </TouchableOpacity>

        </>}
        {/* Tab 5: 👨‍👩‍👧 Ba Mẹ */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={() => onTabPress?.('parent')}
          onLayout={(e) => {
            measured.parent = e.nativeEvent.layout;
            report();
          }}
          style={[styles.dockItem, activeTab === 'parent' ? styles.dockItemActive : null]}
        >
          <View style={[styles.iconCircle, activeTab === 'parent' ? styles.iconCircleActiveParent : null]}>
            <Users size={17} color={activeTab === 'parent' ? '#FFFFFF' : '#94A3B8'} />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'parent' ? styles.tabLabelActiveParent : null]}>
            Ba Mẹ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  dockContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F2C59',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#1E3A8A',
    borderBottomColor: '#071936',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  dockItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  dockItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071936',
  },
  iconCircleActiveMap: {
    backgroundColor: '#0284C7',
  },
  iconCircleActiveAi: {
    backgroundColor: '#00F0FF',
  },
  iconCircleActiveBackpack: {
    backgroundColor: '#F59E0B',
  },
  iconCircleActiveSos: {
    backgroundColor: '#EF4444',
  },
  iconCircleActiveParent: {
    backgroundColor: '#8B5CF6',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 1,
  },
  tabLabelActiveMap: {
    color: '#38BDF8',
    fontWeight: '900',
  },
  tabLabelActiveAi: {
    color: '#00F0FF',
    fontWeight: '900',
  },
  tabLabelActiveBackpack: {
    color: '#FDE047',
    fontWeight: '900',
  },
  tabLabelActiveSos: {
    color: '#F87171',
    fontWeight: '900',
  },
  tabLabelActiveParent: {
    color: '#C4B5FD',
    fontWeight: '900',
  },
});
