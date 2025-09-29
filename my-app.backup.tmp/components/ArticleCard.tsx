// my-app/components/ArticleCard.tsx
import { View, Text } from "react-native";

export default function ArticleCard({ title, subtitle, summary, tags }:{
  title: string; subtitle?: string; summary?: string | null; tags?: string[] | null;
}) {
  return (
    <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, marginBottom:12,
      shadowColor:"#000", shadowOpacity:0.08, shadowRadius:12, shadowOffset:{width:0,height:4}, elevation:2 }}>
      <Text style={{ fontSize:16, fontWeight:"700", marginBottom:4 }}>{title}</Text>
      {!!subtitle && <Text style={{ color:"#6b7280", marginBottom:8 }}>{subtitle}</Text>}
      {!!summary && <Text numberOfLines={3} style={{ color:"#374151", marginBottom:8 }}>{summary}</Text>}
      {!!tags?.length && (
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:6 }}>
          {tags.map(t => (
            <View key={t} style={{ backgroundColor:"#f3f4f6", paddingHorizontal:8, paddingVertical:4, borderRadius:999 }}>
              <Text style={{ color:"#111827", fontSize:12 }}>#{t}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
