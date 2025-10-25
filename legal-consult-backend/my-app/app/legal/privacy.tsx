// my-app/app/(legal)/privacy.tsx
import { ScrollView, Text, Pressable } from "react-native";
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

export default function PrivacyPolicy() {
  const lastUpdated = useMemo(() => new Date().toDateString(), []);

  const openUrl = (url: string) => Linking.openURL(url);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          Privacy Policy
        </Text>

        <Text accessibilityLabel={`Last updated ${lastUpdated}`}>
          Last updated: {lastUpdated}
        </Text>

        <P>
          The CaseFit Company (“CaseFit”, “we”, “our”, or “us”) operates the
          mobile application and website located at{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => openUrl("https://www.thecasefit.com")}
          >
            https://www.thecasefit.com
          </Text>{" "}
          (collectively, the “Platform”). This Privacy Policy describes how we
          collect, use, and protect your information when you use our Platform.
        </P>

        <SectionTitle>1. Information We Collect</SectionTitle>
        <P>We collect the following types of information:</P>
        <Bullet>
          Personal information: such as your name, mobile number, and email
          address when you register or log in via OTP.
        </Bullet>
        <Bullet>
          Payment information: processed securely by third-party payment
          gateways (e.g., Razorpay). We do not store your card or bank details.
        </Bullet>
        <Bullet>
          Usage data: such as app activity, session duration, and device
          information.
        </Bullet>
        <Bullet>
          Analytics and cookies: collected using tools such as Google Analytics
          or Firebase for performance improvement.
        </Bullet>

        <SectionTitle>2. How We Use Your Information</SectionTitle>
        <Bullet>To verify your identity and provide OTP login.</Bullet>
        <Bullet>To process consultation bookings and payments.</Bullet>
        <Bullet>To improve app performance, security, and user experience.</Bullet>
        <Bullet>To personalize app content and legal recommendations.</Bullet>
        <Bullet>To comply with applicable laws and prevent fraud or misuse.</Bullet>

        <SectionTitle>3. AI and Automated Processing</SectionTitle>
        <P>
          Our app may include AI-powered features such as content suggestions,
          summaries, or legal information generation. These outputs are for
          informational purposes only and should not be treated as legal advice.
        </P>

        <SectionTitle>4. Data Storage and Security</SectionTitle>
        <P>
          We store data securely on cloud servers hosted in India and/or AWS
          regions. We use encryption, authentication, and access control to
          protect your data. However, no system is completely secure, and we
          cannot guarantee absolute protection.
        </P>

        <SectionTitle>5. Data Sharing</SectionTitle>
        <P>We may share information with:</P>
        <Bullet>Payment processors (e.g., Razorpay)</Bullet>
        <Bullet>Cloud or analytics providers (e.g., AWS, Firebase)</Bullet>
        <Bullet>Legal or regulatory authorities, if required by law</Bullet>
        <P>We do not sell, rent, or trade your personal data.</P>

        <SectionTitle>6. User Rights</SectionTitle>
        <P>You can request to:</P>
        <Bullet>Access or update your personal information.</Bullet>
        <Bullet>Delete your account and personal data (feature coming soon).</Bullet>
        <Bullet>Opt out of promotional messages.</Bullet>
        <P>
          To exercise these rights, email us at{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => openUrl("mailto:support@thecasefit.com")}
          >
            support@thecasefit.com
          </Text>
          .
        </P>

        <SectionTitle>7. Payment and Refunds</SectionTitle>
        <P>
          Payments are processed through secure third-party gateways. Refunds
          for consultation cancellations will be handled in accordance with our
          Terms & Conditions.
        </P>

        <SectionTitle>8. Children’s Privacy</SectionTitle>
        <P>
          Our services are not intended for children under 18. We do not
          knowingly collect their personal data.
        </P>

        <SectionTitle>9. Policy Updates</SectionTitle>
        <P>
          We may update this Privacy Policy periodically. Continued use of the
          app means you accept the revised version.
        </P>

        <SectionTitle>10. Contact Us</SectionTitle>
        <P>
          For questions or requests, please contact:
          {"\n"}Email:{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => openUrl("mailto:support@thecasefit.com")}
          >
            support@thecasefit.com
          </Text>
          {"\n"}Address: The CaseFit Company, Remote Office, India
        </P>

        {/* (Optional) In-app link to Terms */}
        <P style={{ marginTop: 16 }}>
          Read our{" "}
          <Link href="/legal/terms" style={{ textDecorationLine: "underline" }}>
            Terms & Conditions
          </Link>
          .
        </P>
      </ScrollView>
    </SafeAreaView>
  );
}
