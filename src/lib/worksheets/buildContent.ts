import type { AcademyLesson, AcademyTrack, TrackCategory } from "@/data/academyCourses";
import type { WorksheetContent, WorksheetPageContent, WorksheetSection } from "./types";

const MAX_TRACKER_ROWS = 5;
const MAX_STEPS = 5;
const MAX_MISTAKES = 4;

function suppliesForLesson(lesson: AcademyLesson, category: TrackCategory): string[] {
  const topicBlob = lesson.topics.join(" ").toLowerCase();

  if (category === "puppy") {
    if (topicBlob.includes("potty")) return ["Potty log", "Enzyme cleaner", "Leash", "Treats", "Crate/pen"];
    if (topicBlob.includes("crate")) return ["Crate/pen", "Bedding", "Frozen Kong", "Treats", "Camera (optional)"];
    if (topicBlob.includes("social")) return ["Treat pouch", "Harness + leash", "Mat", "Exposure list"];
    if (topicBlob.includes("bite") || topicBlob.includes("teeth")) return ["Chew toys", "Treats", "Baby gate", "Timer"];
    return ["Treat pouch", "Leash/harness", "Confinement area", "Chews"];
  }
  if (category === "obedience") {
    if (topicBlob.includes("leash") || topicBlob.includes("walk")) return ["Harness", "6-ft leash", "High-value treats", "Long line (optional)"];
    if (topicBlob.includes("recall")) return ["Long line", "High-value treats", "Open space"];
    if (topicBlob.includes("place") || topicBlob.includes("mat")) return ["Mat/bed", "Treats", "Leash"];
    return ["Treat pouch", "Leash", "Quiet spot"];
  }
  if (category === "separation") return ["Phone/camera", "Stuffed Kong", "Notebook", "Safe rest area"];
  if (category === "reactivity") return ["Front-clip harness", "Leash + backup", "High-value treats", "Treat pouch"];
  if (category === "calm") return ["Mat/bed", "Treats", "Leash", "Notebook"];
  return ["High-value treats", "Quiet space", "Treat pouch"];
}

function practiceSteps(lesson: AcademyLesson, category: TrackCategory): string[] {
  if (lesson.exercise?.length) return lesson.exercise.slice(0, MAX_STEPS);

  const lessonPlans: Record<string, string[]> = {
    "how-dogs-learn": [
      "1. Pick one everyday behavior your dog already offers (sit, coming to the kitchen, etc.).",
      "2. Notice what happens immediately before that behavior — that is the cue.",
      "3. Mark with “yes” the instant the behavior happens. Deliver a treat within 2 seconds.",
      "4. Ask: what is my dog getting from this behavior? Write one sentence.",
      "5. End after 3–5 clean reps while your dog is still engaged."
    ],
    "marker-training": [
      "1. Say “yes” and immediately give a treat — repeat 10 times with no behavior required.",
      "2. Wait for your dog to look at you. Mark and treat the moment they do.",
      "3. Mark a natural sit. Reward placement: treat delivered to where you want the skill.",
      "4. Practice in a quiet room before adding any distraction.",
      "5. End while your dog is still excited to work with you."
    ],
    "name-recognition-and-focus": [
      "1. Say your dog’s name once in a quiet room. Mark eye contact. Treat.",
      "2. Increase difficulty: turn your body slightly away. Mark a glance toward you.",
      "3. Practice with mild distraction (toy on floor, person walking past).",
      "4. If your dog ignores the name, make it easier — do not repeat the cue.",
      "5. Log how many one-cue check-ins you got out of 5 tries."
    ],
    "recall": [
      "1. In a fenced or quiet area, say your recall cue once. Run backward if needed.",
      "2. Reward with high-value food — not their everyday kibble.",
      "3. Practice 5 recalls on a long line before trying off-leash.",
      "4. Never call your dog to end something fun without a trade.",
      "5. End on a successful recall while your dog is still running toward you."
    ],
    "loose-leash-walking": [
      "1. Mark and treat when the leash is loose and your dog is beside you.",
      "2. If the leash tightens, stop walking. Restart when the leash loosens.",
      "3. Change direction without yanking — invite your dog to follow.",
      "4. Use sniff breaks as rewards for loose-leash position.",
      "5. Keep sessions to 5 minutes on one block before expanding."
    ]
  };

  if (lessonPlans[lesson.id]) return lessonPlans[lesson.id];

  if (lesson.progression?.length) {
    return lesson.progression.slice(0, MAX_STEPS).map((step, i) => `${i + 1}. ${step}`);
  }

  const fromTopics = lesson.topics.slice(0, MAX_STEPS).map((topic, i) => `${i + 1}. Practice ${topic.toLowerCase()} in a quiet room for 2–3 minutes.`);

  if (fromTopics.length >= 3) return fromTopics;

  return [
    "1. Review the lesson video and choose one focus skill.",
    "2. Gather treats and set up a quiet training space.",
    "3. Run a 3–5 minute session. Mark calm success.",
    "4. End while your dog is still doing well.",
    "5. Log one note for your next session."
  ];
}

function mistakesForLesson(lesson: AcademyLesson, category: TrackCategory): string[] {
  const items: string[] = [];
  if (category === "separation") {
    items.push("Increasing absence before your dog can stay calm.", "Skipping video check-ins.", "Only training on days you must leave.");
  } else if (category === "reactivity") {
    items.push("Getting too close to triggers too fast.", "Tightening the leash at triggers.", "Practicing only on hard walks.");
  } else if (category === "puppy") {
    items.push("Waiting too long between potty trips.", "Using the crate as punishment.", "Rough play when overtired.");
  } else if (category === "obedience") {
    items.push("Repeating cues without response.", "Skipping indoor proofing before outdoors.");
  } else {
    items.push("Sessions that run too long.", "Only rewarding performance, not calm.");
  }
  return items.slice(0, MAX_MISTAKES);
}

function troubleshooting(lesson: AcademyLesson, category: TrackCategory) {
  const rows: { trigger: string; tryThis: string }[] = [];
  if (category === "separation") {
    rows.push(
      { trigger: "Panic within seconds", tryThis: "Shorten absences. Avoid repeating panic." },
      { trigger: "Will not eat alone", tryThis: "Over threshold — reduce duration." }
    );
  } else if (category === "reactivity") {
    rows.push(
      { trigger: "Won't take treats outside", tryThis: "Increase distance from triggers." },
      { trigger: "Barking before you mark", tryThis: "Exit earlier — you were too close." }
    );
  } else if (category === "puppy") {
    rows.push(
      { trigger: "Wild biting", tryThis: "Chew + nap check." },
      { trigger: "Potty accidents", tryThis: "More potty trips + supervision." }
    );
  } else {
    rows.push(
      { trigger: "Loses focus", tryThis: "Shorten sessions, upgrade rewards." },
      { trigger: "Breaks with distractions", tryThis: "Go back one stage." }
    );
  }
  rows.push({ trigger: "Still stuck", tryThis: "Lower difficulty. Contact Fitdog if safety is a concern." });
  return rows.slice(0, 3);
}

function successChecklist(lesson: AcademyLesson, category: TrackCategory): string[] {
  const items = [
    `I can explain "${lesson.title}" clearly.`,
    "My dog stayed under threshold most of the week.",
    "I ended sessions while my dog could still succeed."
  ];
  if (category === "separation") items.push("Video shows calm body language in short absences.");
  if (category === "reactivity") items.push("My dog notices triggers and eats at working distance.");
  if (category === "obedience") items.push("4/5 success rate in an easy environment.");
  return items.slice(0, 4);
}

function trackerHeaders(category: TrackCategory, lesson: AcademyLesson): string[] {
  if (lesson.id === "potty-training-without-the-guesswork") return ["Date", "Meals", "Potty trips", "Accidents", "Notes"];
  if (category === "separation") return ["Date", "Duration", "Body lang.", "Setup", "Next"];
  if (category === "reactivity") return ["Date", "Location", "Distance", "Response", "Next"];
  return ["Date", "Duration", "Environment", "Response", "Next"];
}

function trackerRows(category: TrackCategory, lesson: AcademyLesson): string[][] {
  const headers = trackerHeaders(category, lesson);
  const hints: Record<string, string[]> = {
    "potty-training-without-the-guesswork": ["Day 1", "Breakfast", "Every 45m", "0", ""],
    "building-alone-time-duration": ["", "___ sec", "0–5", "Kong", ""]
  };
  const hint = hints[lesson.id];
  return Array.from({ length: MAX_TRACKER_ROWS }, (_, i) => (i === 0 && hint ? hint : headers.map(() => "")));
}

function headlineForLesson(lesson: AcademyLesson, category: TrackCategory): string {
  const map: Record<string, string> = {
    "alone-time-assessment": "Find today's starting point.",
    "building-alone-time-duration": "Practice small. Track everything.",
    "potty-training-without-the-guesswork": "Routine beats guesswork.",
    "look-at-that": "Notice triggers. Reward calm choices.",
    thresholds: "Distance first. Learning second.",
    recall: "Make coming to you the best deal.",
    "bringing-your-puppy-home": "Calm start. Clear routine. Safe landing."
  };
  if (map[lesson.id]) return map[lesson.id];
  if (category === "separation") return "Work below threshold. Track what you see.";
  if (category === "reactivity") return "Create space. Build calm reps.";
  if (category === "puppy") return "Small steps. Calm wins.";
  return `Practice ${lesson.title.toLowerCase()} with clarity.`;
}

function ruleCardsForLesson(lesson: AcademyLesson, category: TrackCategory) {
  if (category === "separation") {
    return [
      { title: "Below threshold", body: "If your dog can't eat or settle, absence is too long.", accent: "orange" as const },
      { title: "Track on video", body: "Footage tells you to increase, hold, or decrease.", accent: "sky" as const },
      { title: "End calm", body: "Return before panic. Calm returns build trust.", accent: "green" as const }
    ];
  }
  if (category === "reactivity") {
    return [
      { title: "Distance first", body: "Your dog learns when they can notice and still think.", accent: "orange" as const },
      { title: "Soft leash", body: "Create space early. Tension raises arousal.", accent: "sky" as const },
      { title: "Mark calm", body: "Reward looking, sniffing, and disengaging.", accent: "green" as const }
    ];
  }
  return [
    { title: "Short sessions", body: "Keep practice to 3–5 minutes.", accent: "orange" as const },
    { title: "Clear rewards", body: "Mark the exact moment your dog gets it right.", accent: "sky" as const },
    { title: "End on success", body: lesson.takeaway.slice(0, 80) + (lesson.takeaway.length > 80 ? "…" : ""), accent: "green" as const }
  ];
}

function trainerNote(category: TrackCategory): string | undefined {
  const notes: Partial<Record<TrackCategory, string>> = {
    separation: "If your dog shows panic or cannot eat when alone, pause increases and contact a professional.",
    reactivity: "Stay below threshold. Distance and safety come before performance.",
    puppy: "A calm three-minute session beats a frustrating twenty-minute one."
  };
  return notes[category];
}

function safetyNote(category: TrackCategory): string {
  if (category === "separation") return "No flooding or cry-it-out. Contact a vet or behavior pro for panic or self-injury.";
  if (category === "reactivity") return "No forced greetings or punishment. Safety and distance support progress.";
  return "Use humane, reward-based training. Consult a trainer or vet for pain, fear, or aggression.";
}

function checklistFor(lesson: AcademyLesson): string[] {
  if (lesson.topics.length) return lesson.topics;
  if (lesson.progression?.length) return lesson.progression;
  return ["Review lesson video", "Gather supplies", "Pick practice time", "Set 3–5 min timer"];
}

function coverPage(lesson: AcademyLesson, track: AcademyTrack, category: TrackCategory): WorksheetPageContent {
  return {
    isCover: true,
    headline: headlineForLesson(lesson, category),
    intro: lesson.summary,
    trainerNote: trainerNote(category),
    startHereFields: ["Dog's name", "Date", "Owner", "Best reward"],
    ruleCards: ruleCardsForLesson(lesson, category),
    sections: [
      {
        sectionNumber: 1,
        sectionTitle: "Training goal",
        callout: { title: "Your goal this week", body: lesson.takeaway, variant: "peach" }
      },
      {
        sectionNumber: 2,
        sectionTitle: "Lesson focus checklist",
        checklistItems: checklistFor(lesson),
        checklistColumns: 2,
        supplies: suppliesForLesson(lesson, category)
      }
    ]
  };
}

function practicePage(lesson: AcademyLesson, category: TrackCategory): WorksheetPageContent {
  return {
    worksheetLabel: "PRACTICE · TRACK",
    sections: [
      {
        sectionNumber: 3,
        sectionTitle: "Step-by-step practice plan",
        steps: practiceSteps(lesson, category)
      },
      {
        sectionNumber: 4,
        sectionTitle: "Practice tracker",
        table: { headers: trackerHeaders(category, lesson), rows: trackerRows(category, lesson) }
      }
    ]
  };
}

function reviewPage(lesson: AcademyLesson, category: TrackCategory): WorksheetPageContent {
  return {
    worksheetLabel: "REVIEW · REFLECT",
    sections: [
      {
        sectionNumber: 5,
        sectionTitle: "Common mistakes to avoid",
        mistakes: mistakesForLesson(lesson, category)
      },
      {
        sectionTitle: "If this happens, try this",
        troubleshooting: troubleshooting(lesson, category)
      },
      {
        sectionNumber: 6,
        sectionTitle: "Ready to progress?",
        successChecklist: successChecklist(lesson, category),
        homework:
          lesson.homework ||
          `Practice one skill from "${lesson.title}" three times this week. Note what to simplify.`,
        reflectionPrompts: ["What went well?", "When did my dog struggle?", "Questions for my Fitdog trainer:"],
        safetyNote: safetyNote(category)
      }
    ]
  };
}

function separationAssessmentPages(lesson: AcademyLesson, track: AcademyTrack): WorksheetPageContent[] {
  return [
    coverPage(lesson, track, "separation"),
    {
      worksheetLabel: "ASSESSMENT · PRACTICE",
      sections: [
        {
          sectionNumber: 3,
          sectionTitle: "Step-by-step practice plan",
          steps: practiceSteps(lesson, "separation")
        },
        {
          sectionNumber: 4,
          sectionTitle: "Home setup map",
          gridCards: [
            { title: "Space", prompt: "Where will your dog settle?", accent: "sky" },
            { title: "Sound", prompt: "White noise or quiet?", accent: "orange" },
            { title: "Enrichment", prompt: "Kong, chew, or snuffle mat?", accent: "sky" },
            { title: "Camera", prompt: "Phone placement?", accent: "orange" }
          ]
        },
        {
          sectionNumber: 5,
          sectionTitle: "Baseline absence test",
          table: {
            headers: ["Absence", "Body lang. 0–5", "Before stress?", "Notes"],
            rows: [
              ["5 sec", "", "Y / N", ""],
              ["10 sec", "", "Y / N", ""],
              ["20 sec", "", "Y / N", ""],
              ["30 sec", "", "Y / N", ""],
              ["45 sec", "", "Y / N", ""]
            ]
          },
          bodyLanguageScale: [
            { score: 0, label: "Resting", color: "#2E9E5B" },
            { score: 2, label: "Pacing", color: "#FFB020" },
            { score: 4, label: "Panic", color: "#F15A24" }
          ]
        }
      ]
    },
    reviewOnlyPage(lesson, "separation")
  ];
}

function reviewOnlyPage(lesson: AcademyLesson, category: TrackCategory): WorksheetPageContent {
  return reviewPage(lesson, category);
}

function separationDurationPages(lesson: AcademyLesson, track: AcademyTrack): WorksheetPageContent[] {
  return [
    coverPage(lesson, track, "separation"),
    {
      worksheetLabel: "DAILY PLAN",
      sections: [
        {
          callout: {
            title: "Practice rule",
            body: "1–2 short sessions/day. End while your dog can think, sniff, eat, or settle.",
            variant: "peach"
          },
          sectionNumber: 3,
          sectionTitle: "5-day micro plan",
          dayCards: [
            { day: "D1", title: "Baseline", body: "Longest calm absence.", accent: "sky" },
            { day: "D2", title: "Hold", body: "Same duration.", accent: "orange" },
            { day: "D3", title: "+5–15s", body: "If D1–2 calm.", accent: "sky" },
            { day: "D4", title: "Recovery", body: "Hold or shorten.", accent: "orange" },
            { day: "D5", title: "Review", body: "Watch video.", accent: "sky" }
          ],
          decisionOptions: [
            { label: "UP", action: "Increase — 3 calm reps", accent: "green" },
            { label: "HOLD", action: "Hold — mild stress", accent: "sky" },
            { label: "DOWN", action: "Decrease — panic", accent: "orange" }
          ],
          table: { headers: trackerHeaders("separation", lesson), rows: trackerRows("separation", lesson) }
        }
      ]
    },
    reviewOnlyPage(lesson, "separation")
  ];
}

export function buildWorksheetContent(lesson: AcademyLesson, track: AcademyTrack): WorksheetContent {
  const category = track.category;

  let pages: WorksheetPageContent[];
  if (lesson.id === "alone-time-assessment") pages = separationAssessmentPages(lesson, track);
  else if (lesson.id === "building-alone-time-duration") pages = separationDurationPages(lesson, track);
  else pages = [coverPage(lesson, track, category), practicePage(lesson, category), reviewPage(lesson, category)];

  return {
    courseName: track.title,
    courseSlug: track.id,
    lessonTitle: lesson.title,
    lessonSlug: lesson.id,
    worksheetSubtitle: lesson.worksheetTitle,
    footerTitle: `${track.title} · ${lesson.worksheetTitle}`,
    trainingGoal: lesson.takeaway,
    pages
  };
}

export function worksheetPageCount(content: WorksheetContent): number {
  return content.pages.length;
}

export function worksheetSectionCount(content: WorksheetContent): number {
  return content.pages.reduce((sum, page) => sum + page.sections.length, 0);
}
