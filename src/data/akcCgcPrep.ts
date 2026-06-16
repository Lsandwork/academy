import type { AcademyLesson, AcademyTrack } from "./academyCourses";

export const CGC_TRACK_ID = "akc-cgc-prep";

export const akcCgcPrepTrack: AcademyTrack = {
  id: CGC_TRACK_ID,
  title: "AKC CGC Prep",
  subtitle: "Test-ready skills for the Canine Good Citizen.",
  category: "cgc",
  description:
    "Prepare for the AKC Canine Good Citizen evaluation with structured practice across all 10 official skill areas. Each module includes handler mechanics, real-world proofing, downloadable worksheets, and trainer homework so you and your dog show up confident on test day.",
  color: "#1B4332",
  icon: "★",
  lessonIds: [
    "cgc-accepting-a-friendly-stranger",
    "cgc-sitting-politely-for-petting",
    "cgc-appearance-and-grooming",
    "cgc-loose-leash-walking",
    "cgc-walking-through-a-crowd",
    "cgc-sit-down-stay",
    "cgc-coming-when-called",
    "cgc-reaction-to-another-dog",
    "cgc-reaction-to-distractions",
    "cgc-supervised-separation"
  ]
};

export const akcCgcPrepLessons: AcademyLesson[] = [
  {
    id: "cgc-accepting-a-friendly-stranger",
    trackId: CGC_TRACK_ID,
    title: "Accepting a Friendly Stranger",
    durationMinutes: 22,
    summary:
      "Your dog stays calm while a friendly stranger approaches, speaks to you, shakes your hand, and ignores pushy greetings. This skill sets the tone for the entire CGC evaluation.",
    topics: [
      "CGC test criteria for Item 1",
      "Handler positioning and leash length",
      "Four-on-the-floor greeting protocol",
      "Stranger approach drills at home",
      "Proofing with family and friends",
      "What evaluators mark as a fail"
    ],
    exercise: [
      "1. Place your dog in a sit-stay on your left with a loose leash.",
      "2. Have a helper approach from 20 feet, stop, and ask to pet your dog.",
      "3. Shake hands with the helper while your dog remains seated or standing calmly.",
      "4. If your dog jumps, reset distance and repeat with a calmer approach.",
      "5. End after three clean approaches with no jumping or lunging."
    ],
    takeaway: "A CGC dog greets the world with calm confidence — not excitement at the end of the leash.",
    worksheetTitle: "CGC Skill 1 · Friendly Stranger Prep Sheet",
    isFreePreview: false
  },
  {
    id: "cgc-sitting-politely-for-petting",
    trackId: CGC_TRACK_ID,
    title: "Sitting Politely for Petting",
    durationMinutes: 20,
    summary:
      "Your dog sits calmly while a stranger pets their head and body. No mouthing, jumping, or shyness that prevents the evaluator from completing the exam.",
    topics: [
      "CGC test criteria for Item 2",
      "Sit duration with gentle petting",
      "Body handling from a stranger",
      "Shy dog accommodations",
      "Treat placement during petting",
      "Building tolerance for touch"
    ],
    exercise: [
      "1. Cue a sit. Have a helper approach and pet your dog’s shoulder, then head.",
      "2. Mark calm stillness. Feed low at your dog’s chest between pets.",
      "3. Increase petting duration from 2 seconds to 10 seconds over sessions.",
      "4. Practice with different people, scents, and clothing.",
      "5. Log whether your dog held sit without mouthing or jumping away."
    ],
    takeaway: "Polite petting is a stay behavior with social pressure — build it slowly and reward stillness.",
    worksheetTitle: "CGC Skill 2 · Polite Petting Practice Log",
    isFreePreview: false
  },
  {
    id: "cgc-appearance-and-grooming",
    trackId: CGC_TRACK_ID,
    title: "Appearance and Grooming Handling",
    durationMinutes: 24,
    summary:
      "Your dog accepts light grooming and handling from the evaluator — ears, front feet, and a brief brush — without fear, mouthing, or escape attempts.",
    topics: [
      "CGC test criteria for Item 3",
      "Cooperative care foundations",
      "Brush, ear, and paw touch",
      "Standing still for examination",
      "Grooming prep at home",
      "When to pause and rebuild comfort"
    ],
    exercise: [
      "1. Practice chin rest on your hand while you touch ears for 2 seconds.",
      "2. Introduce a soft brush — one stroke, treat, release.",
      "3. Have a helper examine front paws while you feed steadily.",
      "4. Stand your dog on a non-slip mat for mock exam handling.",
      "5. End before your dog pulls away or shakes off."
    ],
    takeaway: "Grooming comfort on test day starts with tiny, rewarded touches at home.",
    worksheetTitle: "CGC Skill 3 · Grooming & Handling Checklist",
    isFreePreview: false
  },
  {
    id: "cgc-loose-leash-walking",
    trackId: CGC_TRACK_ID,
    title: "Loose Leash Walking",
    durationMinutes: 26,
    summary:
      "Walk a short course with your dog on your left, showing a mostly loose leash without pulling, lagging, or forging ahead — the foundation for Items 4 and 5.",
    topics: [
      "CGC test criteria for Item 4",
      "Left-side position",
      "Loose leash mechanics",
      "Turns, stops, and pace changes",
      "Reward placement at your left hip",
      "Proofing on sidewalks and paths"
    ],
    exercise: [
      "1. Mark and treat when the leash hangs in a gentle U at your left side.",
      "2. Walk 30 feet. Stop when the leash tightens. Restart when loose.",
      "3. Practice right and left turns without yanking.",
      "4. Add one mild distraction — a person sitting on a bench.",
      "5. Log percentage of loose-leash steps during a 3-minute walk."
    ],
    takeaway: "CGC walking is controlled partnership — not heel perfection, but no sustained pulling.",
    worksheetTitle: "CGC Skill 4 · Loose Leash Tracker",
    isFreePreview: false
  },
  {
    id: "cgc-walking-through-a-crowd",
    trackId: CGC_TRACK_ID,
    title: "Walking Through a Crowd",
    durationMinutes: 25,
    summary:
      "Move through a small group of people without jumping, lunging, shyness, or loss of control. Your dog stays with you and keeps the leash manageable.",
    topics: [
      "CGC test criteria for Item 5",
      "Crowd simulation drills",
      "Handler path planning",
      "Distance from bodies and strollers",
      "Recovery after close passes",
      "Urban proofing strategies"
    ],
    exercise: [
      "1. Walk past one stationary person at 6 feet — reward check-ins.",
      "2. Add a second person. Walk an arc between them, not through tight gaps.",
      "3. Practice at a quiet shopping area or farmers market off-peak.",
      "4. If your dog surges forward, create space and reset.",
      "5. End while your dog can still eat and walk loosely."
    ],
    takeaway: "Crowds are about management and momentum — plan your path before you enter the group.",
    worksheetTitle: "CGC Skill 5 · Crowd Walk Planning Sheet",
    isFreePreview: false
  },
  {
    id: "cgc-sit-down-stay",
    trackId: CGC_TRACK_ID,
    title: "Sit, Down, and Stay",
    durationMinutes: 28,
    summary:
      "Demonstrate sit and down on cue, then a stay while you walk 20 feet away. Your dog holds position until the evaluator releases them.",
    topics: [
      "CGC test criteria for Item 6",
      "Sit and down on first cue",
      "20-foot stay with return",
      "Release cue clarity",
      "Duration and distance splits",
      "Common stay failures on test day"
    ],
    exercise: [
      "1. Practice sit and down in a new location — one cue each.",
      "2. Build stay: 5 seconds at 5 feet, then 10 seconds at 10 feet.",
      "3. Walk 20 feet away. Pause. Return to your dog’s side before releasing.",
      "4. Add mild distraction — person walking past at 15 feet.",
      "5. Log longest successful stay at 20 feet this week."
    ],
    takeaway: "A CGC stay is built in layers — duration, distance, then distraction — never all three at once on day one.",
    worksheetTitle: "CGC Skill 6 · Stay Builder Tracker",
    isFreePreview: false
  },
  {
    id: "cgc-coming-when-called",
    trackId: CGC_TRACK_ID,
    title: "Coming When Called",
    durationMinutes: 24,
    summary:
      "From 10 feet away on a 20-foot line, your dog comes promptly when called, sits in front or at your side, and accepts leash control without running off.",
    topics: [
      "CGC test criteria for Item 7",
      "Recall on long line",
      "Front sit or side finish",
      "High-value recall rewards",
      "No call when distracted beyond threshold",
      "Emergency recall vs. CGC recall"
    ],
    exercise: [
      "1. With a 20-foot line, walk 10 feet from your dog. Call once.",
      "2. Run backward if needed. Reward generously at your body.",
      "3. Practice recall before adding sit in front.",
      "4. Repeat in a fenced area with mild distractions.",
      "5. Never call to end fun without a trade — protect your recall cue."
    ],
    takeaway: "On test day, your recall cue should mean: come now, it’s absolutely worth it.",
    worksheetTitle: "CGC Skill 7 · Recall Readiness Log",
    isFreePreview: false
  },
  {
    id: "cgc-reaction-to-another-dog",
    trackId: CGC_TRACK_ID,
    title: "Reaction to Another Dog",
    durationMinutes: 27,
    summary:
      "Pass within a few feet of another dog without overly excited, shy, or aggressive behavior. Your dog shows polite interest or neutral calm.",
    topics: [
      "CGC test criteria for Item 8",
      "Parallel walking passes",
      "Threshold distance with other dogs",
      "Calm marker and treat scatter",
      "Shy vs. excited dog plans",
      "When to seek professional support"
    ],
    exercise: [
      "1. With a helper dog at 30 feet, walk parallel for 20 feet.",
      "2. Mark calm glances and loose body. Feed at your hip.",
      "3. Gradually decrease distance over multiple sessions — never in one day.",
      "4. If barking or lunging starts, increase distance immediately.",
      "5. Log closest successful pass distance this week."
    ],
    takeaway: "Polite dog-dog behavior is trained at a distance your dog can think — not at the end of a tight leash.",
    worksheetTitle: "CGC Skill 8 · Dog-Dog Pass Practice Sheet",
    isFreePreview: false
  },
  {
    id: "cgc-reaction-to-distractions",
    trackId: CGC_TRACK_ID,
    title: "Reaction to Distractions",
    durationMinutes: 23,
    summary:
      "Show confidence around common distractions — dropped items, joggers, carts, or noise — without panic, sustained pulling, or attempts to chase.",
    topics: [
      "CGC test criteria for Item 9",
      "Distraction hierarchy list",
      "Look-and-reward pattern",
      "Dropped item protocol",
      "Sound and movement proofing",
      "Recovery after startle"
    ],
    exercise: [
      "1. List five distractions your dog notices. Rank easiest to hardest.",
      "2. Practice with the easiest — dropped treat bag at 10 feet.",
      "3. Mark look-at-that. Feed when your dog reorients to you.",
      "4. Add one new distraction per week, not per session.",
      "5. End sessions while your dog can still take food."
    ],
    takeaway: "Distraction training teaches your dog: notice it, then check in with me — there’s a reward for that.",
    worksheetTitle: "CGC Skill 9 · Distraction Proofing Planner",
    isFreePreview: false
  },
  {
    id: "cgc-supervised-separation",
    trackId: CGC_TRACK_ID,
    title: "Supervised Separation",
    durationMinutes: 21,
    summary:
      "Leave your dog with the evaluator for up to 3 minutes while you stay out of sight. Your dog remains calm without excessive whining, barking, or escape behavior.",
    topics: [
      "CGC test criteria for Item 10",
      "Gradual out-of-sight stays",
      "Calm handoff to a trusted person",
      "Pre-test separation routine",
      "Managing mild stress signals",
      "When separation needs extra support"
    ],
    exercise: [
      "1. Have a helper hold the leash while you step behind a door for 10 seconds.",
      "2. Return calmly. Reward your dog for settled behavior.",
      "3. Build to 30 seconds, then 1 minute, then 3 minutes over weeks.",
      "4. Practice in new locations with familiar helpers first.",
      "5. Video your longest calm separation this week."
    ],
    takeaway: "Three calm minutes apart is a skill — train it in seconds before you expect minutes on test day.",
    worksheetTitle: "CGC Skill 10 · Separation Readiness Log",
    isFreePreview: false
  }
];

export const cgcLessonIds = akcCgcPrepLessons.map((lesson) => lesson.id);
