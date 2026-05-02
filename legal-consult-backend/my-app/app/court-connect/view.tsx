import { useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import CaseFitHeader from "@/components/CaseFitHeader";

const BG = "#F7F8FA";

export default function CourtConnectViewer() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; url?: string }>();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const targetUrl = typeof params.url === "string" ? params.url : "";

  const goBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return;
    }
    router.back();
  };

  useFocusEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });

    return () => sub.remove();
  });

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          header: () => <CaseFitHeader showBack onBackPress={goBack} />,
        }}
      />

      {targetUrl ? (
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: targetUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={false}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              Alert.alert("Couldn't open link", "Please try again or use another network.");
            }}
            startInLoadingState
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: BG,
                }}
              >
                <ActivityIndicator />
              </View>
            )}
          />

          {loading ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(247,248,250,0.72)",
              }}
            >
              <ActivityIndicator />
            </View>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: BG,
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}
