import React from "react";
import { useNavigate } from "react-router";
import { FiX } from "react-icons/fi";

const PolicyPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-surface-ground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-surface-card rounded-2xl shadow-sm border border-border-default overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary/5 px-8 py-10 border-b border-border-default relative">
          <button 
            onClick={() => navigate("/auth/signup")} 
            className="absolute top-6 right-6 p-2 text-text-muted hover:text-primary transition-colors hover:bg-white/50 rounded-full"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div className="mt-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight mb-4">
              Privacy Policy & Terms
            </h1>
            <p className="text-text-muted text-lg">
              Last updated: January 11, 2026
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-8 py-10 sm:px-12 space-y-12">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-main border-b border-border-default pb-2">
              1. Introduction
            </h2>
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                Welcome to the Systematic Review Support System (PrismaSLR). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services.
              </p>
              <p>
                This policy outlines our handling practices and how we collect and use the personal data you provide during your interactions with us.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-main border-b border-border-default pb-2">
              2. Data Collection
            </h2>
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                We collect information to provide better services to all our users. The types of information we collect include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-text-main font-medium">Account Data:</strong> When you register, we collect information such as your name, email address, and professional affiliation.
                </li>
                <li>
                  <strong className="text-text-main font-medium">Research Data:</strong> Data you input for systematic reviews is stored securely and is only accessible by you and your designated collaborators.
                </li>
                <li>
                  <strong className="text-text-main font-medium">Usage Data:</strong> We gather data about how you interact with our services to improve system performance and user experience.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-main border-b border-border-default pb-2">
              3. User Responsibilities
            </h2>
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                By using our services, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Ensure that any data you upload complies with applicable laws and ethical guidelines.</li>
                <li>Respect the intellectual property rights of others.</li>
              </ul>
              <p>
                Violation of these terms may result in the suspension or termination of your account.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-main border-b border-border-default pb-2">
              4. Security Measures
            </h2>
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-border-default text-center">
          <p className="text-text-muted text-sm">
            For questions about this policy, please contact us at <span className="text-primary font-medium hover:underline cursor-pointer">privacy@prismaslr.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
