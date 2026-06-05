import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Alpha Lee Fitness",
  description: "Online coaching and website terms and conditions for Alpha Lee Fitness (Pvt) Ltd.",
};

const terms = [
  {
    title: "Assumption of Risk",
    content: [
      "I understand that all forms of exercise, fitness training, and physical activity carry inherent risks, including injury, illness, or in rare cases, serious harm or death.",
      "I voluntarily choose to participate and accept full responsibility for these risks.",
    ],
  },
  {
    title: "Medical Responsibility",
    content: [
      "I confirm that I am physically and mentally fit to participate in exercise.",
      "I understand that I am responsible for consulting a medical professional before starting any program if I have any health concerns or pre-existing conditions.",
      "I agree to inform Alpha Lee Fitness of any relevant medical conditions or limitations.",
    ],
  },
  {
    title: "No Medical Advice",
    content: [
      "I understand that all coaching, training, and nutrition guidance provided is for educational and fitness purposes only and does not constitute medical advice, diagnosis, or treatment.",
    ],
  },
  {
    title: "Client Responsibility",
    content: [
      "I understand that I am fully responsible for how I perform exercises and follow guidance.",
      "I acknowledge that results depend on multiple factors including adherence, training effort, nutrition consistency, sleep, stress levels, genetics and lifestyle habits.",
      "I understand that results vary between individuals and that the results are influenced by a variety of factors outside Alpha Lee Fitness (Pvt) Ltd. control.",
    ],
  },
  {
    title: "Online Coaching Disclaimer",
    content: [
      "I understand that coaching is delivered remotely and does not involve physical supervision.",
      "I am responsible for ensuring a safe environment when performing exercises.",
    ],
  },
  {
    title: "Liability Waiver",
    content: [
      "To the maximum extent permitted by law, I agree that Alpha Lee Fitness (Pvt) Ltd., including its owners, coaches, and employees, shall not be held liable for any injury, loss, damage, or death arising from participation in the program, whether direct or indirect.",
    ],
  },
  {
    title: "Personal Property",
    content: [
      "I understand that Alpha Lee Fitness is not responsible for any loss or damage to personal property.",
    ],
  },
  {
    title: "No Refund Policy",
    content: [
      "Alpha Lee Fitness (Pvt) Ltd. is committed to delivering all agreed services as outlined in the selected coaching package. In rare and unforeseen circumstances where service delivery is interrupted or cannot be completed as planned, reasonable alternatives such as rescheduling, substitution, or credit extension will be offered at the discretion of Alpha Lee Fitness.",
      "All payments are final and strictly non-refundable. Any adjustments, credits, or service compensations are provided solely at the discretion of Alpha Lee Fitness (Pvt) Ltd. and do not constitute a refund entitlement.",
    ],
  },
  {
    title: "Program Changes",
    content: [
      "I understand that training and nutrition plans may be adjusted or modified by Alpha Lee Fitness at any time to improve results or based on coaching judgment.",
    ],
  },
  {
    title: "Termination",
    content: [
      "I understand that Alpha Lee Fitness may terminate coaching services in cases of misconduct, misuse, or breach of terms.",
    ],
  },
  {
    title: "Minors",
    content: [
      "If I am under 18 years of age, this form must be completed by a parent or legal guardian who accepts full responsibility.",
    ],
  },
];

const acknowledgements = [
  "I have read and understood these terms.",
  "I accept all risks involved.",
  "I agree to all conditions stated above.",
  "I understand this is a legally binding agreement.",
];

const websiteTerms = [
  {
    title: "Use of the Website",
    content: [
      "You must be at least 16 years old to use our website or make purchases.",
      "You are responsible for maintaining the confidentiality of your account information, including your username and password.",
      "You agree to provide accurate and current information during the registration and checkout process.",
      "You may not use our website for any unlawful or unauthorized purposes.",
    ],
  },
  {
    title: "Product Information and Pricing",
    content: [
      "We strive to provide accurate product descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.",
      "Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.",
    ],
  },
  {
    title: "Orders and Payments",
    content: [
      "By placing an order on our website, you are making an offer to purchase the selected products.",
      "We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.",
      "You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and shipping fees, to your chosen payment method.",
      "We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.",
    ],
  },
  {
    title: "Shipping and Delivery",
    content: [
      "We will make reasonable efforts to ensure timely shipping and delivery of your orders.",
      "Shipping and delivery times provided are estimates and may vary based on your location and other factors.",
    ],
  },
  {
    title: "Returns and Refunds",
    content: [
      "Our Returns and Refund Policy governs the process and conditions for returning products and seeking refunds. Please refer to the policy provided on our website for more information.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of Alf.lk or its licensors.",
      "You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "In no event shall Alf.lk, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or the purchase and use of our products.",
      "We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of the products offered on our website.",
    ],
  },
  {
    title: "Amendments and Termination",
    content: [
      "We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 sm:mb-14">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#FF0000]">
            Alpha Lee Fitness (Pvt) Ltd.
          </p>
          <h1 className="font-outfit text-[clamp(2.35rem,10vw,5rem)] font-black leading-[0.95] tracking-tight text-gray-900">
            Online Coaching <span className="text-[#FF0000]">Terms & Conditions</span>
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] font-medium leading-relaxed text-gray-600">
            By submitting this form, I confirm that I have read, understood, and agree to the following terms.
          </p>
        </div>

        <div className="bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8 md:p-12">
          <div className="space-y-10">
            {terms.map((term, index) => (
              <section key={term.title} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                <h2 className="mb-4 font-outfit text-2xl font-black tracking-tight text-gray-900">
                  {index + 1}. {term.title}
                </h2>
                <div className="space-y-4">
                  {term.content.map((paragraph) => (
                    <p key={paragraph} className="text-[16px] font-medium leading-relaxed text-gray-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="mt-8 bg-black p-6 text-white sm:p-8 md:p-10">
          <h2 className="mb-4 font-outfit text-2xl font-black tracking-tight">Acknowledgement</h2>
          <p className="mb-6 text-[16px] font-medium leading-relaxed text-gray-300">
            By ticking below, I confirm that:
          </p>
          <ul className="space-y-3">
            {acknowledgements.map((item) => (
              <li key={item} className="flex items-start text-[16px] font-bold leading-relaxed text-gray-100">
                <span className="mr-3 mt-2 h-2 w-2 shrink-0 bg-[#FF0000]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#FF0000]">
              PayHere Website Policy
            </p>
            <h2 className="font-outfit text-[clamp(2rem,8vw,4rem)] font-black leading-none tracking-tight text-gray-900">
              Website Terms <span className="text-[#FF0000]">and Conditions</span>
            </h2>
            <p className="mt-5 max-w-3xl text-[17px] font-medium leading-relaxed text-gray-600">
              Welcome to Alf.lk. These Terms and Conditions govern your use of our website and the purchase and sale of products from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions.
            </p>
          </div>

          <div className="bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-8 md:p-12">
            <div className="space-y-10">
              {websiteTerms.map((term, index) => (
                <section key={term.title} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                  <h3 className="mb-4 font-outfit text-2xl font-black tracking-tight text-gray-900">
                    {index + 1}. {term.title}
                  </h3>
                  <div className="space-y-4">
                    {term.content.map((paragraph) => (
                      <p key={paragraph} className="text-[16px] font-medium leading-relaxed text-gray-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
