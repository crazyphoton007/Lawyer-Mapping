import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import CaseFitHeader from "@/components/CaseFitHeader";

const BG = "#F7F8FA";

export default function CourtConnectViewer() {
  const params = useLocalSearchParams<{ title?: string; url?: string }>();
  const [loading, setLoading] = useState(true);

  const targetUrl = typeof params.url === "string" ? params.url : "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["bottom"]}>
      <Stack.Screen
        options={{
          header: () => <CaseFitHeader showBack title={typeof params.title === "string" ? params.title : "Court Connect"} />,
        }}
      />

      {targetUrl ? (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: targetUrl }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              Alert.alert("Couldn’t open link", "Please try again or use another network.");
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
