// my-app/app/(legal)/privacy.tsx
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

export default function PrivacyPolicy() {
  const lastUpdated = useMemo(() => new Date().toDateString(), []);

  const openUrl = (url: string) => Linking.openURL(url);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#6B7280", letterSpacing: 1.6 }}>
            LEGAL
          </Text>
          <Text style={{ fontSize: 34, fontWeight: "800", marginTop: 10, color: "#0B1220", letterSpacing: -0.8 }}>
            Privacy Policy
          </Text>
          <Text
            accessibilityLabel={`Last updated ${lastUpdated}`}
            style={{ marginTop: 10, color: "#6B7280", fontSize: 14 }}
          >
            Last updated {lastUpdated}
          </Text>
          <Text style={{ marginTop: 16, color: "#4B5563", lineHeight: 28, fontSize: 16 }}>
            Your trust matters to us. This policy explains what caseFit collects, why we collect it,
            how it is used, and the choices available to you across the app, website, consultations,
            payments, and support interactions.
          </Text>
        </View>

        <P>
          The caseFit Company (“caseFit”, “we”, “our”, or “us”) operates the caseFit mobile
          application and website located at{" "}
          <Text
            style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }}
            onPress={() => openUrl("https://www.thecasefit.com")}
          >
            https://www.thecasefit.com
          </Text>{" "}
          (collectively, the “Platform”). By accessing or using caseFit, you acknowledge that
          your information may be collected, used, stored, and shared as described in this Policy.
        </P>

        <SectionTitle>1. Scope of this Policy</SectionTitle>
        <P>
          This Policy applies to information collected through the caseFit app, our website, our
          support channels, consultation booking flow, payment flow, and other features we may
          introduce from time to time. It covers both registered users and visitors who interact
          with our services.
        </P>

        <SectionTitle>2. Information We Collect</SectionTitle>
        <P>Depending on how you use caseFit, we may collect the following categories of information:</P>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Account and profile information:</Text> your
          name, mobile number, email address, gender, age, city or area, and other profile details you choose to provide.
        </Bullet>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Consultation and case information:</Text> the
          category of your legal issue, appointment preferences, notes you submit, and details shared during the request flow.
        </Bullet>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Payment information:</Text> payment status,
          transaction references, and billing-related metadata processed through trusted third-party payment partners such as Razorpay.
          We do not store your full card or bank details on our own systems.
        </Bullet>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Technical and usage information:</Text> device
          type, operating system, app version, browser information, IP address, session activity, diagnostic data, and interaction patterns.
        </Bullet>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Communications and feedback:</Text> messages
          sent to support, feedback you submit inside the app, and records of service-related communications.
        </Bullet>
        <Bullet>
          <Text style={{ fontWeight: "700", color: "#0B1220" }}>Analytics and cookies:</Text> information
          collected through analytics, diagnostics, and performance tools used to improve reliability and user experience.
        </Bullet>

        <SectionTitle>3. How We Use Your Information</SectionTitle>
        <P>We use your information to operate caseFit responsibly and deliver the experience you expect.</P>
        <Bullet>To create and manage your account and verify your identity, including OTP-based login.</Bullet>
        <Bullet>To help you raise consultation requests, process bookings, and coordinate appointments.</Bullet>
        <Bullet>To assign lawyers, share scheduling details, and maintain request history and case status updates.</Bullet>
        <Bullet>To process payments, confirm transactions, prevent payment fraud, and support refunds where applicable.</Bullet>
        <Bullet>To improve app performance, stability, service quality, design decisions, and customer support.</Bullet>
        <Bullet>To communicate important service updates, confirmations, issue resolution, and support responses.</Bullet>
        <Bullet>To detect abuse, misuse, suspicious activity, security incidents, and legal or policy violations.</Bullet>
        <Bullet>To comply with applicable law, lawful requests, legal process, and internal risk management obligations.</Bullet>

        <SectionTitle>4. AI and Automated Processing</SectionTitle>
        <P>
          caseFit may include AI-assisted features such as summaries, content suggestions, legal education
          material, or guided experiences. These tools are intended to support discovery and user experience.
          They do not replace independent legal advice, professional judgment, or a lawyer–client relationship.
        </P>

        <SectionTitle>5. Legal Basis and Consent</SectionTitle>
        <P>
          We process personal information where it is necessary to provide our services, fulfill our contractual
          obligations, maintain platform security, comply with legal obligations, or where you have consented to
          particular uses such as optional communications or support interactions.
        </P>

        <SectionTitle>6. Data Storage, Retention, and Security</SectionTitle>
        <P>
          We use reasonable technical and organizational safeguards designed to protect your information,
          including access controls, authentication, encryption, logging, and role-based restrictions where appropriate.
          Your data may be stored on secure cloud infrastructure, including services hosted in India and/or other
          cloud regions used by our providers. We retain information only for as long as it is needed for service delivery,
          legal compliance, dispute resolution, security, audit requirements, or other legitimate business purposes.
          No system can guarantee absolute security, but we work to maintain commercially reasonable protections.
        </P>

        <SectionTitle>7. How We Share Information</SectionTitle>
        <P>We may share limited information where necessary with:</P>
        <Bullet>Lawyers or legal professionals connected to your consultation request.</Bullet>
        <Bullet>Payment partners such as Razorpay for transaction processing and payment verification.</Bullet>
        <Bullet>Cloud hosting, infrastructure, communications, and analytics vendors who support our services.</Bullet>
        <Bullet>Service providers that help us with customer support, security monitoring, diagnostics, and product operations.</Bullet>
        <Bullet>Regulators, law enforcement, courts, or government authorities when required by law or lawful order.</Bullet>
        <Bullet>Professional advisers or acquirers in connection with business restructuring, financing, diligence, or transfer events.</Bullet>
        <P>We do not sell your personal information and we do not trade user data as a commercial asset.</P>

        <SectionTitle>8. Your Choices and Rights</SectionTitle>
        <P>Depending on applicable law and product availability, you may request to:</P>
        <Bullet>Access or update your profile and personal information.</Bullet>
        <Bullet>Correct inaccurate information associated with your account.</Bullet>
        <Bullet>Request deletion of your account or certain personal data, subject to legal and operational limits.</Bullet>
        <Bullet>Opt out of promotional communications while continuing to receive essential service-related updates.</Bullet>
        <Bullet>Raise concerns about how your information is used or request additional support.</Bullet>
        <P>
          To exercise these rights or make a privacy-related request, email us at{" "}
          <Text
            style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }}
            onPress={() => openUrl("mailto:support@thecasefit.com")}
          >
            support@thecasefit.com
          </Text>
          .
        </P>

        <SectionTitle>9. OTP, Notifications, and Communications</SectionTitle>
        <P>
          We may use your mobile number, email address, or approved communication channels to send login codes,
          service confirmations, payment updates, appointment details, feedback acknowledgements, and essential account messages.
          Promotional communication, if introduced, will be managed separately and may be turned off where available.
        </P>

        <SectionTitle>10. Payment and Refund Information</SectionTitle>
        <P>
          Payments are processed through secure third-party gateways. Refunds, cancellations, and payment disputes
          are handled in accordance with our operational policies and applicable Terms & Conditions. We may retain
          limited transaction metadata for reconciliation, fraud prevention, compliance, and customer support.
        </P>

        <SectionTitle>11. Children’s Privacy</SectionTitle>
        <P>
          caseFit is not intended for children under the age of 18. We do not knowingly collect personal data from
          minors without appropriate authorization. If you believe a child has submitted personal information through
          the Platform, please contact us so we can review and take appropriate action.
        </P>

        <SectionTitle>12. Third-Party Links and Services</SectionTitle>
        <P>
          Our app or website may contain links to third-party sites, payment gateways, court resources, or external tools.
          Those services operate under their own policies and practices. We are not responsible for the privacy practices
          of third-party services that are not controlled by caseFit.
        </P>

        <SectionTitle>13. Policy Updates</SectionTitle>
        <P>
          We may update this Privacy Policy from time to time to reflect changes in the product, legal requirements,
          business operations, or service providers. When we make material changes, we may revise the date above and,
          where appropriate, provide additional notice through the app or website.
        </P>

        <SectionTitle>14. Contact Us</SectionTitle>
        <P>
          For privacy questions, support requests, or data-related concerns, please contact:
          {"\n"}Email:{" "}
          <Text
            style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }}
            onPress={() => openUrl("mailto:support@thecasefit.com")}
          >
            support@thecasefit.com
          </Text>
          {"\n"}Address: The caseFit Company, Remote Office, India
        </P>

        <P>
          If you do not agree with this Privacy Policy, please discontinue use of the Platform. Continued use of caseFit
          after updates or notices means you accept the revised version of this Policy.
        </P>

        <P>
          Read our{" "}
          <Link href="/legal/terms" style={{ textDecorationLine: "underline", color: "#0B1220", fontWeight: "700" }}>
            Terms & Conditions
          </Link>
          {" "}for additional information on bookings, payments, platform use, and service rules.
        </P>
      </ScrollView>
    </SafeAreaView>
  );
}
