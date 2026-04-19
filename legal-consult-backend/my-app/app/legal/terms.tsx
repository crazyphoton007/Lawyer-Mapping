// my-app/app/(legal)/terms.tsx
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useMemo } from "react";
import { Linking } from "react-native";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 19,
        fontWeight: "800",
        marginTop: 28,
        marginBottom: 4,
        color: "#0B1220",
      }}
    >
      {children}
    </Text>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        lineHeight: 28,
        marginTop: 12,
        color: "#4B5563",
        fontSize: 16,
      }}
    >
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 10 }}>
      <Text style={{ color: "#0B1220", fontSize: 16, lineHeight: 26, marginRight: 10 }}>•</Text>
      <Text style={{ flex: 1, color: "#4B5563", fontSize: 16, lineHeight: 28 }}>{children}</Text>
    </View>
  );
}

export default function TermsAndConditions() {
  const lastUpdated = useMemo(() => new Date().toDateString(), []);
  const openMail = () => Linking.openURL("mailto:support@thecasefit.com");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#6B7280", letterSpacing: 1.6 }}>
            LEGAL
          </Text>
          <Text style={{ fontSize: 34, fontWeight: "800", marginTop: 10, color: "#0B1220", letterSpacing: -0.8 }}>
            Terms & Conditions
          </Text>
          <Text
            accessibilityLabel={`Last updated ${lastUpdated}`}
            style={{ marginTop: 10, color: "#6B7280", fontSize: 14 }}
          >
            Last updated {lastUpdated}
          </Text>
          <Text style={{ marginTop: 16, color: "#4B5563", lineHeight: 28, fontSize: 16 }}>
            These Terms & Conditions govern your use of caseFit across the app, website,
            consultations, payment flow, support interactions, and any related services we provide.
          </Text>
        </View>

        <P>
          Welcome to caseFit. By accessing or using the caseFit mobile application or website
          (the “Platform”), you agree to these Terms & Conditions (“Terms”). If you do not agree,
          please discontinue use of the Platform.
        </P>

        <SectionTitle>1. Overview</SectionTitle>
        <P>
          The caseFit Company (“caseFit”, “we”, “us”, or “our”) operates a technology platform
          that connects users seeking legal consultations with independent lawyers and legal
          professionals. caseFit does not itself provide legal representation or legal advice.
        </P>

        <SectionTitle>2. Eligibility and Account Access</SectionTitle>
        <P>
          You must be at least 18 years old, or otherwise legally permitted under applicable law,
          to use the Platform independently. Account access is currently managed through OTP-based
          verification. You are responsible for activity that occurs through your account or device.
        </P>

        <SectionTitle>3. Nature of Services</SectionTitle>
        <P>
          caseFit helps you discover, request, and manage legal consultations. The advice,
          representation, or legal services themselves are delivered independently by lawyers.
          caseFit is not a party to the lawyer–client relationship and does not guarantee the
          outcome of any consultation, claim, proceeding, or legal strategy.
        </P>

        <SectionTitle>4. Booking, Scheduling, and Consultation Flow</SectionTitle>
        <P>
          When you raise a request, caseFit may collect the category of your issue, scheduling
          preferences, notes, and other operational details necessary to coordinate the consultation.
          Lawyers may be assigned or suggested based on availability, category, or platform workflow.
        </P>

        <SectionTitle>5. Payments and Refunds</SectionTitle>
        <P>
          Consultation charges are processed through secure third-party payment partners. Pricing,
          cancellations, rescheduling, and refunds may depend on the consultation stage, lawyer
          availability, and platform policy in effect at the time of booking. Where applicable,
          eligible refunds are processed through the original payment method within a reasonable
          operational timeline.
        </P>

        <SectionTitle>6. Acceptable Use</SectionTitle>
        <P>You agree not to misuse the Platform or interfere with its integrity, safety, or operation.</P>
        <Bullet>Impersonate another person, submit false information, or misrepresent your identity.</Bullet>
        <Bullet>Attempt unauthorized access, scraping, tampering, reverse engineering, or disruption of the Platform.</Bullet>
        <Bullet>Use caseFit for unlawful, fraudulent, abusive, harmful, or misleading purposes.</Bullet>
        <Bullet>Upload or share documents, content, or material you do not have the right to provide.</Bullet>
        <Bullet>Use the Platform in a way that threatens lawyers, users, staff, or support personnel.</Bullet>

        <SectionTitle>7. Content, Platform Materials, and Intellectual Property</SectionTitle>
        <P>
          The caseFit name, logo, interface design, code, content, workflows, and platform materials
          are owned by or licensed to The caseFit Company. Except where expressly permitted, you may
          not copy, reproduce, distribute, republish, modify, or exploit them without prior written approval.
        </P>

        <SectionTitle>8. AI-Assisted or Automated Features</SectionTitle>
        <P>
          caseFit may include AI-assisted summaries, educational content, guidance, recommendations,
          or automated workflows. These are designed to support product experience and operational
          efficiency. They do not replace a lawyer’s independent advice, judgment, or professional responsibility.
        </P>

        <SectionTitle>9. Third-Party Services</SectionTitle>
        <P>
          The Platform may rely on or link to third-party services such as payment gateways, analytics
          providers, infrastructure vendors, communication tools, or external legal resources. Those
          services operate under their own terms and policies, and caseFit is not responsible for systems
          outside its direct control.
        </P>

        <SectionTitle>10. Limitation of Liability</SectionTitle>
        <P>
          caseFit acts as a digital coordination layer and intermediary platform. To the fullest extent
          permitted by law, caseFit and its affiliates are not liable for indirect, incidental, special,
          consequential, or punitive damages, including loss of opportunity, loss of data, business interruption,
          dissatisfaction with legal outcome, or reliance on third-party services or professional advice.
        </P>

        <SectionTitle>11. Suspension or Termination</SectionTitle>
        <P>
          We may suspend, restrict, or terminate access to the Platform where we believe it is reasonably
          necessary for security, policy enforcement, fraud prevention, legal compliance, abuse handling,
          or protection of users, lawyers, or the business.
        </P>

        <SectionTitle>12. Privacy and Data Handling</SectionTitle>
        <P>
          Your use of caseFit is also governed by our Privacy Policy, which explains how we collect,
          use, store, and share personal information. By using the Platform, you acknowledge that your
          information may be handled in accordance with that policy.
        </P>

        <SectionTitle>13. Account Deletion and Support Requests</SectionTitle>
        <P>
          If you want to request account deletion, data-related support, or operational help, contact{" "}
          <Text style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }} onPress={openMail}>
            support@thecasefit.com
          </Text>
          . Some information may be retained where required for legal, security, audit, payment, or dispute-resolution reasons.
        </P>

        <SectionTitle>14. Changes to These Terms</SectionTitle>
        <P>
          We may revise these Terms from time to time to reflect changes in the product, legal requirements,
          business operations, or platform policies. Continued use of caseFit after updated Terms are published
          means you accept the revised version.
        </P>

        <SectionTitle>15. Governing Law and Jurisdiction</SectionTitle>
        <P>
          These Terms shall be governed by and interpreted in accordance with the laws of India.
          Subject to applicable law, disputes shall fall under the jurisdiction of the courts of
          Lucknow, Uttar Pradesh, India.
        </P>

        <SectionTitle>16. Contact</SectionTitle>
        <P>
          For questions regarding these Terms & Conditions, please contact:
          {"\n"}Email:{" "}
          <Text style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }} onPress={openMail}>
            support@thecasefit.com
          </Text>
          {"\n"}Address: The caseFit Company, Remote Office, India
        </P>

        <P>
          Read our{" "}
          <Link href="/legal/privacy" style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }}>
            Privacy Policy
          </Link>{" "}
          for more detail on how personal information is collected and handled on the Platform.
        </P>
      </ScrollView>
    </SafeAreaView>
  );
}
