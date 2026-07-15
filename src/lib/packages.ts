export type PackageCategory = 'All' | 'Bundles' | 'Monthly' | 'Annual' | 'One-Off';
export type PaidPackageCategory = Exclude<PackageCategory, 'All'>;

export type PackageOption = {
  id: string;
  category: PaidPackageCategory;
  letter: string;
  title: string;
  subtitle: string;
  price: string;
  oldPriceText?: string;
  strikeOldPrice?: boolean;
  footerText: string;
  isPopular?: boolean;
  detailSubtitle: string;
  example: string;
  features: string[];
  suitableFor?: string[];
  footnote?: string;
};

export const PACKAGE_CATEGORIES: PackageCategory[] = ['All', 'Bundles', 'Annual', 'Monthly', 'One-Off'];
export const REPLY_GUARANTEE_ADDON_PRICE = 5000;

export const PACKAGES: PackageOption[] = [
  {
    id: 'annual',
    category: 'Annual',
    letter: 'A',
    title: 'Annual Package',
    subtitle: '12 Months',
    price: 'Rs. 148,500',
    oldPriceText: 'Rs. 360,000',
    strikeOldPrice: true,
    footerText: '+ Top Tier Support',
    detailSubtitle: '12 Month service subscription. recommended for individuals with longterm goals',
    example: 'Invest in the longer term & save yourself some dough',
    features: [
      'Flexible meal plan adapted across the months',
      'Training plan personalized to goals & lifestyle',
      'Progress Check ins every 2 weeks for 3 months there on, every 4 weeks',
      'Dietary Supplementation guide',
      '48-72 Hour whatsapp reply guarantee',
      'Pause-resume service for legitimate reasons like health or travel',
      'Voice calls can be prescheduled'
    ]
  },
  {
    id: 'rookie',
    category: 'Bundles',
    letter: 'R',
    title: 'Rookie Bundle',
    subtitle: '03 Months',
    price: 'Rs. 81,500',
    footerText: '+ High Attention',
    isPopular: true,
    detailSubtitle: '03 Month service subscription. recommended for individuals seeking higher levels of attention from the coaching service.',
    example: 'Example: Beginners',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every week for 4 weeks. There on, progress check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'intermediate',
    category: 'Bundles',
    letter: 'I',
    title: 'Intermediate Bundle',
    subtitle: '03 Months',
    price: 'Rs. 66,500',
    footerText: '+ Moderate Attention',
    detailSubtitle: '03 Month service subscription. recommended for individuals seeking moderate levels of attention from the coaching service.',
    example: 'Example: experienced beginners or intermediates',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 2 weeks for 4 weeks. There on, progress check ins every 4 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'advanced',
    category: 'Bundles',
    letter: 'A',
    title: 'Advanced Bundle',
    subtitle: '06 Months',
    price: 'Rs. 98,500',
    footerText: '+ Lower Attention',
    detailSubtitle: '06 Month service subscription. recommended for individuals seeking lower levels of attention from the coaching service.',
    example: 'Example: advanced or more independent intermediates',
    features: [
      'Meal plan personalized to your goals',
      'Training plan personalized to your fitness capacity',
      'Progress Check ins every 4 weeks for 3 months. There on, progress check ins every 6 weeks for continued plan adjustments',
      'Supplementation guide',
      '72-96 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'package-1',
    category: 'Monthly',
    letter: 'P1',
    title: 'Package 1',
    subtitle: '1 Month',
    price: 'Rs. 35,500',
    oldPriceText: 'Rs. 33,500',
    strikeOldPrice: false,
    footerText: '+ High Attention',
    detailSubtitle: '1 month service - charged monthly. High attention package.',
    example: 'For maximum weekly accountability',
    features: [
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Weekly Progress Check ins for continued plan adjustments',
      'Alpha Chef recipe Ebook (30+ recipes)',
      'Supplementation guide',
      '24-48 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'package-2',
    category: 'Monthly',
    letter: 'P2',
    title: 'Package 2',
    subtitle: '1 Month',
    price: 'Rs. 32,500',
    oldPriceText: 'Rs. 30,500',
    strikeOldPrice: false,
    footerText: '+ Moderate Attention',
    detailSubtitle: '1 month service - charged monthly. moderate attention package.',
    example: 'For standard accountability',
    features: [
      'Meal plan personalized to your goals',
      '4 week training plan personalized to your fitness capacity and goals',
      'Progress Check ins every 2 weeks for continued plan adjustments',
      'Supplementation guide',
      '48-72 Hour whatsapp reply guarantee'
    ]
  },
  {
    id: 'training-only',
    category: 'One-Off',
    letter: 'T',
    title: 'Training Plan Only',
    subtitle: '6 Weeks',
    price: 'Rs. 22,500',
    footerText: 'No Coaching',
    detailSubtitle: 'One-time plans that include a customized training plan only.',
    example: '6 week training plan',
    features: [
      'Built to your fitness levels',
      'Customised to your gym or home training environment',
      'Customised to your physique goals',
      'Not online coaching'
    ]
  },
  {
    id: 'meal-only',
    category: 'One-Off',
    letter: 'M',
    title: 'Meal Plan Only',
    subtitle: 'One Time',
    price: 'Rs. 22,500',
    footerText: 'No Coaching',
    detailSubtitle: 'One-time plans that include a customized meal plan only.',
    example: 'One time meal plan',
    features: [
      'Meal plan personalized to your goals',
      'Meal options customised to your like and dislikes',
      'Supplementation guide',
      'Not online coaching'
    ]
  },
  {
    id: 'consult-inperson',
    category: 'One-Off',
    letter: 'IC',
    title: 'In-Person Consultation',
    subtitle: 'Face-To-Face Fitness Guidance',
    price: 'Rs. 15,000',
    footerText: 'Personalised Guidance',
    detailSubtitle: 'A personalised consultation for clients who prefer direct interaction and coaching.',
    example: 'Ideal for goals, nutrition, training challenges and plateaus',
    suitableFor: [
      'Reviewing your current training approach',
      'Discussing fitness goals',
      'Getting guidance on training and nutrition',
      'Addressing challenges or plateaus'
    ],
    features: [
      'One-on-one consultation',
      'Personalised recommendations',
      'Training and nutrition guidance',
      'Clear next steps based on your goals'
    ]
  },
  {
    id: 'consult-online',
    category: 'One-Off',
    letter: 'OC',
    title: 'Online Consultation',
    subtitle: 'Expert Guidance From Anywhere',
    price: 'Rs. 10,500',
    footerText: 'Personalised Guidance',
    detailSubtitle: 'A convenient option for personalised advice through an online consultation.',
    example: 'Ideal for training, nutrition, goal setting and progress reviews',
    suitableFor: [
      'Training guidance',
      'Nutrition questions',
      'Goal setting',
      'Reviewing progress',
      'Troubleshooting your current approach'
    ],
    features: [
      'One-on-one online consultation',
      'Personalised recommendations',
      'Training and nutrition guidance',
      'Actionable steps to move forward'
    ]
  },
  {
    id: 'programme-review',
    category: 'One-Off',
    letter: 'PR',
    title: 'Training Programme Review',
    subtitle: 'Programme Assessment',
    price: 'Rs. 5,500',
    footerText: 'Professional Assessment',
    detailSubtitle: 'Get expert feedback on your current workout programme without needing a completely new programme.',
    example: 'Find out whether your programme is structured correctly',
    footnote: 'Ideal for anyone who wants expert feedback without needing a completely new programme.',
    features: [
      'Exercise selection review',
      'Training volume assessment',
      'Training frequency review',
      'Programme structure analysis',
      'Progression recommendations',
      'Areas for improvement'
    ]
  },
  {
    id: 'technique-single',
    category: 'One-Off',
    letter: 'SR',
    title: 'Single Exercise Review',
    subtitle: 'Review One Exercise',
    price: 'Rs. 2,500',
    footerText: 'Video Technique Review',
    detailSubtitle: 'Perfect if you need professional feedback on one specific movement.',
    example: 'Focused technique feedback for one exercise',
    features: [
      'Video technique assessment',
      'Feedback on execution',
      'Key corrections and recommendations'
    ]
  },
  {
    id: 'technique-full',
    category: 'One-Off',
    letter: 'FR',
    title: 'Full Technique Review',
    subtitle: 'Review Up To 10 Exercises',
    price: 'Rs. 7,500',
    footerText: 'Complete Technique Review',
    detailSubtitle: 'Ideal for a more complete assessment of your training technique.',
    example: 'Professional feedback for up to 10 exercises',
    features: [
      'Review of up to 10 exercises',
      'Technique feedback for each movement',
      'Corrections and coaching cues',
      'Recommendations to improve performance and safety'
    ]
  }
];

export function getPackageById(packageId: string | null) {
  return PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}

export function parseLkrPrice(price: string) {
  return Number(price.replace(/[^0-9]/g, ''));
}

export function formatLkrPrice(amount: number) {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export function getPackageTotalPrice(packageId: string | null, includeReplyGuarantee: boolean) {
  const selectedPackage = getPackageById(packageId);
  const basePrice = selectedPackage ? parseLkrPrice(selectedPackage.price) : 0;
  const addonPrice = includeReplyGuarantee ? REPLY_GUARANTEE_ADDON_PRICE : 0;

  return {
    basePrice,
    addonPrice,
    totalPrice: basePrice + addonPrice,
    formattedBasePrice: formatLkrPrice(basePrice),
    formattedAddonPrice: formatLkrPrice(addonPrice),
    formattedTotalPrice: formatLkrPrice(basePrice + addonPrice),
  };
}
