import { ReactNode, useCallback, useEffect, useState } from "react";
import { Image, View } from "react-native";

import { API_BASE } from "@/constants/config";
import PremiumErrorState from "@/components/PremiumErrorState";

type AppStatus = "checking" | "ready" | "maintenance" | "offline";

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, timeout };
}

export default function AppStatusGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppStatus>("checking");
  const [message, setMessage] = useState("");
  const [retrying, setRetrying] = useState(false);

  const checkStatus = useCallback(async () => {
    setRetrying(true);
    const { controller, timeout } = withTimeout(7000);

    try {
      const res = await fetch(`${API_BASE}/app-status`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.status === "maintenance") {
        setMessage(json?.message || "We are upgrading caseFit for a smoother experience. Please check back shortly.");
        setStatus("maintenance");
        return;
      }

      if (res.ok) {
        setStatus("ready");
        return;
      }

      const healthRes = await fetch(`${API_BASE}/health`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (healthRes.ok) {
        setStatus("ready");
        return;
      }

      setMessage("caseFit is temporarily unavailable. Please try again in a few minutes.");
      setStatus("maintenance");
    } catch {
      setMessage("We could not connect to caseFit. Please check your internet connection or try again in a moment.");
      setStatus("offline");
    } finally {
      clearTimeout(timeout);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (status === "ready") return <>{children}</>;

  if (status === "checking") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Image
          source={require("@/assets/images/splash.png")}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <PremiumErrorState
      tone={status === "offline" ? "offline" : "maintenance"}
      title={status === "offline" ? "Connection needs attention" : "caseFit is under maintenance"}
      message={message}
      actionLabel="Check again"
      onAction={checkStatus}
      loading={retrying}
    />
  );
}
