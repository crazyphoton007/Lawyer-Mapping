// my-app/app/splash.tsx
import { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const BG = "#000000"; // pure black

export default function Splash() {
  const router = useRouter();

  // fade-in animation for logo
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  // ✅ ONLY 1 SECOND ON SPLASH, THEN GO TO LOGIN
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        router.replace("/login");
      }
    }, 1000); // 1 second

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/splash.png")}
        style={[styles.logo, { opacity }]}
        resizeMode="contain"
      />
      <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 320,
    height: 320,
  },
  spinner: {
    marginTop: 24,
  },
});
