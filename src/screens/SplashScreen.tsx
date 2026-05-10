import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Logo animation sequence
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [fadeAnim, rotateAnim, scaleAnim, translateYAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.container}>
        <View style={styles.backgroundGradient}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoRing,
                {
                  transform: [{ rotate: rotateInterpolate }],
                },
              ]}
            />
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>MV</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            <Text style={styles.title}>
              Multi
              <Text style={styles.titleAccent}>Vendor</Text>
            </Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>Your Trusted Marketplace</Text>
            <View style={styles.loaderContainer}>
              <View style={styles.loader}>
                <View style={styles.loaderDot} />
                <View style={[styles.loaderDot, styles.loaderDot2]} />
                <View style={[styles.loaderDot, styles.loaderDot3]} />
              </View>
              <Text style={styles.loadingText}>Loading amazing deals...</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 MultiVendor</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    bottom: -width * 0.3,
    left: -width * 0.3,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    top: height * 0.3,
    left: width * 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#38bdf8',
    borderRightColor: '#a855f7',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#38bdf8',
  },
  divider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  loaderDot2: {
    backgroundColor: '#a855f7',
    opacity: 0.8,
  },
  loaderDot3: {
    backgroundColor: '#ec4899',
    opacity: 1,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
  },
});

// For React Native, you'll need to use a library like react-native-linear-gradient for gradients
// Install: npm install react-native-linear-gradient
// Then replace the backgroundColor with LinearGradient component
