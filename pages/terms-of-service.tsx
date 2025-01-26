// pages/terms-of-service.tsx
import React from "react";

const TermsOfService = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">
        Effective Date: <strong>January 26, 2025</strong>
      </p>
      <p className="mb-4">
        Welcome to HistoVest! By accessing or using our website, you agree to
        the following Terms of Service. Please read them carefully.
      </p>
      <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms:</h2>
      <p className="mb-4">
        By using our website, you agree to comply with and be bound by these
        Terms of Service. If you do not agree, please discontinue use of our
        website.
      </p>
      <h2 className="text-xl font-semibold mb-2">2. Use of the Website:</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You must be at least 18 years old to use this website.</li>
        <li>No unlawful or unauthorized activities are permitted.</li>
        <li>
          We reserve the right to modify or discontinue features without notice.
        </li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">3. Limitation of Liability:</h2>
      <p className="mb-4">
        HistoVest shall not be held liable for any damages or losses incurred
        from the use of our services. Your use of the website is at your own
        risk.
      </p>
      <h2 className="text-xl font-semibold mb-2">4. Intellectual Property:</h2>
      <p className="mb-4">
        All content on this website is the property of HistoVest and is
        protected by copyright laws.
      </p>
      <h2 className="text-xl font-semibold mb-2">5. Account Suspension/Termination:</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate accounts for violations of
        these terms or suspicious activity.
      </p>
      <h2 className="text-xl font-semibold mb-2">6. Governing Law and Dispute Resolution:</h2>
      <p className="mb-4">
        These Terms of Service are governed by the laws of [Your Country/State].
        Any disputes will be resolved through binding arbitration, unless
        otherwise required by applicable law.
      </p>
      <h2 className="text-xl font-semibold mb-2">7. Disclaimer of Warranties:</h2>
      <p className="mb-4">
        HistoVest provides its services on an "as is" and "as available" basis.
        We do not guarantee uninterrupted or error-free service.
      </p>
      <h2 className="text-xl font-semibold mb-2">8. Changes to Terms:</h2>
      <p className="mb-4">
        We reserve the right to update these Terms of Service at any time. Any
        changes will be effective immediately upon posting.
      </p>
      <p>© {currentYear} HistoVest. All rights reserved.</p>
    </div>
  );
};

export default TermsOfService;
