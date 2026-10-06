import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { i18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../services/i18n';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { Globe, Check, X } from 'lucide-react-native';

interface LanguageSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelected?: (lang: SupportedLanguage) => void;
}

export const LanguageSwitcherModal: React.FC<LanguageSwitcherModalProps> = ({
  visible,
  onClose,
  onLanguageSelected,
}) => {
  const currentLang = i18n.getLanguage();

  const handleSelectLang = (code: SupportedLanguage) => {
    soundService.playPop();
    i18n.setLanguage(code);

    const greetingMap: Record<SupportedLanguage, string> = {
      vi: 'Xin chào! Đội Trưởng Milo sẵn sàng cùng bé thám hiểm!',
      en: "Hello! Captain Milo is ready for your adventure!",
      ja: 'こんにちは！マイロ隊長と一緒に冒険しよう！',
      ko: '안녕하세요! 마일로 대장과 함께 탐험을 시작해요!',
      es: '¡Hola! ¡El Capitán Milo está listo para tu aventura!',
    };

    voiceService.speakMilo(greetingMap[code], 'CHEERING');
    onLanguageSelected?.(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.card3D}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <Globe size={22} color="#00F0FF" />
              <Text style={styles.modalTitle}>GLOBAL LANGUAGE / NGÔN NGỮ</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Danh sách 5 Ngôn Ngữ */}
          <View style={styles.langList}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.85}
                  style={[styles.langCard3D, isSelected ? styles.langCardSelected : null]}
                  onPress={() => handleSelectLang(lang.code)}
                >
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  <View style={styles.langNameCol}>
                    <Text style={[styles.nativeNameText, isSelected ? styles.textSelected : null]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={styles.englishNameText}>{lang.name}</Text>
                  </View>
                  {isSelected ? (
                    <View style={styles.checkBadge}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 25, 54, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card3D: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F2C59',
    borderRadius: 26,
    padding: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#1E293B',
    borderRadius: 10,
  },
  langList: {
    gap: 10,
  },
  langCard3D: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#334155',
  },
  langCardSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  flagEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  langNameCol: {
    flex: 1,
  },
  nativeNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  englishNameText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
