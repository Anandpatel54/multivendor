import React, {useState, useRef, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {verifyOtp} from '../../features/auth/authSlice';

const {width} = Dimensions.get('window');

type RootStackParamList = {
  PhoneLogin: undefined;
  Otp: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {pendingMobile, authLoading} = useAppSelector(state => state.auth);
  const [code, setCode] = useState(['', '', '', '']); // 4-digit OTP
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, canResend]);

  const handleCodeChange = (text: string, index: number) => {
    const numericText = text.replace(/\D/g, '');

    if (numericText.length > 1) {
      // Handle paste/fill from current index onward
      const pastedCode = numericText.slice(0, 4 - index);
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length; i++) {
        const targetIndex = index + i;
        if (targetIndex < 4) newCode[targetIndex] = pastedCode[i];
      }
      setCode(newCode);
      const lastIndex = Math.min(index + pastedCode.length, 3);
      inputRefs.current[lastIndex]?.focus();
      setActiveIndex(lastIndex);
      return;
    }

    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    // Move to next input
    if (numericText && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const onVerify = async () => {
    const otpCode = code.join('');
    if (otpCode.length < 4) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP.');
      return;
    }

    const result = await dispatch(verifyOtp({code: otpCode}));
    if (verifyOtp.fulfilled.match(result)) {
      return;
    }

    const errorMessage = result.payload ?? 'OTP verification failed. Please try again.';
    Alert.alert('Invalid OTP', errorMessage);
  };

  const onResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    // Trigger resend OTP API here
    // await dispatch(resendOtp({mobile: pendingMobile}));
    Alert.alert('OTP Sent', 'A new OTP has been sent to your number');
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'your number';
    if (phone.length !== 10) return phone;
    return `${phone.slice(0, 2)}****${phone.slice(-4)}`;
  };

  const getOtpDisplay = () => {
    return code.join('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Decorative Background */}
        <View style={styles.bgGradient}>
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
        </View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}]
            }
          ]}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>🔐</Text>
              </View>
            </View>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to{' '}
              <Text style={styles.phoneNumber}>
                {formatPhoneNumber(pendingMobile)}
              </Text>
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.otpBoxWrapper}>
                <TextInput
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    digit && styles.otpBoxFilled,
                    activeIndex === index && styles.otpBoxActive,
                  ]}
                  placeholder="•"
                  placeholderTextColor="#cbd5e1"
                  editable={!authLoading}
                  onFocus={() => setActiveIndex(index)}
                  textAlign="center"
                />
                {digit ? (
                  <View style={styles.otpDot}>
                    <Text style={styles.otpDotText}>●</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          {/* Hidden OTP Display (for assistive tech) */}
          <View style={styles.hiddenOtpContainer}>
            <Text style={styles.hiddenOtpLabel}>Entered OTP: {getOtpDisplay() || '____'}</Text>
          </View>

          {/* Timer Section */}
          <View style={styles.timerSection}>
            {!canResend ? (
              <View style={styles.timerContainer}>
                <Text style={styles.timerIcon}>⏱️</Text>
                <Text style={styles.timerText}>
                  Resend code in {timer} seconds
                </Text>
              </View>
            ) : (
              <Pressable onPress={onResendOtp} style={styles.resendButton}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </Pressable>
            )}
          </View>

          {/* Verify Button */}
          <Pressable
            style={({pressed}) => [
              styles.button,
              (authLoading || code.join('').length !== 4) && styles.buttonDisabled,
              pressed && !authLoading && code.join('').length === 4 && styles.buttonPressed
            ]}
            onPress={onVerify}
            disabled={authLoading || code.join('').length !== 4}>
            {authLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>Verifying...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Verify & Continue</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
            )}
          </Pressable>

          {/* Alternative Actions */}
          <View style={styles.alternativeActions}>
            <Pressable 
              onPress={() => navigation.navigate('PhoneLogin')}
              style={styles.actionButton}>
              <Text style={styles.actionIcon}>✕</Text>
              <Text style={styles.actionText}>Change number</Text>
            </Pressable>
            
            <View style={styles.actionDivider} />
            
            <Pressable 
              onPress={() => {
                Alert.alert(
                  'Need Help?',
                  'If you are not receiving the OTP, please check your network connection or try again later.',
                  [{text: 'OK'}]
                );
              }}
              style={styles.actionButton}>
              <Text style={styles.actionIcon}>?</Text>
              <Text style={styles.actionText}>Need help?</Text>
            </Pressable>
          </View>

          {/* Terms Hint */}
          <View style={styles.termsHint}>
            <Text style={styles.termsHintText}>
              The OTP is valid for 5 minutes
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#667eea08',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#764ba208',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneNumber: {
    fontWeight: '700',
    color: '#667eea',
  },

  // OTP Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpBoxWrapper: {
    position: 'relative',
    width: (width - 96) / 4,
  },
  otpBox: {
    width: (width - 96) / 4,
    height: (width - 96) / 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: '#667eea',
    backgroundColor: '#f7f9ff',
  },
  otpBoxActive: {
    borderColor: '#667eea',
    borderWidth: 2,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  otpDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -2,
    marginLeft: -2,
  },
  otpDotText: {
    fontSize: 12,
    color: '#667eea',
  },
  hiddenOtpContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  hiddenOtpLabel: {
    fontSize: 1,
  },

  // Timer Section
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 40,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerIcon: {
    fontSize: 14,
  },
  timerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },

  // Button Section
  button: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    transform: [{scale: 0.97}],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },

  // Alternative Actions
  alternativeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionIcon: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
  },

  // Terms Hint
  termsHint: {
    alignItems: 'center',
  },
  termsHintText: {
    fontSize: 12,
    color: '#a0aec0',
  },
});
