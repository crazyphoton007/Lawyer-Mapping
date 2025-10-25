// my-app/app/(legal)/terms.tsx
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Linking } from "react-native";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 16 }}>
      {children}
    </Text>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={{ lineHeight: 22, marginTop: 8 }}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ lineHeight: 22, marginTop: 4 }}>
      {"\u2022"} {children}
    </Text>
  );
}

export default function TermsAndConditions() {
  const lastUpdated = useMemo(() => new Date().toDateString(), []);
  const openMail = () => Linking.openURL("mailto:support@thecasefit.com");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          Terms and Conditions
        </Text>

        <Text accessibilityLabel={`Last updated ${lastUpdated}`}>
          Last updated: {lastUpdated}
        </Text>

        <P>
          Welcome to CaseFit. By accessing or using the CaseFit mobile
          application or website (the “Platform”), you agree to these Terms and
          Conditions (“Terms”). Please read them carefully.
        </P>

        <SectionTitle>1. Overview</SectionTitle>
        <P>
          The CaseFit Company (“we”, “us”, “our”) provides a technology platform
          that connects users seeking legal consultations with independent
          lawyers. CaseFit does not provide legal advice, representation, or
          services directly.
        </P>

        <SectionTitle>2. Account Registration</SectionTitle>
        <P>
          You must be 18 years or older to use this app. Registration is done
          via secure OTP verification. You are responsible for maintaining the
          confidentiality of your account and for all activities under it.
        </P>

        <SectionTitle>3. Services</SectionTitle>
        <P>
          CaseFit allows users to request consultations with registered lawyers
          and make payments for those consultations. The actual advice or
          service is delivered independently by the lawyer. CaseFit is not a
          party to any lawyer–client relationship.
        </P>

        <SectionTitle>4. Payments and Refunds</SectionTitle>
        <P>
          All consultation charges (currently ₹200) are processed through secure
          payment gateways. Once a booking is confirmed, cancellations and
          refunds are subject to the lawyer’s availability and platform policy.
          Refunds, if applicable, will be processed within 5–7 business days.
        </P>

        <SectionTitle>5. Prohibited Activities</SectionTitle>
        <Bullet>Misuse or attempt to hack the app.</Bullet>
        <Bullet>Impersonate another person or submit false information.</Bullet>
        <Bullet>Use CaseFit for unlawful, fraudulent, or harmful purposes.</Bullet>
        <Bullet>Share or upload sensitive documents not required for booking.</Bullet>

        <SectionTitle>6. Intellectual Property</SectionTitle>
        <P>
          All app content, logos, code, and materials are owned by The CaseFit
          Company. You may not copy, reproduce, or distribute them without
          written consent.
        </P>

        <SectionTitle>7. AI-Generated or Automated Content</SectionTitle>
        <P>
          Any AI-powered responses, summaries, or insights provided through
          CaseFit are for educational or informational use only. They do not
          constitute legal advice.
        </P>

        <SectionTitle>8. Limitation of Liability</SectionTitle>
        <P>
          CaseFit acts as a digital intermediary. We are not responsible for the
          accuracy, quality, or outcome of any advice provided by third-party
          lawyers. In no event shall CaseFit or its affiliates be liable for any
          indirect, incidental, or consequential damages.
        </P>

        <SectionTitle>9. Termination</SectionTitle>
        <P>
          We may suspend or terminate your account if you violate these Terms or
          engage in behavior that harms the platform or other users.
        </P>

        <SectionTitle>10. Account Deletion and Data Removal</SectionTitle>
        <P>
          Users will soon be able to delete their accounts and request complete
          data removal by contacting{" "}
          <Text style={{ textDecorationLine: "underline" }} onPress={openMail}>
            support@thecasefit.com
          </Text>
          .
        </P>

        <SectionTitle>11. Changes to These Terms</SectionTitle>
        <P>
          We may update these Terms occasionally. Your continued use of the app
          after changes are published constitutes your acceptance of the revised
          Terms.
        </P>

        <SectionTitle>12. Governing Law and Dispute Resolution</SectionTitle>
        <P>
          These Terms shall be governed by and construed in accordance with the
          laws of India. Any disputes shall be subject to the exclusive
          jurisdiction of the courts of Lucknow, Uttar Pradesh, India.
        </P>

        <SectionTitle>13. Contact</SectionTitle>
        <P>
          For any questions regarding these Terms, please contact:
          {"\n"}Email:{" "}
          <Text style={{ textDecorationLine: "underline" }} onPress={openMail}>
            support@thecasefit.com
          </Text>
          {"\n"}Address: The CaseFit Company, Remote Office, India
        </P>

        {/* (Optional) In-app link back to Privacy */}
        <P style={{ marginTop: 16 }}>
          Read our{" "}
          <Link href="/legal/privacy" style={{ textDecorationLine: "underline" }}>
            Privacy Policy
          </Link>
          .
        </P>
      </ScrollView>
    </SafeAreaView>
  );
}
