import { useCallback, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, RefreshControl, Button } from "react-native";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
import { useFocusEffect, useRouter } from "expo-router";

type Req = { id: string; topic: string; status: string; created_at: string };

export default function RequestsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requests/`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);
  useFocusEffect(useCallback(() => { load(); return () => {}; }, [token]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [token]);

  // --- NOT LOGGED IN STATE (centered full screen) ---
  if (!token) {
    return (
      <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Please log in</Text>
        <Text style={{ fontSize: 14, opacity: 0.7, textAlign: "center", marginBottom: 16 }}>
          Go to the Profile tab and log in, then come back to see your requests.
        </Text>
        <Button title="Go to Profile" onPress={() => router.push("/profile")} />
      </View>
    );
  }

  if (loading) {
    return <View style={{ flex:1, padding:16, justifyContent:"center" }}><ActivityIndicator /></View>;
  }

  if (error) {
    return (
      <View style={{ flex:1, padding:24, alignItems:"center", justifyContent:"center" }}>
        <Text style={{ fontSize: 16, color: "#b00020", marginBottom: 12, textAlign: "center" }}>{error}</Text>
        <Button title="Retry" onPress={load} />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={{ flex:1, padding:24, alignItems:"center", justifyContent:"center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>No requests yet</Text>
        <Text style={{ fontSize: 14, opacity: 0.7, textAlign: "center", marginBottom: 12 }}>
          Submit your first request from the Consult tab.
        </Text>
        <Button title="Refresh" onPress={load} />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"700", marginBottom:8 }}>My Requests</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:"#eee" }} />}
        renderItem={({ item }) => (
          <View style={{ paddingVertical:10 }}>
            <Text style={{ fontWeight:"700" }}>{item.topic}</Text>
            <Text>Status: {item.status}</Text>
            <Text style={{ opacity:0.6 }}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
