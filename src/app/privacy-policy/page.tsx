import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Alpha Lee Fitness",
  description: "Privacy policy for Alf.lk and Alpha Lee Fitness (Pvt) Ltd.",
};

type PolicySection = {
  title: string;
  intro?: string;
  points?: string[];
  content?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Information We Collect",
    intro: "When you visit our website, we may collect certain information about you, including:",
    points: [
      "Personal identification information such as your name, email address, and phone number, provided voluntarily by you during the registration or checkout process.",
      "Payment and billing information necessary to process your orders, including credit card details, which are securely handled by trusted third-party payment processors.",
      "Browsing information, such as your IP address, browser type, and device information, collected automatically using cookies and similar technologies.",
    ],
  },
  {
    title: "Use of Information",
    intro: "We may use the collected information for the following purposes:",
    points: [
      "To process and fulfill your orders, including shipping and delivery.",
      "To communicate with you regarding your purchases, provide customer support, and respond to inquiries or requests.",
      "To personalize your shopping experience and present relevant product recommendations and promotions.",
      "To improve our website, products, and services based on your feedback and browsing patterns.",
      "To detect and prevent fraud, unauthorized activities, and abuse of our website.",
    ],
  },
  {
    title: "Information Sharing",
    intro: "We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:",
    points: [
      "Trusted service providers: We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering products. These providers are contractually obligated to handle your data securely and confidentially.",
      "Legal requirements: We may disclose your information if required to do so by law or in response to valid legal requests or orders.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Cookies and Tracking Technologies",
    content: [
      "We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our website. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.",
    ],
  },
  {
    title: "Changes to the Privacy Policy",
    content: [
      'We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with a revised "last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information.',
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please contact us using the information provided on our website.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 sm:mb-14">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#FF0000]">
            Alf.lk
          </p>
          <h1 className="font-outfit text-[clamp(2.35rem,10vw,5rem)] font-black leading-[0.95] tracking-tight text-gray-900">
            Privacy <span className="text-[#FF0000]">Policy</span>
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] font-medium leading-relaxed text-gray-600">
            At Alf.lk, we are committed to protecting the privacy and security of our customers&apos; personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or make a purchase on our website. By using our website, you consent to the practices described in this policy.
          </p>
        </div>

        <div className="bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8 md:p-12">
          <div className="space-y-10">
            {policySections.map((section) => (
              <section key={section.title} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                <h2 className="mb-4 font-outfit text-2xl font-black tracking-tight text-gray-900">
                  {section.title}
                </h2>
                {section.intro && (
                  <p className="mb-5 text-[16px] font-medium leading-relaxed text-gray-600">
                    {section.intro}
                  </p>
                )}
                {section.points && (
                  <ul className="space-y-3">
                    {section.points.map((point) => (
                      <li key={point} className="flex items-start text-[16px] font-medium leading-relaxed text-gray-600">
                        <span className="mr-3 mt-2 h-2 w-2 shrink-0 bg-[#FF0000]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
                {section.content && (
                  <div className="space-y-4">
                    {section.content.map((paragraph) => (
                      <p key={paragraph} className="text-[16px] font-medium leading-relaxed text-gray-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
