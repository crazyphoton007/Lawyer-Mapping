import { useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";

export default function ConsultScreen() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [attachments, setAttachments] = useState(""); // comma-separated URLs
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!token) {
      Alert.alert("Login required", "Go to Profile → Login first.");
      return;
    }
    if (!topic.trim() || details.trim().length < 10) {
      Alert.alert("Missing fields", "Topic and at least 10 characters in Details are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requests/`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          details: details.trim(),
          category: category.trim() || undefined,
          preferred_time: preferredTime.trim() || undefined,
          attachments: attachments
            ? attachments.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      const json = JSON.parse(text);
      Alert.alert("Request submitted", `ID: ${json.id}`);
      // reset form
      setTopic(""); setDetails(""); setCategory(""); setPreferredTime(""); setAttachments("");
      // go to My Requests
      router.replace("/requests");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Request a Consultation</Text>

      {!user && (
        <Text style={{ fontSize: 12, opacity: 0.7 }}>
          You’re not logged in. Go to Profile → Login to submit a request.
        </Text>
      )}

      <TextInput
        placeholder="Topic (e.g., Property dispute)"
        value={topic}
        onChangeText={setTopic}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Category (Civil, Criminal, Family...)"
        value={category}
        onChangeText={setCategory}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Preferred time (e.g., Evening 6–9 PM)"
        value={preferredTime}
        onChangeText={setPreferredTime}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Details (min 10 chars)"
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={6}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, minHeight: 120, textAlignVertical: "top" }}
      />

      <TextInput
        placeholder="Attachment URLs (comma-separated, optional)"
        value={attachments}
        onChangeText={setAttachments}
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8 }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Submit" onPress={submit} />
      )}
    </ScrollView>
  );
}
