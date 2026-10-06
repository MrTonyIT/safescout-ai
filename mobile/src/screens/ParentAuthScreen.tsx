import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ParentAuthScreenProps } from '../types/navigation';
import { verifyParentPin, updateParentPin } from '../services/api';
import { soundService } from '../services/sound';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ArrowLeft,
  Delete,
  RotateCcw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';

export const ParentAuthScreen: React.FC<ParentAuthScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Chế độ đổi mã PIN
  const [isChangePinMode, setIsChangePinMode] = useState<boolean>(false);
  const [oldPin, setOldPin] = useState<string>('');
  const [newPinStep, setNewPinStep] = useState<'ENTER_OLD' | 'ENTER_NEW'>('ENTER_OLD');

  // Math Challenge Fallback khi sai 3 lần
  const [mathAnswer, setMathAnswer] = useState<string>('');
  const mathQuestion = { q: '14 × 6 = ?', ans: '84' };

  useEffect(() => {
    let interval: any = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  const handleKeyPress = (num: string) => {
    if (lockoutTimer > 0) return;
    soundService.playPop();

    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMessage(null);

      if (nextPin.length === 4) {
        handleCompletePin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    soundService.playPop();
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    soundService.playPop();
    setPin('');
    setErrorMessage(null);
  };

  const handleCompletePin = async (completedPin: string) => {
    setIsVerifying(true);

    if (isChangePinMode) {
      if (newPinStep === 'ENTER_OLD') {
        const isValid = await verifyParentPin(completedPin);
        setIsVerifying(false);
        if (isValid) {
          soundService.playSuccessSound();
          setOldPin(completedPin);
          setPin('');
          setNewPinStep('ENTER_NEW');
        } else {
          soundService.playAlertSound();
          setErrorMessage('Mã PIN hiện tại không đúng.');
          setPin('');
        }
      } else {
        // Đặt PIN mới
        const res = await updateParentPin(oldPin, completedPin);
        setIsVerifying(false);
        if (!res.success) { setErrorMessage(res.message); setPin(''); return; }
        soundService.playSuccessSound();
        Alert.alert('Thành công', 'Đã đổi mã PIN phụ huynh mới thành công!', [
          {
            text: 'Vào Bảng Điều Khiển',
            onPress: () => {
              navigation.replace('ParentDashboard', { verifiedPin: completedPin });
            },
          },
        ]);
      }
      return;
    }

    // Chế độ đăng nhập bình thường
    const isValid = await verifyParentPin(completedPin);
    setIsVerifying(false);

    if (isValid) {
      soundService.playSuccessSound();
      navigation.replace('ParentDashboard', { verifiedPin: completedPin });
    } else {
      soundService.playAlertSound();
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      setPin('');

      if (nextFails >= 3) {
        setLockoutTimer(60);
        setErrorMessage('Nhập sai 3 lần. Tạm khóa 60 giây hoặc giải phép tính bên dưới.');
      } else {
        setErrorMessage(`Mã PIN không đúng! Còn ${3 - nextFails} lần thử.`);
      }
    }
  };

  const handleVerifyMathAnswer = () => {
    if (mathAnswer.trim() === mathQuestion.ans) {
      soundService.playSuccessSound();
      setLockoutTimer(0);
      setFailedAttempts(0);
      setErrorMessage(null);
      setErrorMessage('Hãy nhập đúng mã PIN để tiếp tục.');
    } else {
      soundService.playAlertSound();
      setErrorMessage('Kết quả phép tính chưa đúng. Vui lòng thử lại!');
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#071936" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            soundService.playPop();
            navigation.navigate('WorldMap');
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTag}>BẢO VỆ COPPA PARENTAL GATE</Text>
          <Text style={styles.headerTitle}>
            {isChangePinMode ? 'Đổi Mã PIN Phụ Huynh' : 'Cổng Dành Cho Ba Mẹ 🛡️'}
          </Text>
        </View>
      </View>

      <View style={styles.authBody}>
        {/* Biểu tượng Ổ Khóa 3D */}
        <View style={styles.lockIconCircle}>
          <KeyRound size={34} color="#FFE66D" />
        </View>

        <Text style={styles.authPromptTitle}>
          {isChangePinMode
            ? newPinStep === 'ENTER_OLD'
              ? 'Nhập Mã PIN Hiện Tại'
              : 'Nhập 4 Số PIN Mới'
            : 'Nhập Mã PIN Phụ Huynh'}
        </Text>
        <Text style={styles.authPromptSub}>
          {isChangePinMode
            ? 'Cài đặt mã PIN mới để bảo vệ cài đặt thời gian và báo cáo'
            : 'Khu vực bảo mật chứa báo cáo điểm yếu an toàn & thời lượng học của bé'}
        </Text>

        {/* 4 Chấm tròn hiển thị mã PIN */}
        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  isFilled ? styles.pinDotFilled : null,
                  errorMessage ? styles.pinDotError : null,
                ]}
              />
            );
          })}
        </View>

        {/* Thông báo lỗi hoặc đếm ngược khóa */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {lockoutTimer > 0 ? (
          <View style={styles.lockoutBox}>
            <Text style={styles.lockoutText}>
              ⏳ Tạm khóa trong {lockoutTimer}s. Ba mẹ có thể nhập đáp án: {mathQuestion.q}
            </Text>
            <View style={styles.mathRow}>
              <TouchableOpacity
                style={styles.mathQuickAnsBtn}
                onPress={() => {
                  setMathAnswer('84');
                  handleVerifyMathAnswer();
                }}
              >
                <Text style={styles.mathQuickAnsText}>Tôi là người lớn (Mở khóa ngay)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {isVerifying ? (
          <ActivityIndicator size="small" color="#FFE66D" style={{ marginVertical: 10 }} />
        ) : null}

        {/* Bàn Phím Số Chunky 3D (Custom Numeric Keypad) */}
        <View style={styles.keypadContainer}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['C', '0', '⌫'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((k) => {
                const isClear = k === 'C';
                const isDelete = k === '⌫';
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.75}
                    style={[
                      styles.keypadBtn3D,
                      isClear || isDelete ? styles.keypadBtnSpecial : null,
                    ]}
                    onPress={() => {
                      if (isClear) handleClear();
                      else if (isDelete) handleDelete();
                      else handleKeyPress(k);
                    }}
                  >
                    <Text
                      style={[
                        styles.keypadBtnText,
                        isClear || isDelete ? styles.keypadSpecialText : null,
                      ]}
                    >
                      {k}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Chuyển chế độ đổi mã PIN */}
        <TouchableOpacity
          style={styles.toggleChangePinBtn}
          onPress={() => {
            soundService.playPop();
            setIsChangePinMode(!isChangePinMode);
            setPin('');
            setErrorMessage(null);
            setNewPinStep('ENTER_OLD');
          }}
        >
          <Text style={styles.toggleChangePinText}>
            {isChangePinMode ? '← Quay lại Đăng Nhập' : '🔑 Đổi Mã PIN Phụ Huynh Mới'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#071936',
    width: '100%',
    height: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0A1E3F',
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerTag: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  authBody: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F2C59',
    borderWidth: 2.5,
    borderColor: '#FFE66D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  authPromptTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  authPromptSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 20,
    lineHeight: 17,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#64748B',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#FFE66D',
    borderColor: '#FFE66D',
    transform: [{ scale: 1.15 }],
  },
  pinDotError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  lockoutBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockoutText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  mathRow: {
    marginTop: 6,
  },
  mathQuickAnsBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mathQuickAnsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 10,
    marginTop: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadBtn3D: {
    width: 78,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadBtnSpecial: {
    backgroundColor: '#0F2C59',
    borderColor: '#1E3A8A',
  },
  keypadBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  keypadSpecialText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  toggleChangePinBtn: {
    marginTop: 18,
    paddingVertical: 6,
  },
  toggleChangePinText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
});
