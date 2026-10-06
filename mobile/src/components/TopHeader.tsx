import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../theme/colors';
import { UserProfile } from '../types/curriculum';
import { Shield, Star, Award, Zap, Flame, Heart } from 'lucide-react-native';

interface TopHeaderProps {
  user?: UserProfile;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user }) => {
  const currentXp = user?.totalSafetyScore ?? 0;
  const nextLevelXp = 1000;
  const progressPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerGlassCard}>
        {/* User Avatar & Level Ring */}
        <View style={styles.profileSection}>
          <View style={styles.avatar3DRing}>
            <View style={styles.avatarInnerCircle}>
              <Shield size={22} color="#FFFFFF" fill="#FF6B35" />
            </View>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>LV {user?.explorerLevel ?? 1}</Text>
            </View>
          </View>

          <View style={styles.userNamesCol}>
            <Text style={styles.userNameText} numberOfLines={1}>{user?.nickname || 'Học cùng Milo'}</Text>
            {/* XP Progress Bar */}
            <View style={styles.xpProgressWrapper}>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.xpFractionText}>{currentXp}/{nextLevelXp} XP</Text>
            </View>
          </View>
        </View>

        {/* Currency & Badges Pills (Duolingo / Mario Style) */}
        <View style={styles.statsPillGroup}>
          {/* Huy Hiệu */}
          <View style={[styles.statPill, styles.badgePill]}>
            <Award size={16} color="#0284C7" fill="#0284C7" />
            <Text style={[styles.statNumberText, { color: '#0369A1' }]}>{user?.totalBadges ?? 0}</Text>
          </View>

          {/* Tổng Sao Vàng */}
          <View style={[styles.statPill, styles.starPill]}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.statNumberText, { color: '#B45309' }]}>
              {`${user?.completionRate ?? 0}%`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#0F2C59',
    borderBottomWidth: 3,
    borderBottomColor: '#071936',
  },
  headerGlassCard: {
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  profileSection: {
    minWidth: 230,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar3DRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarInnerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTag: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FACC15',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  levelTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
  },
  userNamesCol: {
    marginLeft: 10,
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  xpProgressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  xpTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  xpFractionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  statsPillGroup: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 3.5,
    gap: 4,
  },
  flamePill: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FB923C',
  },
  badgePill: {
    backgroundColor: '#E0F2FE',
    borderColor: '#38BDF8',
  },
  starPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
  },
  statNumberText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
