// pages/privacy-policy.tsx
import React from "react";

const PrivacyPolicy = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        Effective Date: <strong>January 26, 2025</strong>
      </p>
      <p className="mb-4">
        At HistoVest, we value your privacy and are committed to protecting
        your information. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you visit our website. By
        using our services, you consent to the practices described in this
        policy.
      </p>
      <h2 className="text-xl font-semibold mb-2">1. Information We Collect:</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Personal Information: Name, email, etc.</li>
        <li>Non-Personal Data: Browser type, device type, IP address, etc.</li>
        <li>Cookies and similar tracking technologies.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information:</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To operate and improve our services.</li>
        <li>To communicate updates and marketing materials (with consent).</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">3. Cookies and Third-Party Sharing:</h2>
      <p className="mb-4">
        We use cookies and similar technologies to track user activity and
        provide personalized ads. Information may be shared with trusted
        third-party providers such as Google Analytics, advertising platforms,
        and API services like OpenAI.
      </p>
      <h2 className="text-xl font-semibold mb-2">4. Data Retention:</h2>
      <p className="mb-4">
        We retain personal information as long as necessary for service
        delivery or legal compliance. Non-personal data may be retained for
        analytics purposes.
      </p>
      <h2 className="text-xl font-semibold mb-2">5. Your Rights:</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal
        information. Contact us at{" "}
        <a href="mailto:support@histovest.com" className="text-blue-500">
          support@histovest.com
        </a>
        .
      </p>
      <h2 className="text-xl font-semibold mb-2">6. Governing Law:</h2>
      <p className="mb-4">
        This Privacy Policy is governed by the laws of [Your Country/State].
        Users in the EU may have additional rights under GDPR.
      </p>
      <h2 className="text-xl font-semibold mb-2">7. Updates to this Policy:</h2>
      <p className="mb-4">
        We may update this policy periodically. Check this page for the latest
        version.
      </p>
      <p>© {currentYear} HistoVest. All rights reserved.</p>
    </div>
  );
};

export default PrivacyPolicy;
