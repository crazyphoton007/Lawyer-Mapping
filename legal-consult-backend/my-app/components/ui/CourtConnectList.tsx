import { View, FlatList, StyleSheet } from "react-native";
import CourtConnectCard from "./CourtConnectCard";
import { COURT_CATALOG } from "../../constants/courtLinks";

type Props = { style?: any; compact?: boolean };

export default function CourtConnectList({ style, compact }: Props) {
  const courtLinks = COURT_CATALOG.lowerCourt.courts
    .filter((court) => Boolean(court.url))
    .map((court) => ({
      id: court.name,
      title: court.name,
      desc: COURT_CATALOG.lowerCourt.title,
      url: court.url as string,
    }));

  return (
    <View style={[styles.wrap, style]}>
      <FlatList
        data={courtLinks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourtConnectCard
            title={item.title}
            url={item.url}
            desc={compact ? undefined : item.desc}
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
