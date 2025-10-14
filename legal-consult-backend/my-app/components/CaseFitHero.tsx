// // // my-app/components/CaseFitHero.tsx
// // import React from "react";
// // import { View, Text, Dimensions } from "react-native";
// // import Logo from "../assets/images/casefit-wordmark.svg";

// // const INK = "#000000";
// // const WHITE = "#FFFFFF";
// // const LOGO_ASPECT = 805 / 227; // width / height from your SVG

// // export default function CaseFitHero({ tagline }: { tagline?: string }) {
// //   const W = Dimensions.get("window").width;
// //   // BIG banner size; tweak these if you want even larger/smaller
// //   const logoW = Math.min(W * 0.72, 480);
// //   const logoH = logoW / LOGO_ASPECT;

// //   return (
// //     <View style={{ backgroundColor: INK, alignItems: "center", paddingTop: 24, paddingBottom: 28 }}>
// //       <Logo width={logoW} height={logoH} color={WHITE} />
// //       {!!tagline && (
// //         <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 16 }}>
// //           {tagline}
// //         </Text>
// //       )}
// //     </View>
// //   );
// // }

// // my-app/components/CaseFitHero.tsx
// import React from "react";
// import { View, Text, Dimensions } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Logo from "../assets/images/casefit-wordmark.svg";

// const INK = "#000000";
// const WHITE = "#FFFFFF";
// const LOGO_ASPECT = 805 / 227; // width / height from your SVG

// type Props = { tagline?: string };

// export default function CaseFitHero({ tagline }: Props) {
//   const W = Dimensions.get("window").width;
//   const insets = useSafeAreaInsets();

//   // 🔥 Bigger defaults
//   const SCALE = 1.10;        // was ~0.72 — uses 86% of screen width
//   const MAX_W = 700;         // raise cap so tablets/large phones get a huge logo
//   const MIN_W = 380;         // sensible floor for small phones

//   const logoW = Math.max(Math.min(W * SCALE, MAX_W), MIN_W);
//   const logoH = logoW / LOGO_ASPECT;

//   return (
//     <View
//       style={{
//         backgroundColor: INK,
//         alignItems: "center",
//         paddingTop: Math.max(20, insets.top * 0.25),
//         paddingBottom: 36, // increase for more presence if you want
//       }}
//     >
//       <Logo width={logoW} height={logoH} color={WHITE} />
//       {!!tagline && (
//         <Text
//           style={{
//             color: "rgba(255,255,255,0.85)",
//             marginTop: 8,
//             fontSize: 16,
//             textAlign: "center",
//           }}
//         >
//           {tagline}
//         </Text>
//       )}
//     </View>
//   );
// }


// my-app/components/CaseFitHero.tsx
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "../assets/images/casefit-wordmark.svg"; // SVG exported from Illustrator

const INK = "#000000";
const WHITE = "#FFFFFF";

// Your SVG aspect ratio (width / height)
const LOGO_ASPECT = 805 / 227;

type Props = { tagline?: string };

export default function CaseFitHero({ tagline }: Props) {
  const { top } = useSafeAreaInsets();
  const screenW = Dimensions.get("window").width;

  // 🔧 Make logo huge but keep the band slim
  const H_MARGIN = 5;       // side breathing room
  const SCALE = 0.20;        // how aggressively we size relative to screen
  const MAX_W = 110;         // cap on very large devices
  const MIN_W = 90;         // floor on small devices

  const availableW = Math.max(screenW - H_MARGIN * 2, 200);
  const desiredW = Math.min(availableW * SCALE, MAX_W);
  const logoW = Math.max(desiredW, MIN_W);
  const logoH = logoW / LOGO_ASPECT;

  return (
    <View
      style={{
        backgroundColor: INK,
        alignItems: "center",
        // Slim band: minimal padding top/bottom
        paddingTop: Math.max(4, top * 0.15),
        paddingBottom: 8,
      }}
    >
      <Logo width={logoW} height={logoH} fill={WHITE} />

      {!!tagline && (
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            marginTop: 6,
            fontSize: 15,
            textAlign: "center",
          }}
        >
          {tagline}
        </Text>
      )}
    </View>
  );
}
