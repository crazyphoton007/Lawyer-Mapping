import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

const BG = "#F7F8FA";
const INK = "#0B1220";
const WHITE = "#FFFFFF";
const MUTED = "#6B7280";

export default function CourtConnectViewer() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; url?: string }>();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const targetUrl = typeof params.url === "string" ? params.url : "";
  const title = typeof params.title === "string" ? params.title : "Court Connect";

  const goBack = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return;
    }
    router.back();
  }, [canGoBack, router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goBack();
        return true;
      });

      return () => sub.remove();
    }, [goBack])
  );

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={28} color={WHITE} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            Official portal
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {targetUrl ? (
        <View style={styles.webWrap}>
          <WebView
            ref={webViewRef}
            source={{ uri: targetUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              Alert.alert("Couldn't open link", "Please try again or use another network.");
            }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color={INK} />
              </View>
            )}
          />

          {loading ? (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <ActivityIndicator color={INK} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.empty}>
          <ActivityIndicator color={INK} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: INK,
  },
  header: {
    height: 64,
    backgroundColor: INK,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 1,
  },
  headerSpacer: {
    width: 44,
  },
  webWrap: {
    flex: 1,
    backgroundColor: WHITE,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
});
