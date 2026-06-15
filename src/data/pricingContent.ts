export type CheckoutPlanId =
  | "single_lesson"
  | "monthly"
  | "premium"
  | "lifetime"
  | "cgc_prep"
  | "cgc_prep_eval";

export type PricingCardPlan = {
  id: CheckoutPlanId | "addon_session";
  name: string;
  price: string;
  frequency: string;
  subtitle: string;
  badge: string | null;
  featured: boolean;
  cta: string;
  note?: string;
  microcopy?: string;
  features: string[];
  /** Route when checkout is not applicable (e.g. single lesson → library) */
  href?: string;
};

export type CoursePreview = {
  slug: string;
  title: string;
  description: string;
  whoItsFor: string;
  whatYouLearn: string[];
  modules: string[];
  recommendedPlan: string;
  recommendedPlanId: CheckoutPlanId;
  trackId?: string;
  cta: string;
};

export const pricingHeadline = "Choose the Training Support That Fits Your Dog";
export const pricingSubheadline =
  "Start with one lesson, unlock the full academy, or get monthly trainer coaching for real progress at home.";

export const trainerSessionMicrocopy =
  "Trainer sessions are scheduled online and must be used during the active billing month.";

export const addonSessionNote = "Add a 45-minute online trainer session anytime for $95.";

export const mainPricingPlans: PricingCardPlan[] = [
  {
    id: "single_lesson",
    name: "Single Lesson",
    price: "$79",
    frequency: "",
    subtitle: "Choose one training lesson for one focused goal.",
    badge: null,
    featured: false,
    cta: "View Lessons",
    href: "/library",
    features: [
      "Lifetime access to selected lesson",
      "Downloadable worksheet",
      "Trainer homework plan",
      "Step-by-step practice guide",
      "Great for puppies, leash manners, recall, calm home skills, or one specific issue"
    ]
  },
  {
    id: "monthly",
    name: "Monthly Coaching Membership",
    price: "$149",
    frequency: "/month",
    subtitle: "Full academy access plus monthly trainer support.",
    badge: "Most Popular",
    featured: true,
    cta: "Start Membership",
    note: "Best value for owners who want real trainer guidance, not just videos.",
    microcopy:
      "Includes one 45-minute online trainer session every month. Sessions do not roll over.",
    features: [
      "Unlimited access to all current lessons",
      "One 45-minute online trainer session every month",
      "Monthly homework plan",
      "Worksheets and trainer notes included",
      "New lessons added monthly",
      "Cancel anytime",
      "Session must be used during the active billing month and does not roll over"
    ]
  },
  {
    id: "premium",
    name: "Premium Coaching Membership",
    price: "$249",
    frequency: "/month",
    subtitle: "For owners who want more hands-on support.",
    badge: "Best for Real Progress",
    featured: false,
    cta: "Upgrade to Premium",
    microcopy: trainerSessionMicrocopy,
    features: [
      "Unlimited academy access",
      "Two 45-minute online trainer sessions per month",
      "Custom weekly training plan",
      "Trainer video review of owner practice clips",
      "Priority support",
      "Best for puppies, reactivity basics, separation support, and leash manners"
    ]
  },
  {
    id: "lifetime",
    name: "Lifetime Academy Access",
    price: "$599",
    frequency: "one-time",
    subtitle: "One payment. Learn at your own pace.",
    badge: null,
    featured: false,
    cta: "Get Lifetime Access",
    note: addonSessionNote,
    features: [
      "Lifetime access to all current lessons",
      "Future course updates included",
      "Worksheets and trainer notes",
      "No monthly payment",
      "Optional trainer sessions available separately"
    ]
  }
];

export const specialtyPrograms: PricingCardPlan[] = [
  {
    id: "cgc_prep",
    name: "AKC CGC Prep Program",
    price: "$249",
    frequency: "",
    subtitle: "Prepare for the AKC Canine Good Citizen skills test.",
    badge: null,
    featured: false,
    cta: "Start CGC Prep",
    features: [
      "Online CGC prep course",
      "Covers all 10 CGC skills",
      "One 45-minute online readiness session",
      "Handler practice checklist",
      "Test-day preparation guide",
      "Official testing/evaluation may require an approved evaluator and may have separate AKC fees"
    ]
  },
  {
    id: "cgc_prep_eval",
    name: "AKC CGC Prep + Evaluation",
    price: "$399",
    frequency: "",
    subtitle: "Prep online, then complete evaluation with an approved setup.",
    badge: null,
    featured: false,
    cta: "Book Prep + Evaluation",
    features: [
      "Full CGC prep course",
      "One 45-minute online readiness session",
      "Evaluation appointment coordination",
      "AKC paperwork guidance",
      "Certificate/title fees may be separate"
    ]
  }
];

export const trustBadges = [
  "Built with professional trainer guidance",
  "Worksheets included",
  "Designed for real-life practice",
  "Online support available"
];

export const coursePreviewIntro =
  "Every lesson includes clear training steps, owner-friendly homework, downloadable worksheets, and progress checkpoints so you know exactly what to practice between sessions.";

export const coursePreviews: CoursePreview[] = [
  {
    slug: "puppy-jumpstart",
    title: "Puppy Jumpstart",
    description:
      "Build the foundation for confidence, manners, potty routines, crate comfort, handling, and early socialization.",
    whoItsFor: "New puppy parents who want a calm, structured start before problem habits take hold.",
    whatYouLearn: [
      "Daily routines that support potty success",
      "How to build crate comfort without panic",
      "Early manners and safe social exposure",
      "Foundation skills for recall and leash walking"
    ],
    modules: [
      "Potty schedule and routine building",
      "Crate comfort without panic",
      "Name recognition and recall foundations",
      "Puppy biting and jumping",
      "Safe socialization checklist",
      "Beginner leash skills"
    ],
    recommendedPlan: "Monthly Coaching Membership",
    recommendedPlanId: "monthly",
    trackId: "puppy-foundations",
    cta: "View Puppy Lesson Plan"
  },
  {
    slug: "everyday-obedience",
    title: "Everyday Obedience",
    description: "Practical manners for real life at home, on walks, and around distractions.",
    whoItsFor: "Owners who want reliable everyday skills—not just tricks in the living room.",
    whatYouLearn: [
      "Clear cue communication with your dog",
      "Loose leash and recall foundations",
      "Calm behavior around doors, guests, and distractions",
      "How to practice in short, realistic sessions"
    ],
    modules: [
      "Sit, down, stay, and release cues",
      "Loose leash walking",
      "Recall practice",
      "Door manners",
      "Place/mat training",
      "Polite greetings"
    ],
    recommendedPlan: "Single Lesson or Monthly Coaching Membership",
    recommendedPlanId: "monthly",
    trackId: "everyday-obedience",
    cta: "View Obedience Lesson Plan"
  },
  {
    slug: "calm-home-skills",
    title: "Calm Home Skills",
    description: "Help your dog settle, decompress, and make better choices inside the home.",
    whoItsFor: "Families dealing with jumping, barking, overstimulation, or a dog who struggles to relax.",
    whatYouLearn: [
      "How to teach an off-switch at home",
      "Place and relaxation routines",
      "Impulse control without frustration",
      "Predictable structure that reduces chaos"
    ],
    modules: [
      "Relaxation routines",
      "Place training",
      "Impulse control games",
      "Calm greetings",
      "Reducing attention barking",
      "Building predictable home structure"
    ],
    recommendedPlan: "Monthly Coaching Membership",
    recommendedPlanId: "monthly",
    trackId: "calm-home-skills",
    cta: "View Calm Skills Plan"
  },
  {
    slug: "separation-support",
    title: "Separation Support",
    description: "A structured, gentle plan for dogs who struggle being alone.",
    whoItsFor: "Owners whose dogs show distress, panic, or difficulty settling when left alone.",
    whatYouLearn: [
      "How to assess alone-time tolerance safely",
      "Management strategies that protect progress",
      "Gradual absence plans below panic threshold",
      "When to seek veterinary or specialist support"
    ],
    modules: [
      "Alone-time baseline",
      "Departure cue awareness",
      "Confidence-building exercises",
      "Safe enrichment setup",
      "Gradual absence plan",
      "Progress tracking worksheet"
    ],
    recommendedPlan: "Premium Coaching Membership",
    recommendedPlanId: "premium",
    trackId: "separation-support",
    cta: "View Separation Plan"
  },
  {
    slug: "leash-manners",
    title: "Leash Manners",
    description: "Teach better walking skills without relying on force or frustration.",
    whoItsFor: "Owners tired of pulling, zig-zagging, or losing focus on walks.",
    whatYouLearn: [
      "Loose leash mechanics that dogs understand",
      "Engagement games for real-world distractions",
      "Walk structure that sets both of you up to succeed",
      "Handler timing and reward placement"
    ],
    modules: [
      "Loose leash foundation",
      "Redirection around distractions",
      "Engagement games",
      "Passing dogs and people",
      "Walk structure",
      "Handler timing"
    ],
    recommendedPlan: "Monthly Coaching Membership",
    recommendedPlanId: "monthly",
    trackId: "everyday-obedience",
    cta: "View Leash Lesson Plan"
  },
  {
    slug: "dog-reactivity-foundations",
    title: "Dog Reactivity Foundations",
    description: "Owner-friendly support for dogs who bark, lunge, freeze, or overreact on leash.",
    whoItsFor: "Owners of reactive dogs who need safer walks and a clearer training path.",
    whatYouLearn: [
      "What reactivity is—and what it is not",
      "Threshold management and distance skills",
      "Pattern games that build confidence around triggers",
      "Emergency walk tools for real life"
    ],
    modules: [
      "Understanding thresholds",
      "Distance and management",
      "Pattern games",
      "Engagement around triggers",
      "Recovery after reactions",
      "Safer walk planning"
    ],
    recommendedPlan: "Premium Coaching Membership",
    recommendedPlanId: "premium",
    trackId: "leash-reactivity-reset",
    cta: "View Reactivity Plan"
  },
  {
    slug: "akc-cgc-prep",
    title: "AKC CGC Prep",
    description: "Prepare for the AKC Canine Good Citizen skills with guided practice and readiness support.",
    whoItsFor: "Handlers preparing for CGC skills who want structured practice and trainer readiness support.",
    whatYouLearn: [
      "All 10 CGC skill areas with step-by-step practice",
      "Handler mechanics for test-day readiness",
      "How to build reliability around people, dogs, and distractions",
      "What to expect for official evaluation logistics"
    ],
    modules: [
      "Accepting a friendly stranger",
      "Sitting politely for petting",
      "Appearance and grooming handling",
      "Loose leash walking",
      "Walking through a crowd",
      "Sit, down, stay",
      "Coming when called",
      "Reaction to another dog",
      "Reaction to distractions",
      "Supervised separation"
    ],
    recommendedPlan: "AKC CGC Prep Program",
    recommendedPlanId: "cgc_prep",
    cta: "View CGC Prep Plan"
  }
];

export function getCoursePreview(slug: string) {
  return coursePreviews.find((c) => c.slug === slug);
}

export function getCheckoutPlan(id: string) {
  return [...mainPricingPlans, ...specialtyPrograms].find((p) => p.id === id);
}

/** Stripe-backed checkout plans for diagnostics and legacy imports */
export const stripeCheckoutPlans = [...mainPricingPlans, ...specialtyPrograms].filter(
  (p): p is PricingCardPlan & { id: CheckoutPlanId } => p.id !== "addon_session"
);
