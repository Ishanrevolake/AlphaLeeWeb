export type AskAlphaOffer = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceLkr: number;
  questionCredits: number;
  responseWindowHours: number;
  isVideoReview?: boolean;
  features: string[];
};

export const ASK_ALPHA_OFFERS: AskAlphaOffer[] = [
  {
    id: "single-question",
    title: "Single Question Credit",
    subtitle: "One Focused Question",
    description: "Best for one specific question or clarification.",
    priceLkr: 990,
    questionCredits: 1,
    responseWindowHours: 72,
    features: [
      "One detailed response",
      "Training, nutrition, or fitness guidance",
      "Answer delivered through your client dashboard",
    ],
  },
  {
    id: "five-question-pack",
    title: "5 Question Credit Pack",
    subtitle: "Multiple Questions Over Time",
    description: "Get five question credits at a discounted rate.",
    priceLkr: 3000,
    questionCredits: 5,
    responseWindowHours: 72,
    features: [
      "Five separate questions",
      "Use credits whenever you need them within 30 days",
      "Responses delivered through your client dashboard",
    ],
  },
];

export function getAskAlphaOfferById(offerId: string | null) {
  return ASK_ALPHA_OFFERS.find((offer) => offer.id === offerId) ?? null;
}

export function formatAskAlphaPrice(amount: number) {
  return `Rs. ${amount.toLocaleString("en-US")}`;
}

export function createAskAlphaReference() {
  return `ASK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
