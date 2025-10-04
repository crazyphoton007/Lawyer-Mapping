import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth } from "../../context/auth";
import { API_BASE } from "../../constants/config";

type ProfileData = {
  id?: string | number;
  phone?: string;
  name?: string;
  gender?: "Male" | "Female" | "Other" | "";
  age?: number | string;
  area?: string;
};

const BG = "#F5F7FB";
const CARD = "#FFFFFF";
const INK = "#0B1220";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const ACCENT = "#1F2937";

// ✅ Use ONLY these two
const PROFILE_GET = `${API_BASE}/auth/me`;
const PROFILE_PATCH = `${API_BASE}/auth/me`;

export default function ProfileScreen() {
  const { user, token, setAuth, logout } = useAuth();

  const [loading, setLoading] = useState<boolean>(!!token);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    gender: "",
    age: "",
    area: "",
  });

  const initials = useMemo(() => {
    const n = (form.name || "").trim();
    if (n.length > 0) {
      const parts = n.split(/\s+/);
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    const p = (user?.phone || "").toString();
    return p ? p.slice(-2) : "U";
  }, [form.name, user?.phone]);

  const setField = (k: keyof ProfileData, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function getJson(url: string) {
    const res = await fetch(url, {
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || res.statusText);
    return txt ? JSON.parse(txt) : {};
  }

  async function patchJson(url: string, body: any) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || res.statusText);
    return txt ? JSON.parse(txt) : {};
  }

  // ---- Load profile from /auth/me ----
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getJson(PROFILE_GET);
        const next: ProfileData = {
          id: data.id ?? user?.id,
          phone: data.phone ?? user?.phone,
          name: data.name ?? "",
          gender: (data.gender as any) ?? "",
          age: data.age ?? "",
          area: data.area ?? "",
        };
        setForm(next);

        // keep global context in sync (don’t change token)
        await setAuth(token!, {
          id: String(next.id ?? user?.id ?? ""),
          phone: String(next.phone ?? user?.phone ?? ""),
          name: next.name || "",
          gender: next.gender || "",
          age: next.age || "",
          area: next.area || "",
        } as any);
      } catch {
        // show minimal info; user can still fill the form
        setForm((f) => ({ ...f, phone: user?.phone, id: user?.id }));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function validate(): string | null {
    if (!form.name || form.name.trim().length < 2) return "Please enter your full name.";
    if (form.gender && !["Male", "Female", "Other"].includes(String(form.gender)))
      return "Select a valid gender.";
    if (String(form.age || "").trim()) {
      const n = Number(form.age);
      if (!Number.isFinite(n) || n < 1 || n > 120) return "Enter a valid age (1–120).";
    }
    return null;
  }

  // ---- Save to /auth/me (PATCH) ----
  async function saveProfile() {
    const err = validate();
    if (err) return Alert.alert("Invalid", err);

    setSaving(true);
    try {
      const payload = {
        name: form.name?.trim() || undefined,
        gender: form.gender || undefined,
        age: String(form.age || "").trim() ? Number(form.age) : undefined,
        area: form.area?.trim() || undefined,
      };

      const updated = await patchJson(PROFILE_PATCH, payload);

      const merged: ProfileData = {
        ...form,
        ...updated,
        id: updated.id ?? form.id,
        phone: updated.phone ?? form.phone,
      };
      setForm(merged);

      await setAuth(token!, {
        id: String(merged.id ?? user?.id ?? ""),
        phone: String(merged.phone ?? user?.phone ?? ""),
        name: merged.name || "",
        gender: merged.gender || "",
        age: merged.age || "",
        area: merged.area || "",
      } as any);

      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  // -------- UI --------
  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Not logged in</Text>
          <Text style={{ opacity: 0.7, textAlign: "center" }}>
            Please log in to view your profile.
          </Text>
          <Link href="/login">
            <Text style={{ color: "#2563EB", fontWeight: "700", marginTop: 8 }}>Go to Login</Text>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const profileIncomplete = !form.name || !form.gender || !form.age || !form.area;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Header Card */}
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              backgroundColor: ACCENT,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: INK }}>
              {form.name || "Add your name"}
            </Text>
            <Text style={{ color: MUTED }}>
              {form.phone ? `+${form.phone}` : "Phone not available"}
            </Text>
            {profileIncomplete ? (
              <Text style={{ marginTop: 6, color: "#B45309", fontWeight: "600" }}>
                Complete your profile to help us serve you better.
              </Text>
            ) : null}
          </View>
        </View>

        {/* Edit Form */}
        <View
          style={{
            marginTop: 14,
            backgroundColor: CARD,
            borderRadius: 20,
            padding: 16,
            gap: 14,
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          {/* Name */}
          <View>
            <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Full Name</Text>
            <TextInput
              value={String(form.name || "")}
              onChangeText={(t) => setField("name", t)}
              placeholder="e.g., Rakesh Sharma"
              style={{
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                padding: 12,
                backgroundColor: "#FAFAFA",
              }}
            />
          </View>

          {/* Gender */}
          <View>
            <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Gender</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["Male", "Female", "Other"] as const).map((g) => {
                const selected = form.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setField("gender", g)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: selected ? 0 : 1,
                      borderColor: BORDER,
                      backgroundColor: selected ? ACCENT : "#fff",
                    }}
                  >
                    <Text style={{ color: selected ? "#fff" : INK, fontWeight: "700" }}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Age */}
          <View>
            <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Age</Text>
            <TextInput
              value={String(form.age || "")}
              onChangeText={(t) => setField("age", t.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder="e.g., 28"
              style={{
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                padding: 12,
                backgroundColor: "#FAFAFA",
              }}
            />
          </View>

          {/* Area */}
          <View>
            <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Area / City</Text>
            <TextInput
              value={String(form.area || "")}
              onChangeText={(t) => setField("area", t)}
              placeholder="e.g., Andheri West, Mumbai"
              style={{
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                padding: 12,
                backgroundColor: "#FAFAFA",
              }}
            />
          </View>

          {/* Save + Logout */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
            <TouchableOpacity
              onPress={saveProfile}
              disabled={saving}
              style={{
                flex: 1,
                backgroundColor: saving ? "#93C5FD" : "#2563EB",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {saving ? "Saving…" : "Save Profile"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderColor: BORDER,
                borderWidth: 1,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ color: INK, fontWeight: "700" }}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
