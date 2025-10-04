import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/auth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", padding:16, gap:12 }}>
        <Text style={{ fontSize:20, fontWeight:"700" }}>Not logged in</Text>
        <Text style={{ opacity:0.7, textAlign:"center" }}>
          Please login to continue.
        </Text>
        <Link href="/login" asChild>
          <Button title="Go to Login" onPress={() => {}} />
        </Link>
      </View>
    );
  }

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center", padding:16, gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Profile</Text>
      <Text style={{ fontSize:16 }}>Phone: {user.phone}</Text>
      <Button title="Log out" onPress={logout} />
    </View>
  );
}
