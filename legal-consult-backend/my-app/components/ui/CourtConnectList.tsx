import { View, FlatList, StyleSheet } from "react-native";
import CourtConnectCard from "./CourtConnectCard";
import { COURT_LINKS } from "../../constants/courtLinks";

type Props = { style?: any; compact?: boolean };

export default function CourtConnectList({ style, compact }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <FlatList
        data={COURT_LINKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourtConnectCard
            title={item.title}
            desc={item.desc}
            url={item.url}
            compact={compact}
            style={{ marginBottom: 12 }}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12 },
});
