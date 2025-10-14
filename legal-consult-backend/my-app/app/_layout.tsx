// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { AuthProvider } from "../context/auth";
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';
// import CaseFitHeader from '@/components/CaseFitHeader'; // ← NEW

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <AuthProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack initialRouteName="(tabs)">
//           {/* Tabs manage their own headers (we'll set the black header inside (tabs)/_layout.tsx) */}
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

//           {/* Login uses the same black header, with back + help */}
//           <Stack.Screen
//             name="login"
//             options={{
//               header: () => <CaseFitHeader showBack showHelp />,
//             }}
//           />

//           {/* Example modal – give it the black header too (back only) */}
//           <Stack.Screen
//             name="modal"
//             options={{
//               presentation: 'modal',
//               header: () => <CaseFitHeader showBack />,
//             }}
//           />
//         </Stack>

//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }

// my-app/app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "../context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import CaseFitHeader from "@/components/CaseFitHeader"; // compact black header (for modal etc.)

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(tabs)">
          {/* Tabs hide their own header here; they add the black header in (tabs)/_layout.tsx */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Login shows the large brand hero, so keep the native header hidden */}
          <Stack.Screen
           name="login"
           options={{
            header: () => <CaseFitHeader showBack showHelp />, // same compact black header
        }}
/>

          {/* Example modal – keep a compact black header with a back button */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              header: () => <CaseFitHeader showBack />,
            }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
