import { SafeAreaView, View, Text, FlatList, ActivityIndicator } from "react-native";
import { useArticles } from "../../hooks/useArticles";
import ArticleCard from "../../components/ArticleCard";

export default function ArticlesTab() {
  const { data, loading, error } = useArticles();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: "800" }}>Legal Articles</Text>
        <Text style={{ color: "#6b7280", marginBottom: 12 }}>Browse landmark rulings and summaries</Text>
        {!!error && <Text style={{ color: "red", marginBottom: 12 }}>Failed to load: {error}</Text>}
        {loading && data.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading…</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ArticleCard
                title={item.title}
                subtitle={[item.court, item.year].filter(Boolean).join(" • ")}
                summary={item.summary}
                tags={item.tags}
              />
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={<Text style={{ color: "#6b7280" }}>No articles found.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
