// // // my-app/app/(tabs)/profile.tsx
// // import { useEffect, useMemo, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   ScrollView,
// //   Switch,
// //   Pressable,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { useRouter } from "expo-router";
// // import { useAuth } from "../../context/auth";
// // import { API_BASE } from "../../constants/config";
// // import CaseFitHeader from "../../components/CaseFitHeader";
// // import { Feather } from "@expo/vector-icons";

// // type ProfileData = {
// //   id?: string | number;
// //   phone?: string;
// //   name?: string;
// //   gender?: "Male" | "Female" | "Other" | "";
// //   age?: number | string;
// //   area?: string;
// // };

// // const BG = "#F5F7FB";
// // const CARD = "#FFFFFF";
// // const INK = "#000000";        // brand black
// // const MUTED = "#6B7280";
// // const BORDER = "#E5E7EB";

// // // ✅ Use ONLY these two
// // const PROFILE_GET = `${API_BASE}/auth/me`;
// // const PROFILE_PATCH = `${API_BASE}/auth/me`;

// // // ---------- Small UI primitives ----------
// // function Section({ title, children }: { title?: string; children: React.ReactNode }) {
// //   return (
// //     <View
// //       style={{
// //         backgroundColor: CARD,
// //         borderRadius: 18,
// //         paddingHorizontal: 16,
// //         paddingVertical: 4,
// //         borderWidth: 1,
// //         borderColor: BORDER,
// //         shadowColor: "#000",
// //         shadowOpacity: 0.06,
// //         shadowRadius: 10,
// //         elevation: 2,
// //       }}
// //     >
// //       {title ? (
// //         <Text style={{ fontSize: 18, fontWeight: "700", color: INK, marginBottom: 8 }}>{title}</Text>
// //       ) : null}
// //       {children}
// //     </View>
// //   );
// // }

// // function Divider() {
// //   return <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 40 }} />;
// // }

// // function Row({
// //   icon,
// //   label,
// //   subtitle,
// //   onPress,
// //   right,
// //   disabled,
// // }: {
// //   icon: React.ReactNode;
// //   label: string;
// //   subtitle?: string;
// //   onPress?: () => void;
// //   right?: React.ReactNode;
// //   disabled?: boolean;
// // }) {
// //   return (
// //     <Pressable
// //       disabled={disabled}
// //       onPress={onPress}
// //       style={({ pressed }) => [
// //         {
// //           paddingVertical: 16,
// //           flexDirection: "row",
// //           alignItems: "center",
// //           opacity: pressed ? 0.7 : 1,
// //         },
// //       ]}
// //     >
// //       <View style={{ width: 28, marginRight: 12, alignItems: "center" }}>{icon}</View>
// //       <View style={{ flex: 1 }}>
// //         <Text style={{ fontSize: 16, fontWeight: "600", color: INK }}>{label}</Text>
// //         {subtitle ? <Text style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{subtitle}</Text> : null}
// //       </View>
// //       {right ?? <Feather name="chevron-right" size={20} color="#9CA3AF" />}
// //     </Pressable>
// //   );
// // }
// // // ----------------------------------------

// // export default function ProfileScreen() {
// //   const router = useRouter();
// //   const { user, token, setAuth, logout } = useAuth();

// //   const [loading, setLoading] = useState<boolean>(!!token);
// //   const [saving, setSaving] = useState(false); // kept for PATCH flow
// //   const [form, setForm] = useState<ProfileData>({
// //     name: "",
// //     gender: "",
// //     age: "",
// //     area: "",
// //   });
// //   const [notif, setNotif] = useState(true); // UI only for now

// //   // 🔒 Redirect to /login if not authenticated
// //   useEffect(() => {
// //     if (!token) {
// //       router.replace("/login");
// //     }
// //   }, [token, router]);

// //   const initials = useMemo(() => {
// //     const n = (form.name || "").trim();
// //     if (n.length > 0) {
// //       const parts = n.split(/\s+/);
// //       return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
// //     }
// //     const p = (user?.phone || "").toString();
// //     return p ? p.slice(-2) : "•";
// //   }, [form.name, user?.phone]);

// //   async function getJson(url: string) {
// //     const res = await fetch(url, {
// //       headers: {
// //         "content-type": "application/json",
// //         ...(token ? { authorization: `Bearer ${token}` } : {}),
// //       },
// //     });
// //     const txt = await res.text();
// //     if (!res.ok) throw new Error(txt || res.statusText);
// //     return txt ? JSON.parse(txt) : {};
// //   }

// //   async function patchJson(url: string, body: any) {
// //     const res = await fetch(url, {
// //       method: "PATCH",
// //       headers: {
// //         "content-type": "application/json",
// //         ...(token ? { authorization: `Bearer ${token}` } : {}),
// //       },
// //       body: JSON.stringify(body),
// //     });
// //     const txt = await res.text();
// //     if (!res.ok) throw new Error(txt || res.statusText);
// //     return txt ? JSON.parse(txt) : {};
// //   }

// //   // ---- Load profile from /auth/me ----
// //   useEffect(() => {
// //     if (!token) return;
// //     (async () => {
// //       setLoading(true);
// //       try {
// //         const data = await getJson(PROFILE_GET);
// //         const next: ProfileData = {
// //           id: data.id ?? user?.id,
// //           phone: data.phone ?? user?.phone,
// //           name: data.name ?? "",
// //           gender: (data.gender as any) ?? "",
// //           age: data.age ?? "",
// //           area: data.area ?? "",
// //         };
// //         setForm(next);

// //         // keep global context in sync (don’t change token)
// //         await setAuth(token!, {
// //           id: String(next.id ?? user?.id ?? ""),
// //           phone: String(next.phone ?? user?.phone ?? ""),
// //           name: next.name || "",
// //           gender: next.gender || "",
// //           age: next.age || "",
// //           area: next.area || "",
// //         } as any);
// //       } catch {
// //         setForm((f) => ({ ...f, phone: user?.phone, id: user?.id }));
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [token]);

// //   function validate(): string | null {
// //     if (!form.name || form.name.trim().length < 2) return "Please enter your full name.";
// //     if (form.gender && !["Male", "Female", "Other"].includes(String(form.gender)))
// //       return "Select a valid gender.";
// //     if (String(form.age || "").trim()) {
// //       const n = Number(form.age);
// //       if (!Number.isFinite(n) || n < 1 || n > 120) return "Enter a valid age (1–120).";
// //     }
// //     return null;
// //   }

// //   // ---- Save to /auth/me (PATCH) ----
// //   // (not exposed in UI here; call from Edit screen or keep for future)
// //   async function saveProfile() {
// //     const err = validate();
// //     if (err) return Alert.alert("Invalid", err);

// //     setSaving(true);
// //     try {
// //       const payload = {
// //         name: form.name?.trim() || undefined,
// //         gender: form.gender || undefined,
// //         age: String(form.age || "").trim() ? Number(form.age) : undefined,
// //         area: form.area?.trim() || undefined,
// //       };

// //       const updated = await patchJson(PROFILE_PATCH, payload);

// //       const merged: ProfileData = {
// //         ...form,
// //         ...updated,
// //         id: updated.id ?? form.id,
// //         phone: updated.phone ?? form.phone,
// //       };
// //       setForm(merged);

// //       await setAuth(token!, {
// //         id: String(merged.id ?? user?.id ?? ""),
// //         phone: String(merged.phone ?? user?.phone ?? ""),
// //         name: merged.name || "",
// //         gender: merged.gender || "",
// //         age: merged.age || "",
// //         area: merged.area || "",
// //       } as any);

// //       Alert.alert("Saved", "Your profile has been updated.");
// //     } catch (e: any) {
// //       Alert.alert("Error", e?.message || "Could not save profile");
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   // While redirecting, render nothing if unauthenticated
// //   if (!token) return null;

// //   if (loading) {
// //     return (
// //       <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
// //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// //           <ActivityIndicator />
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   const profileIncomplete = !form.name || !form.gender || !form.age || !form.area;

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
// //       {/* Black header with white CaseFit wordmark */}
// //       <CaseFitHeader title="caseFit" />

// //       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
// //         {/* Profile summary card */}
// //         <View
// //           style={{
// //             backgroundColor: CARD,
// //             borderRadius: 20,
// //             padding: 16,
// //             flexDirection: "row",
// //             alignItems: "center",
// //             gap: 16,
// //             borderWidth: 1,
// //             borderColor: BORDER,
// //             shadowColor: "#000",
// //             shadowOpacity: 0.06,
// //             shadowRadius: 10,
// //             elevation: 2,
// //           }}
// //         >
// //           <View
// //             style={{
// //               width: 56,
// //               height: 56,
// //               borderRadius: 28,
// //               backgroundColor: INK,
// //               alignItems: "center",
// //               justifyContent: "center",
// //             }}
// //           >
// //             <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{initials}</Text>
// //           </View>

// //           <View style={{ flex: 1 }}>
// //             <Text style={{ fontSize: 18, fontWeight: "800", color: INK }}>
// //               {form.name || "Add your name"}
// //             </Text>
// //             <Text style={{ color: MUTED, marginTop: 2 }}>
// //               {form.phone ? `+${form.phone}` : "Phone not available"}
// //             </Text>
// //             {profileIncomplete ? (
// //               <Text style={{ marginTop: 6, color: "#92400E", fontWeight: "600" }}>
// //                 Complete your profile to help us serve you better.
// //               </Text>
// //             ) : null}
// //           </View>

// //           <TouchableOpacity
// //             onPress={() => {
// //               // Route to an edit screen if you have it, else we can convert this page later.
// //               // router.push("/profile/edit");
// //               Alert.alert("Edit Profile", "Hook this to your edit screen or form.");
// //             }}
// //             style={{ backgroundColor: INK, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }}
// //           >
// //             <Text style={{ color: "#fff", fontWeight: "700" }}>Edit profile</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* Your Information */}
// //         <Section title="Your Information">
// //           <Row
// //             icon={<Feather name="user" size={22} color={INK} />}
// //             label="Personal Information"
// //             onPress={() => {
// //               // router.push("/profile/edit");
// //             }}
// //           />
// //         </Section>

// //         {/* Community */}
// //         <Section title="Community">
// //           <Row icon={<Feather name="gift" size={22} color={INK} />} label="Refer a Friend" onPress={() => {}} />
// //           <Divider />
// //           <Row icon={<Feather name="message-square" size={22} color={INK} />} label="Leave Feedback" onPress={() => {}} />
// //           <Divider />
// //           <Row icon={<Feather name="star" size={22} color={INK} />} label="Rate this App" onPress={() => {}} />
// //         </Section>

// //         {/* Notifications & Help */}
// //         <Section title="Notifications & Help">
// //           <Row
// //             icon={<Feather name="bell" size={22} color={INK} />}
// //             label="Notifications"
// //             right={<Switch value={notif} onValueChange={setNotif} />}
// //           />
// //           <Divider />
// //           <Row icon={<Feather name="help-circle" size={22} color={INK} />} label="Help & Support" onPress={() => {}} />
// //         </Section>

// //         {/* Donate */}
// //         <Section title="Donate">
// //           <Row
// //             icon={<Feather name="heart" size={22} color={INK} />}
// //             label="Support caseFit"
// //             subtitle="Help us serve more people"
// //             onPress={() => {}}
// //           />
// //         </Section>

// //         {/* Logout */}
// //         <Pressable
// //           onPress={logout}
// //           style={({ pressed }) => [{ alignSelf: "center", paddingVertical: 16, opacity: pressed ? 0.7 : 1 }]}
// //         >
// //           <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
// //             <Feather name="log-out" size={18} color={INK} />
// //             <Text style={{ color: INK, fontWeight: "800", textDecorationLine: "underline" }}>LOGOUT</Text>
// //           </View>
// //         </Pressable>

// //         <Text style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, marginBottom: 24 }}>
// //           v0.1 • caseFit
// //         </Text>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // my-app/app/(tabs)/profile.tsx
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Switch,
//   Pressable,
//   TextInput,
//   Share,
//   Linking,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { useAuth } from "../../context/auth";
// import { API_BASE } from "../../constants/config";
// import { Feather } from "@expo/vector-icons";

// type ProfileData = {
//   id?: string | number;
//   phone?: string;
//   name?: string;
//   gender?: "Male" | "Female" | "Other" | "";
//   age?: number | string;
//   area?: string;
// };

// const BG = "#F5F7FB";
// const CARD = "#FFFFFF";
// const INK = "#000000";
// const MUTED = "#6B7280";
// const BORDER = "#E5E7EB";

// // ✅ Only these
// const PROFILE_GET = `${API_BASE}/auth/me`;
// const PROFILE_PATCH = `${API_BASE}/auth/me`;

// // ----- Small UI primitives -----
// function Section({ title, children }: { title?: string; children: React.ReactNode }) {
//   return (
//     <View
//       style={{
//         backgroundColor: CARD,
//         borderRadius: 18,
//         paddingHorizontal: 16,
//         paddingVertical: 4,
//         borderWidth: 1,
//         borderColor: BORDER,
//         shadowColor: "#000",
//         shadowOpacity: 0.06,
//         shadowRadius: 10,
//         elevation: 2,
//       }}
//     >
//       {title ? (
//         <Text style={{ fontSize: 18, fontWeight: "700", color: INK, marginBottom: 8 }}>{title}</Text>
//       ) : null}
//       {children}
//     </View>
//   );
// }

// function Divider() {
//   return <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 40 }} />;
// }

// function Row({
//   icon,
//   label,
//   subtitle,
//   onPress,
//   right,
//   disabled,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   subtitle?: string;
//   onPress?: () => void;
//   right?: React.ReactNode;
//   disabled?: boolean;
// }) {
//   return (
//     <Pressable
//       disabled={disabled}
//       onPress={onPress}
//       style={({ pressed }) => [
//         {
//           paddingVertical: 16,
//           flexDirection: "row",
//           alignItems: "center",
//           opacity: pressed ? 0.7 : 1,
//         },
//       ]}
//     >
//       <View style={{ width: 28, marginRight: 12, alignItems: "center" }}>{icon}</View>
//       <View style={{ flex: 1 }}>
//         <Text style={{ fontSize: 16, fontWeight: "600", color: INK }}>{label}</Text>
//         {subtitle ? <Text style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{subtitle}</Text> : null}
//       </View>
//       {right ?? <Feather name="chevron-right" size={20} color="#9CA3AF" />}
//     </Pressable>
//   );
// }
// // -------------------------------

// export default function ProfileScreen() {
//   const router = useRouter();
//   const { user, token, setAuth, logout } = useAuth();

//   const [loading, setLoading] = useState<boolean>(!!token);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState<ProfileData>({ name: "", gender: "", age: "", area: "" });
//   const [notif, setNotif] = useState(true);   // UI only
//   const [editing, setEditing] = useState(false); // 👈 enable inline edit

//   const scrollRef = useRef<ScrollView>(null);

//   // 🔒 redirect if unauthenticated
//   useEffect(() => {
//     if (!token) router.replace("/login");
//   }, [token, router]);

//   const initials = useMemo(() => {
//     const n = (form.name || "").trim();
//     if (n.length > 0) {
//       const parts = n.split(/\s+/);
//       return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
//     }
//     const p = (user?.phone || "").toString();
//     return p ? p.slice(-2) : "•";
//   }, [form.name, user?.phone]);

//   async function getJson(url: string) {
//     const res = await fetch(url, {
//       headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
//     });
//     const txt = await res.text();
//     if (!res.ok) throw new Error(txt || res.statusText);
//     return txt ? JSON.parse(txt) : {};
//   }

//   async function patchJson(url: string, body: any) {
//     const res = await fetch(url, {
//       method: "PATCH",
//       headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
//       body: JSON.stringify(body),
//     });
//     const txt = await res.text();
//     if (!res.ok) throw new Error(txt || res.statusText);
//     return txt ? JSON.parse(txt) : {};
//   }

//   // Load profile
//   useEffect(() => {
//     if (!token) return;
//     (async () => {
//       setLoading(true);
//       try {
//         const data = await getJson(PROFILE_GET);
//         const next: ProfileData = {
//           id: data.id ?? user?.id,
//           phone: data.phone ?? user?.phone,
//           name: data.name ?? "",
//           gender: (data.gender as any) ?? "",
//           age: data.age ?? "",
//           area: data.area ?? "",
//         };
//         setForm(next);
//         await setAuth(token!, {
//           id: String(next.id ?? user?.id ?? ""),
//           phone: String(next.phone ?? user?.phone ?? ""),
//           name: next.name || "",
//           gender: next.gender || "",
//           age: next.age || "",
//           area: next.area || "",
//         } as any);
//       } catch {
//         setForm((f) => ({ ...f, phone: user?.phone, id: user?.id }));
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   function validate(): string | null {
//     if (!form.name || form.name.trim().length < 2) return "Please enter your full name.";
//     if (form.gender && !["Male", "Female", "Other"].includes(String(form.gender)))
//       return "Select a valid gender.";
//     if (String(form.age || "").trim()) {
//       const n = Number(form.age);
//       if (!Number.isFinite(n) || n < 1 || n > 120) return "Enter a valid age (1–120).";
//     }
//     return null;
//   }

//   async function saveProfile() {
//     const err = validate();
//     if (err) return Alert.alert("Invalid", err);

//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name?.trim() || undefined,
//         gender: form.gender || undefined,
//         age: String(form.age || "").trim() ? Number(form.age) : undefined,
//         area: form.area?.trim() || undefined,
//       };
//       const updated = await patchJson(PROFILE_PATCH, payload);
//       const merged: ProfileData = {
//         ...form,
//         ...updated,
//         id: updated.id ?? form.id,
//         phone: updated.phone ?? form.phone,
//       };
//       setForm(merged);
//       await setAuth(token!, {
//         id: String(merged.id ?? user?.id ?? ""),
//         phone: String(merged.phone ?? user?.phone ?? ""),
//         name: merged.name || "",
//         gender: merged.gender || "",
//         age: merged.age || "",
//         area: merged.area || "",
//       } as any);
//       setEditing(false);
//       Alert.alert("Saved", "Your profile has been updated.");
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Could not save profile");
//     } finally {
//       setSaving(false);
//     }
//   }

//   if (!token) return null;

//   if (loading) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//           <ActivityIndicator />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const profileIncomplete = !form.name || !form.gender || !form.age || !form.area;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
//       {/* 🔧 FIX DOUBLE-HEADER:
//           We REMOVED CaseFitHeader here.
//           Keep using the navigator/tab header (which already shows your black CaseFit bar). */}
//       <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
//         {/* Profile summary */}
//         <View
//           style={{
//             backgroundColor: CARD,
//             borderRadius: 20,
//             padding: 16,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 16,
//             borderWidth: 1,
//             borderColor: BORDER,
//             shadowColor: "#000",
//             shadowOpacity: 0.06,
//             shadowRadius: 10,
//             elevation: 2,
//           }}
//         >
//           <View
//             style={{
//               width: 56,
//               height: 56,
//               borderRadius: 28,
//               backgroundColor: INK,
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{initials}</Text>
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text style={{ fontSize: 18, fontWeight: "800", color: INK }}>
//               {form.name || "Add your name"}
//             </Text>
//             <Text style={{ color: MUTED, marginTop: 2 }}>
//               {form.phone ? `+${form.phone}` : "Phone not available"}
//             </Text>
//             {profileIncomplete ? (
//               <Text style={{ marginTop: 6, color: "#92400E", fontWeight: "600" }}>
//                 Complete your profile to help us serve you better.
//               </Text>
//             ) : null}
//           </View>

//           <TouchableOpacity
//             onPress={() => {
//               setEditing(true);
//               setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
//             }}
//             style={{ backgroundColor: INK, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "700" }}>Edit profile</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Your Information */}
//         <Section title="Your Information">
//           <Row
//             icon={<Feather name="user" size={22} color={INK} />}
//             label="Personal Information"
//             onPress={() => {
//               setEditing(true);
//               setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
//             }}
//           />
//         </Section>

//         {/* Community */}
//         <Section title="Community">
//           <Row
//             icon={<Feather name="gift" size={22} color={INK} />}
//             label="Refer a Friend"
//             onPress={async () => {
//               try {
//                 await Share.share({
//                   message:
//                     "Try caseFit for quick, reliable legal help. Download the app and use my referral: CASEFIT",
//                 });
//               } catch {}
//             }}
//           />
//           <Divider />
//           <Row
//             icon={<Feather name="message-square" size={22} color={INK} />}
//             label="Leave Feedback"
//             onPress={() =>
//               Linking.openURL("mailto:support@thecasefit.com?subject=Feedback%20for%20caseFit").catch(() =>
//                 Alert.alert("Info", "Feedback: support@thecasefit.com")
//               )
//             }
//           />
//           <Divider />
//           <Row
//             icon={<Feather name="star" size={22} color={INK} />}
//             label="Rate this App"
//             onPress={() =>
//               Alert.alert("Coming soon", "Store listing link will be added for ratings.")
//             }
//           />
//         </Section>

//         {/* Notifications & Help */}
//         <Section title="Notifications & Help">
//           <Row
//             icon={<Feather name="bell" size={22} color={INK} />}
//             label="Notifications"
//             right={<Switch value={notif} onValueChange={setNotif} />}
//           />
//           <Divider />
//           <Row
//             icon={<Feather name="help-circle" size={22} color={INK} />}
//             label="Help & Support"
//             onPress={() =>
//               Linking.openURL("mailto:support@thecasefit.com?subject=Help%20Request").catch(() =>
//                 Alert.alert("Info", "Write to support@thecasefit.com")
//               )
//             }
//           />
//         </Section>

//         {/* Donate */}
//         <Section title="Donate">
//           <Row
//             icon={<Feather name="heart" size={22} color={INK} />}
//             label="Support caseFit"
//             subtitle="Help us serve more people"
//             onPress={() => Alert.alert("Coming soon", "Donation flow will be added.")}
//           />
//         </Section>

//         {/* Inline EDIT FORM (appears when Edit profile / Personal Information tapped) */}
//         {editing && (
//           <View
//             style={{
//               marginTop: 14,
//               backgroundColor: CARD,
//               borderRadius: 20,
//               padding: 16,
//               gap: 14,
//               borderWidth: 1,
//               borderColor: BORDER,
//               shadowColor: "#000",
//               shadowOpacity: 0.05,
//               shadowRadius: 8,
//               shadowOffset: { width: 0, height: 4 },
//               elevation: 2,
//             }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", color: INK, marginBottom: 4 }}>
//               Edit Personal Information
//             </Text>

//             {/* Name */}
//             <View>
//               <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Full Name</Text>
//               <TextInput
//                 value={String(form.name || "")}
//                 onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
//                 placeholder="e.g., Rakesh Sharma"
//                 style={{
//                   borderWidth: 1,
//                   borderColor: BORDER,
//                   borderRadius: 12,
//                   padding: 12,
//                   backgroundColor: "#FAFAFA",
//                 }}
//               />
//             </View>

//             {/* Gender */}
//             <View>
//               <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Gender</Text>
//               <View style={{ flexDirection: "row", gap: 8 }}>
//                 {(["Male", "Female", "Other"] as const).map((g) => {
//                   const selected = form.gender === g;
//                   return (
//                     <TouchableOpacity
//                       key={g}
//                       onPress={() => setForm((f) => ({ ...f, gender: g }))}
//                       style={{
//                         paddingVertical: 8,
//                         paddingHorizontal: 14,
//                         borderRadius: 999,
//                         borderWidth: selected ? 0 : 1,
//                         borderColor: BORDER,
//                         backgroundColor: selected ? INK : "#fff",
//                       }}
//                     >
//                       <Text style={{ color: selected ? "#fff" : INK, fontWeight: "700" }}>{g}</Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* Age */}
//             <View>
//               <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Age</Text>
//               <TextInput
//                 value={String(form.age || "")}
//                 onChangeText={(t) =>
//                   setForm((f) => ({ ...f, age: t.replace(/\D/g, "") }))
//                 }
//                 keyboardType="number-pad"
//                 placeholder="e.g., 28"
//                 style={{
//                   borderWidth: 1,
//                   borderColor: BORDER,
//                   borderRadius: 12,
//                   padding: 12,
//                   backgroundColor: "#FAFAFA",
//                 }}
//               />
//             </View>

//             {/* Area */}
//             <View>
//               <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Area / City</Text>
//               <TextInput
//                 value={String(form.area || "")}
//                 onChangeText={(t) => setForm((f) => ({ ...f, area: t }))}
//                 placeholder="e.g., Andheri West, Mumbai"
//                 style={{
//                   borderWidth: 1,
//                   borderColor: BORDER,
//                   borderRadius: 12,
//                   padding: 12,
//                   backgroundColor: "#FAFAFA",
//                 }}
//               />
//             </View>

//             {/* Save / Cancel */}
//             <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
//               <TouchableOpacity
//                 onPress={saveProfile}
//                 disabled={saving}
//                 style={{
//                   flex: 1,
//                   backgroundColor: saving ? "#93C5FD" : INK,
//                   paddingVertical: 14,
//                   borderRadius: 12,
//                   alignItems: "center",
//                 }}
//               >
//                 <Text style={{ color: "#fff", fontWeight: "700" }}>
//                   {saving ? "Saving…" : "Save Changes"}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setEditing(false)}
//                 style={{
//                   paddingVertical: 14,
//                   paddingHorizontal: 16,
//                   borderRadius: 12,
//                   borderColor: BORDER,
//                   borderWidth: 1,
//                   backgroundColor: "#fff",
//                 }}
//               >
//                 <Text style={{ color: INK, fontWeight: "700" }}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {/* Logout */}
//         <Pressable
//           onPress={logout}
//           style={({ pressed }) => [{ alignSelf: "center", paddingVertical: 16, opacity: pressed ? 0.7 : 1 }]}
//         >
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
//             <Feather name="log-out" size={18} color={INK} />
//             <Text style={{ color: INK, fontWeight: "800", textDecorationLine: "underline" }}>LOGOUT</Text>
//           </View>
//         </Pressable>

//         <Text style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, marginBottom: 24 }}>
//           v0.1 • caseFit
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }


import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  Share,
  Linking,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/auth";
import { API_BASE } from "../../constants/config";
import { Feather } from "@expo/vector-icons";
import { friendlyErrorMessage } from "@/utils/errorMessages";

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
const INK = "#000000";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

// 🔗 Share / Support (edit as you like)
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.thecasefit.app";
const APP_STORE_URL = "";
const APP_SHARE_URL = PLAY_STORE_URL;
const SUPPORT_EMAIL = "support@casefit.com";
const WHATSAPP_E164 = "919807863007"; // country code + number (e.g., +91 9807863007)
const RAZORPAY_SUPPORT_LINK = "https://razorpay.me/@casefittechnologiesprivatelim";
const RAZORPAY_QR_IMAGE = require("../../assets/images/razorpay-support-qr.jpeg");

// API
const PROFILE_GET = `${API_BASE}/auth/me`;
const PROFILE_PATCH = `${API_BASE}/auth/me`;
const FEEDBACK_POST = `${API_BASE}/feedback/`; // optional backend you can add
const CLAIM_GUEST = `${API_BASE}/auth/claim-guest`;

function normalizeIndianPhone(input: string) {
  return input.replace(/\D/g, "").slice(0, 10);
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: BORDER,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {title ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: BORDER, marginLeft: 40 }} />;
}

function Row({
  icon,
  label,
  subtitle,
  onPress,
  right,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ width: 28, marginRight: 12, alignItems: "center" }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: INK }}>{label}</Text>
        {subtitle ? <Text style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right ?? <Feather name="chevron-right" size={20} color="#9CA3AF" />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuth();

  const [loading, setLoading] = useState<boolean>(!!token);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({ name: "", gender: "", age: "", area: "" });
  const [editing, setEditing] = useState(false);

  // Feedback modal
  const [fbOpen, setFbOpen] = useState(false);
  const [fbText, setFbText] = useState("");
  const [fbSuccessOpen, setFbSuccessOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [claimStep, setClaimStep] = useState<"phone" | "code">("phone");
  const [claimLoading, setClaimLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const supportPulse = useRef(new Animated.Value(1)).current;

  // single header: we rely on navigator header; do NOT render custom header here
  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const initials = useMemo(() => {
    const n = (form.name || "").trim();
    if (n.length > 0) {
      const parts = n.split(/\s+/);
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    const p = (user?.phone || "").toString();
    return p ? p.slice(-2) : "•";
  }, [form.name, user?.phone]);

  const displayName = useMemo(() => {
    const n = (form.name || "").trim();
    if (!n) return "Add name";
    const first = n.split(/\s+/)[0];
    return `Hello, ${first}`;
  }, [form.name]);

  const feedbackThankYou = useMemo(() => {
    const n = (form.name || "").trim();
    if (!n) {
      return "Thanks. Your feedback has been added to our improvement queue.";
    }
    const first = n.split(/\s+/)[0];
    return `Thanks, ${first}. Your feedback has been added to our improvement queue.`;
  }, [form.name]);

  const isGuestUser = !!user?.is_guest || user?.role === "guest";
  const claimDigits = normalizeIndianPhone(claimPhone);
  const canRequestClaimCode = claimDigits.length === 10 && !claimLoading;
  const canConfirmClaim = claimDigits.length === 10 && claimCode.trim().length > 0 && !claimLoading;

  async function getJson(url: string) {
    const res = await fetch(url, {
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || res.statusText);
    return txt ? JSON.parse(txt) : {};
  }

  async function patchJson(url: string, body: any) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || res.statusText);
    return txt ? JSON.parse(txt) : {};
  }

  // optional feedback POST
  async function postFeedback(body: any) {
    try {
      const res = await fetch(FEEDBACK_POST, {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return true;
    } catch {
      return false; // silently fall back to email
    }
  }

  // Load profile
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
        await setAuth(token!, {
          id: String(next.id ?? user?.id ?? ""),
          phone: String(next.phone ?? user?.phone ?? ""),
          name: next.name || "",
          gender: next.gender || "",
          age: next.age || "",
          area: next.area || "",
        } as any);
      } catch {
        setForm((f) => ({ ...f, phone: user?.phone ?? undefined, id: user?.id }));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(supportPulse, {
          toValue: 0.9,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(supportPulse, {
          toValue: 1.28,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(supportPulse, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [supportPulse]);

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
      setEditing(false);
    } catch (e: any) {
      Alert.alert("Profile could not be saved", friendlyErrorMessage(e, "Please try again in a moment."));
    } finally {
      setSaving(false);
    }
  }

  // Share link with referral text
  async function handleShare() {
    try {
      await Share.share({
        message: `Try caseFit for quick, reliable legal help. Download here: ${APP_SHARE_URL}`,
        url: APP_SHARE_URL, // iOS prefers 'url' too
        title: "caseFit",
      });
    } catch {}
  }

  async function openRateApp() {
    const url = Platform.OS === "ios" && APP_STORE_URL ? APP_STORE_URL : PLAY_STORE_URL;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Rate caseFit", `Open this link after the store listing is live:\n${url}`);
    }
  }

  async function openRazorpaySupport() {
    if (!RAZORPAY_SUPPORT_LINK) {
      Alert.alert(
        "Razorpay link needed",
        "Add your real Razorpay payment link in the app before launch so users can support caseFit safely."
      );
      return;
    }

    try {
      await Linking.openURL(RAZORPAY_SUPPORT_LINK);
    } catch {
      Alert.alert("Support caseFit", RAZORPAY_SUPPORT_LINK);
    }
  }

  // Help & Support chooser
  function openSupportChooser() {
    Alert.alert(
      "Contact caseFit",
      "Choose how you want to reach us.",
      [
        {
          text: "Email",
          onPress: () =>
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "Help Request"
              )}&body=${encodeURIComponent(
                `Hi caseFit team,\n\nI need help with...\n\n— ${form.name || "User"} (${form.phone || "phone unknown"})`
              )}`
            ).catch(() => Alert.alert("Info", `Write to ${SUPPORT_EMAIL}`)),
        },
        {
          text: "WhatsApp",
          onPress: () => {
            const deep = `whatsapp://send?phone=${WHATSAPP_E164}&text=${encodeURIComponent(
              "Hi caseFit support, I need help."
            )}`;
            const web = `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(
              "Hi caseFit support, I need help."
            )}`;
            Linking.openURL(deep).catch(() => Linking.openURL(web));
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  }

  function openClaimModal() {
    setClaimPhone("");
    setClaimCode("");
    setClaimStep("phone");
    setClaimOpen(true);
  }

  async function requestClaimCode() {
    if (!canRequestClaimCode) {
      Alert.alert("Invalid number", "Enter a valid 10-digit mobile number.");
      return;
    }

    setClaimLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-code`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ phone: `+91${claimDigits}` }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(json?.detail || `HTTP ${res.status}`);
      }
      setClaimStep("code");
    } catch (e: any) {
      Alert.alert("OTP could not be sent", friendlyErrorMessage(e, "Please try again in a moment."));
    } finally {
      setClaimLoading(false);
    }
  }

  async function claimGuestAccount() {
    if (!token) {
      Alert.alert("Session missing", "Please log in again and try once more.");
      return;
    }
    if (!canConfirmClaim) {
      Alert.alert("Missing details", "Enter the OTP sent to your mobile number.");
      return;
    }

    setClaimLoading(true);
    try {
      const res = await fetch(CLAIM_GUEST, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: `+91${claimDigits}`, code: claimCode.trim() }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(json?.detail || `HTTP ${res.status}`);
      }

      const nextToken = json.token || json.access_token || json.jwt;
      if (!nextToken) {
        throw new Error("No token returned from server");
      }

      const nextUser = {
        id: String(json?.user?.id ?? user?.id ?? ""),
        phone: String(json?.user?.phone ?? `+91${claimDigits}`),
        name: json?.user?.name ?? form.name ?? user?.name ?? "",
        role: json?.user?.role ?? "user",
        is_guest: false,
      };

      await setAuth(nextToken, nextUser);
      await SecureStore.setItemAsync("user_mobile", claimDigits);
      setForm((current) => ({
        ...current,
        phone: nextUser.phone,
        name: nextUser.name || current.name,
      }));
      setClaimOpen(false);
      setClaimPhone("");
      setClaimCode("");
      setClaimStep("phone");
    } catch (e: any) {
      Alert.alert("Account could not be secured", friendlyErrorMessage(e, "Please try again in a moment."));
    } finally {
      setClaimLoading(false);
    }
  }

  if (!token) return null;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Profile summary */}
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 24,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#F4F1E8",
              borderWidth: 1,
              borderColor: "#E7DEC8",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: INK,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 0.6 }}>{initials}</Text>
            </View>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={2}
              style={{ fontSize: 20, lineHeight: 24, fontWeight: "800", color: INK }}
            >
              {displayName}
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                marginTop: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: "#F4F6FA",
                borderWidth: 1,
                borderColor: "#E8EBF2",
              }}
            >
              <Text numberOfLines={1} style={{ color: "#4B5563", fontSize: 13, fontWeight: "700", letterSpacing: 0.3 }}>
                {form.phone ? form.phone : "Phone not available"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setEditing(true);
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
            }}
            style={{
              backgroundColor: INK,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#2D2D2D",
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", letterSpacing: 0.2 }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {isGuestUser ? (
          <LinearGradient
            colors={["#111827", "#1F2937", "#D4A63D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginTop: 16,
              borderRadius: 24,
              padding: 18,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.16,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 22, lineHeight: 28, fontWeight: "800" }}>
                    Secure this case with your mobile number
                  </Text>
                </View>

                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="shield" size={24} color="#F8E9BF" />
                </View>
              </View>

              <TouchableOpacity
                onPress={openClaimModal}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  paddingVertical: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: INK, fontSize: 16, fontWeight: "800" }}>Verify Account</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : null}

        {/* Community & Support */}
        <Section title="Community & Support">
          <Row icon={<Feather name="gift" size={22} color={INK} />} label="Refer a Friend" onPress={handleShare} />
          <Divider />
          <Row
            icon={<Feather name="message-square" size={22} color={INK} />}
            label="Leave Feedback"
            onPress={() => setFbOpen(true)}
          />
          <Divider />
          <Row
            icon={<Feather name="star" size={22} color={INK} />}
            label="Rate caseFit"
            onPress={openRateApp}
          />
          <Divider />
          <Row
            icon={<Animated.Text style={{ fontSize: 22, transform: [{ scale: supportPulse }] }}>❤️</Animated.Text>}
            label="Support caseFit"
            subtitle="Help someone find justice faster"
            onPress={() => setSupportOpen(true)}
          />
          <Divider />
          <Row icon={<Feather name="help-circle" size={22} color={INK} />} label="Help" onPress={openSupportChooser} />
        </Section>

        {/* Inline EDIT FORM */}
        {editing && (
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
            <Text style={{ fontSize: 18, fontWeight: "700", color: INK, marginBottom: 4 }}>
              Edit Personal Information
            </Text>

            {/* Name */}
            <View>
              <Text style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Full Name</Text>
              <TextInput
                value={String(form.name || "")}
                onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
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
                      onPress={() => setForm((f) => ({ ...f, gender: g }))}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        borderWidth: selected ? 0 : 1,
                        borderColor: BORDER,
                        backgroundColor: selected ? INK : "#fff",
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
                onChangeText={(t) => setForm((f) => ({ ...f, age: t.replace(/\D/g, "") }))}
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
                onChangeText={(t) => setForm((f) => ({ ...f, area: t }))}
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

            {/* Save / Cancel */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
              <TouchableOpacity
                onPress={saveProfile}
                disabled={saving}
                style={{
                  flex: 1,
                  backgroundColor: saving ? "#D1D5DB" : INK,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditing(false)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderColor: BORDER,
                  borderWidth: 1,
                  backgroundColor: "#fff",
                }}
              >
                <Text style={{ color: INK, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout */}
        <Pressable
          onPress={logout}
          style={({ pressed }) => [{ alignSelf: "center", paddingVertical: 16, opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="log-out" size={18} color={INK} />
            <Text style={{ color: INK, fontWeight: "800", textDecorationLine: "underline" }}>LOGOUT</Text>
          </View>
        </Pressable>

        <Text style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, marginBottom: 24 }}>
          v0.1 • caseFit
        </Text>
      </ScrollView>

      {/* Feedback modal */}
      <Modal visible={fbOpen} transparent animationType="slide" onRequestClose={() => setFbOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 8}
        >
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setFbOpen(false);
            }}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: 18,
                paddingBottom: Platform.OS === "ios" ? 30 : 22,
                shadowColor: "#000",
                shadowOpacity: 0.16,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: -10 },
                elevation: 12,
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                <View style={{ alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 46,
                      height: 5,
                      borderRadius: 999,
                      backgroundColor: "#CBD5E1",
                    }}
                  />
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <LinearGradient
                      colors={["#0B1220", "#1F2937"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="message-square" size={21} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 22, lineHeight: 27, fontWeight: "800", color: INK }}>
                        Leave Feedback
                      </Text>
                      <Text style={{ fontSize: 14, color: MUTED, marginTop: 4, lineHeight: 20 }}>
                        Tell us what felt smooth or what deserves a sharper finish.
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 20,
                    backgroundColor: "#F8FAFC",
                    padding: 4,
                    shadowColor: "#0B1220",
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <TextInput
                    value={fbText}
                    onChangeText={setFbText}
                    placeholder="Write your note here..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    returnKeyType="default"
                    blurOnSubmit={false}
                    style={{
                      minHeight: 170,
                      borderRadius: 16,
                      padding: 14,
                      textAlignVertical: "top",
                      backgroundColor: "#FFFFFF",
                      color: INK,
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                  />
                </View>

                <Text
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 12,
                    color: MUTED,
                    fontWeight: "600",
                  }}
                >
                  {fbText.trim().length}/5000
                </Text>

                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={async () => {
                    const payload = {
                      message: fbText.trim(),
                      user_id: form.id ?? user?.id ?? null,
                      phone: form.phone ?? user?.phone ?? null,
                      platform: Platform.OS,
                      at: new Date().toISOString(),
                    };

                    if (!payload.message) return Alert.alert("Please add feedback text.");

                    const posted = await postFeedback(payload);

                    Keyboard.dismiss();
                    setFbOpen(false);
                    setFbText("");
                    if (posted) {
                      setFbSuccessOpen(true);
                    } else {
                      Alert.alert(
                        "Not sent",
                        "We couldn’t submit your feedback right now. Please try again in a moment."
                      );
                    }
                  }}
                  style={{
                    backgroundColor: INK,
                    paddingVertical: 15,
                    borderRadius: 16,
                    alignItems: "center",
                    shadowColor: INK,
                    shadowOpacity: 0.14,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 3,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>Send Feedback</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={supportOpen} transparent animationType="slide" onRequestClose={() => setSupportOpen(false)}>
        <Pressable
          onPress={() => setSupportOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.42)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 18,
              paddingBottom: Platform.OS === "ios" ? 30 : 22,
              gap: 16,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 44, height: 5, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ color: INK, fontSize: 26, lineHeight: 32, fontWeight: "800" }}>
                ❤️ Support caseFit
              </Text>
              <Text style={{ color: MUTED, fontSize: 15, lineHeight: 22 }}>
                Your support helps us keep legal help simpler, faster, and accessible for more people.
              </Text>
            </View>

            <View
              style={{
                borderRadius: 22,
                borderWidth: 1,
                borderColor: BORDER,
                backgroundColor: "#F8FAFC",
                padding: 16,
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 210,
                  height: 210,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#D7DEE9",
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={RAZORPAY_QR_IMAGE}
                  resizeMode="contain"
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              <Text style={{ color: MUTED, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
                Scan the QR code or use the secure Razorpay payment link.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={openRazorpaySupport}
                style={{
                  flex: 1,
                  backgroundColor: INK,
                  borderRadius: 16,
                  paddingVertical: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>Open Razorpay Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSupportOpen(false)}
                style={{
                  paddingHorizontal: 18,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: BORDER,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: INK, fontSize: 16, fontWeight: "800" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={claimOpen} transparent animationType="slide" onRequestClose={() => setClaimOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 8}
        >
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setClaimOpen(false);
            }}
            style={{ flex: 1, backgroundColor: "rgba(11,18,32,0.45)", justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 18,
                paddingBottom: Platform.OS === "ios" ? 28 : 22,
                gap: 14,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text style={{ color: INK, fontSize: 24, lineHeight: 30, fontWeight: "800" }}>
                  Secure your guest account
                </Text>
                <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>
                  Link this case history to your mobile number so you can return anytime with OTP.
                </Text>
              </View>

              <View
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: BORDER,
                  backgroundColor: "#FAFBFD",
                  padding: 14,
                  gap: 12,
                }}
              >
                <Text style={{ color: MUTED, fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }}>
                  Mobile Number
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderRadius: 14,
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: INK, fontSize: 18, fontWeight: "800" }}>+91</Text>
                  <TextInput
                    value={claimDigits}
                    onChangeText={(value) => setClaimPhone(normalizeIndianPhone(value))}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="mobile number"
                    placeholderTextColor="#9CA3AF"
                    style={{ flex: 1, color: INK, fontSize: 18, fontWeight: "700", paddingVertical: 8 }}
                  />
                </View>

                {claimStep === "code" ? (
                  <>
                    <Text style={{ color: MUTED, fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }}>
                      One-Time Password
                    </Text>
                    <TextInput
                      value={claimCode}
                      onChangeText={(value) => setClaimCode(value.replace(/\D/g, "").slice(0, 4))}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Enter OTP"
                      placeholderTextColor="#9CA3AF"
                      style={{
                        borderWidth: 1,
                        borderColor: BORDER,
                        borderRadius: 14,
                        backgroundColor: "#FFFFFF",
                        color: INK,
                        fontSize: 18,
                        fontWeight: "700",
                        paddingHorizontal: 12,
                        paddingVertical: 14,
                      }}
                    />
                  </>
                ) : null}
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {claimStep === "code" ? (
                  <TouchableOpacity
                    onPress={() => setClaimStep("phone")}
                    style={{
                      paddingHorizontal: 16,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: BORDER,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: INK, fontWeight: "700" }}>Back</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={claimStep === "phone" ? requestClaimCode : claimGuestAccount}
                  disabled={claimStep === "phone" ? !canRequestClaimCode : !canConfirmClaim}
                  style={{
                    flex: 1,
                    backgroundColor:
                      claimStep === "phone"
                        ? canRequestClaimCode
                          ? INK
                          : "#9CA3AF"
                        : canConfirmClaim
                        ? INK
                        : "#9CA3AF",
                    borderRadius: 16,
                    paddingVertical: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                    {claimLoading
                      ? claimStep === "phone"
                        ? "Sending OTP…"
                        : "Securing account…"
                      : claimStep === "phone"
                      ? "Send OTP"
                      : "Secure My Account"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={fbSuccessOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFbSuccessOpen(false)}
      >
        <Pressable
          onPress={() => setFbSuccessOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(9,14,24,0.42)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.16,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 82,
                height: 82,
                borderRadius: 41,
                backgroundColor: "#F4F1E8",
                borderWidth: 1,
                borderColor: "#E7DEC8",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  backgroundColor: INK,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="check" size={30} color="#F7E7B6" />
              </View>
            </View>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: INK,
                textAlign: "center",
              }}
            >
              Feedback received
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontSize: 15,
                lineHeight: 23,
                color: MUTED,
                textAlign: "center",
              }}
            >
              {feedbackThankYou}
            </Text>

            <TouchableOpacity
              onPress={() => setFbSuccessOpen(false)}
              style={{
                marginTop: 22,
                minWidth: 180,
                backgroundColor: INK,
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 22,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                Back to profile
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
