import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { MiloEmotion } from '../types/curriculum';
import { Shield, Sparkles, HelpCircle, AlertOctagon } from 'lucide-react-native';

const PUP_MASCOT_IMG = require('../../assets/milo_rescue_pup.png');

interface MiloAvatarProps {
  emotion?: MiloEmotion;
  size?: number;
  speechText?: string;
  actionRequired?: string | null;
}

export const MiloAvatar: React.FC<MiloAvatarProps> = ({
  emotion = 'IDLE',
  size = 64,
  speechText,
  actionRequired,
}) => {
  const getEmotionConfig = () => {
    switch (emotion) {
      case 'CHEERING':
        return {
          bgColor: '#FEF3C7',
          borderColor: COLORS.quantumYellow,
          icon: <Sparkles size={size * 0.25} color="#FFFFFF" fill="#FFE66D" />,
          label: 'Milo Vui Mừng! 🎉',
          badgeColor: '#F59E0B',
        };
      case 'THINKING':
        return {
          bgColor: '#E0F2FE',
          borderColor: '#38BDF8',
          icon: <HelpCircle size={size * 0.25} color="#FFFFFF" />,
          label: 'Milo Đang Quét... 🔍',
          badgeColor: '#0284C7',
        };
      case 'DANGER_ALERT':
        return {
          bgColor: '#FEE2E2',
          borderColor: COLORS.danger,
          icon: <AlertOctagon size={size * 0.25} color="#FFFFFF" />,
          label: 'CẢNH BÁO SOS! 🚨',
          badgeColor: COLORS.danger,
        };
      case 'IDLE':
      default:
        return {
          bgColor: '#FFEDD5',
          borderColor: COLORS.primaryOrange,
          icon: <Shield size={size * 0.25} color="#FFFFFF" fill="#FF6B35" />,
          label: 'Đội Trưởng Milo 🐕‍🦺',
          badgeColor: COLORS.primaryBlue,
        };
    }
  };

  const config = getEmotionConfig();

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        {/* Avatar Milo 3D Rescue Golden Pup */}
        <View
          style={[
            styles.avatarCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: config.borderColor,
            },
          ]}
        >
          <Image
            source={PUP_MASCOT_IMG}
            style={{
              width: size * 1.3,
              height: size * 1.3,
              top: -size * 0.1,
            }}
            resizeMode="contain"
          />
          {/* Huy hiệu nhỏ ở góc */}
          <View
            style={[
              styles.badgePin,
              {
                backgroundColor: config.badgeColor,
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: (size * 0.35) / 2,
              },
            ]}
          >
            {config.icon}
          </View>
        </View>

        {/* Hộp thoại lời nói của Milo */}
        {speechText ? (
          <View style={styles.bubbleContainer}>
            <View style={[styles.nameBadge, { backgroundColor: config.badgeColor }]}>
              <Text style={styles.nameText}>{config.label}</Text>
            </View>
            <Text style={styles.speechText}>{speechText}</Text>
            {actionRequired ? (
              <View style={styles.actionBox}>
                <Text style={styles.actionText}>👉 {actionRequired}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    backgroundColor: '#0F2C59',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    position: 'relative',
  },
  badgePin: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  bubbleContainer: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2.5,
    borderBottomWidth: 4,
    borderColor: '#0F2C59',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  nameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  speechText: {
    color: '#0F2C59',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionBox: {
    marginTop: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  actionText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '800',
  },
});
