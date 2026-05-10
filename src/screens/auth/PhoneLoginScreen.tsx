import React, {useState, useRef} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {requestOtp, setRole} from '../../features/auth/authSlice';

type RootStackParamList = {
  PhoneLogin: undefined;
  Otp: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneLogin'>;

export function PhoneLoginScreen({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {authLoading, selectedRole} = useAppSelector(state => state.auth);
  const [mobile, setMobile] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeAnim]);

  const onSendOtp = async () => {
    if (mobile.trim().length !== 10) {
      // Shake animation for error
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert(
        'Invalid Number', 
        'Please enter a valid 10-digit mobile number',
        [{text: 'OK', onPress: () => inputRef.current?.focus()}]
      );
      return;
    }

    const result = await dispatch(
      requestOtp({mobile: mobile.trim(), role: selectedRole}),
    );

    if (requestOtp.fulfilled.match(result)) {
      navigation.navigate('Otp');
      return;
    }

    const errorMessage = result.payload ?? 'Failed to send OTP. Please try again.';
    Alert.alert('OTP Failed', errorMessage);
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setMobile(cleaned);
    if (cleaned.length === 10 && !showTooltip) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  const getButtonStyle = () => {
    if (mobile.length === 10 && !authLoading) {
      return styles.buttonActive;
    }
    return styles.buttonDisabled;
  };

  const openRoleSelector = () => {
    Alert.alert('Select Role', 'Choose how you want to continue', [
      {
        text: 'User',
        onPress: () => dispatch(setRole('user')),
      },
      {
        text: 'Vendor',
        onPress: () => dispatch(setRole('vendor')),
      },
    ], {cancelable: true});
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <View style={styles.iconRing}>
                  <Text style={styles.iconEmoji}>📱</Text>
                </View>
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Enter your phone number to continue with OTP verification
              </Text>
            </View>

            {/* Phone Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                {mobile.length > 0 && (
                  <View style={styles.charCount}>
                    <Text style={[
                      styles.charCountText,
                      mobile.length === 10 && styles.charCountComplete
                    ]}>
                      {mobile.length}/10
                    </Text>
                  </View>
                )}
              </View>
              
              <Animated.View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                authLoading && styles.inputWrapperDisabled,
                {transform: [{scale: scaleAnim}]}
              ]}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryFlag}>🇮🇳</Text>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <View style={styles.divider} />
                <TextInput
                  ref={inputRef}
                  value={mobile}
                  onChangeText={formatPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#94a3b8"
                  editable={!authLoading}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                {mobile.length > 0 && (
                  <Pressable 
                    onPress={() => setMobile('')}
                    style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>✕</Text>
                  </Pressable>
                )}
              </Animated.View>

              {showTooltip && (
                <Animated.View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>✓ Ready to send!</Text>
                </Animated.View>
              )}

              <View style={styles.helperTextContainer}>
                <View style={styles.helperDot} />
                <Text style={styles.helperText}>
                  We'll send you a 6-digit verification code
                </Text>
              </View>

              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Selected Role</Text>
                <Pressable
                  style={({pressed}) => [
                    styles.roleSelector,
                    pressed && styles.roleSelectorPressed,
                  ]}
                  onPress={openRoleSelector}
                  disabled={authLoading}>
                  <Text style={styles.roleValue}>
                    {selectedRole === 'vendor' ? 'Vendor' : 'User'}
                  </Text>
                  <Text style={styles.roleArrow}>▾</Text>
                </Pressable>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.buttonSection}>
              <Pressable
                style={({pressed}) => [
                  styles.button,
                  getButtonStyle(),
                  pressed && mobile.length === 10 && !authLoading && styles.buttonPressed
                ]}
                onPress={onSendOtp}
                disabled={authLoading || mobile.length !== 10}>
                {authLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>
                      {mobile.length === 10 ? 'Send OTP' : 'Enter 10-digit number'}
                    </Text>
                    {mobile.length === 10 && (
                      <Text style={styles.buttonArrow}>→</Text>
                    )}
                  </View>
                )}
              </Pressable>
            </View>

            {/* Alternative Login Options */}
            {/* <View style={styles.alternativeSection}>
              <View style={styles.dividerLine}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.line} />
              </View>
              
              <View style={styles.socialButtons}>
                <Pressable style={styles.socialButton}>
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={styles.socialText}>Google</Text>
                </Pressable>
                <Pressable style={styles.socialButton}>
                  <Text style={styles.socialIcon}>f</Text>
                  <Text style={styles.socialText}>Facebook</Text>
                </Pressable>
                <Pressable style={styles.socialButton}>
                  <Text style={styles.socialIcon}>🍎</Text>
                  <Text style={styles.socialText}>Apple</Text>
                </Pressable>
              </View>
            </View> */}

            {/* Terms Section */}
            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  
  // Decorative Background
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#667eea10',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#764ba210',
  },
  bgCircle3: {
    position: 'absolute',
    top: '40%',
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f093fb10',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Input Section
  inputSection: {
    marginBottom: 32,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    letterSpacing: 0.3,
  },
  charCount: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  charCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#718096',
  },
  charCountComplete: {
    color: '#48bb78',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  inputWrapperFocused: {
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  inputWrapperDisabled: {
    backgroundColor: '#f7fafc',
    borderColor: '#e2e8f0',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f7fafc',
    height: '100%',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#a0aec0',
    fontWeight: '600',
  },
  tooltip: {
    backgroundColor: '#48bb78',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  helperDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a0aec0',
    marginRight: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#a0aec0',
  },
  roleSection: {
    marginTop: 18,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    paddingHorizontal: 4,
    letterSpacing: 0.3,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  roleSelectorPressed: {
    transform: [{scale: 0.99}],
  },
  roleValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3748',
  },
  roleArrow: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '700',
  },

  // Button Section
  buttonSection: {
    marginBottom: 32,
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowColor: '#cbd5e1',
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
    paddingVertical: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
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
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },

  // Alternative Section
  alternativeSection: {
    marginBottom: 24,
  },
  dividerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#a0aec0',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  socialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
  },

  // Terms Section
  termsSection: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
