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
    title: "1 Question Credit",
    subtitle: "One focused answer",
    description: "Best for one clear training, nutrition, or progress question.",
    priceLkr: 3500,
    questionCredits: 1,
    responseWindowHours: 72,
    features: [
      "One focused written response",
      "Training or nutrition clarification",
      "Reply inside your client dashboard",
      "No full programme design included",
    ],
  },
  {
    id: "three-question-pack",
    title: "3 Question Pack",
    subtitle: "Save on follow-up questions",
    description: "Useful when you have a few connected questions to ask over time.",
    priceLkr: 9000,
    questionCredits: 3,
    responseWindowHours: 72,
    features: [
      "Three separate question credits",
      "Use credits when you need them",
      "Reply inside your client dashboard",
      "Best value for ongoing clarifications",
    ],
  },
  {
    id: "video-form-review",
    title: "Video Form Review",
    subtitle: "Technique feedback",
    description: "Ask one question and include a lifting video link for form feedback.",
    priceLkr: 6500,
    questionCredits: 1,
    responseWindowHours: 72,
    isVideoReview: true,
    features: [
      "One exercise technique review",
      "Submit a video link with your question",
      "Actionable form feedback",
      "Not a full training plan",
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
