import type { AcademyLesson, AcademyTrack, TrackCategory } from "@/data/academyCourses";
import type { WorksheetContent, WorksheetPageContent } from "./types";

function suppliesForLesson(lesson: AcademyLesson, category: TrackCategory): string[] {
  const topicBlob = lesson.topics.join(" ").toLowerCase();

  if (category === "puppy") {
    if (topicBlob.includes("potty")) return ["Potty log or notebook", "Enzyme cleaner", "Leash for potty trips", "Treats", "Crate or pen if using one"];
    if (topicBlob.includes("crate")) return ["Crate or pen", "Comfortable bedding", "Frozen Kong or chew", "Treats", "Optional: camera"];
    if (topicBlob.includes("social")) return ["Treats", "Harness and leash", "Mat or towel", "Safe exposure list"];
    if (topicBlob.includes("bite") || topicBlob.includes("teeth")) return ["Chew toys", "Treats", "Baby gate or pen", "Timer for naps"];
    return ["Treats", "Leash and harness", "Safe confinement area", "Chews for calm moments"];
  }
  if (category === "obedience") {
    if (topicBlob.includes("leash") || topicBlob.includes("walk")) return ["Harness", "6-foot leash", "High-value treats", "Optional: long line"];
    if (topicBlob.includes("recall")) return ["Long line (15–30 ft)", "High-value treats", "Quiet open space"];
    if (topicBlob.includes("place") || topicBlob.includes("mat")) return ["Mat or bed", "Treats", "Leash for guest practice"];
    return ["Treats", "Leash", "Quiet training spot"];
  }
  if (category === "separation") return ["Phone or camera", "Treats or stuffed Kong", "Notebook", "Safe rest area"];
  if (category === "reactivity") return ["Front-clip harness", "6-foot leash + backup", "High-value treats", "Treat pouch"];
  if (category === "calm") return ["Mat or bed", "Treats", "Leash", "Notebook"];
  return ["High-value treats", "Quiet space", "Treat pouch"];
}

function practiceSteps(lesson: AcademyLesson, category: TrackCategory): string[] {
  if (lesson.exercise?.length) return lesson.exercise;

  const steps = lesson.topics.slice(0, 5).map((topic) => {
    if (category === "separation") return `Practice ${topic.toLowerCase()} for 30–90 seconds. End before stress appears.`;
    if (category === "reactivity") return `Work on ${topic.toLowerCase()} at a distance where your dog can still eat and think.`;
    return `Practice ${topic.toLowerCase()} for 2–3 minutes. Reward success and end while it's still easy.`;
  });

  if (steps.length >= 3) return steps;

  return [
    `Choose one focus from "${lesson.title}" to practice today.`,
    "Keep the session to 3–5 minutes.",
    "Reward calm success. End while your dog is still doing well.",
    "Write one note about what to adjust next time."
  ];
}

function mistakesForLesson(lesson: AcademyLesson, category: TrackCategory): string[] {
  const title = lesson.title.toLowerCase();
  const items: string[] = [];

  if (category === "separation") {
    items.push("Increasing absence time before your dog can stay calm.");
    items.push("Skipping video check-ins and guessing how your dog did.");
    items.push("Only training on days you must leave.");
  } else if (category === "reactivity") {
    items.push("Getting too close to triggers too quickly.");
    items.push("Tightening the leash when your dog notices something.");
    items.push("Practicing only on hard walks.");
  } else if (category === "puppy") {
    items.push("Waiting too long between potty trips.");
    items.push("Using the crate as punishment.");
    if (title.includes("bite")) items.push("Rough hand play when the puppy is overtired.");
  } else if (category === "obedience") {
    items.push("Repeating cues when the dog does not respond.");
    items.push("Expecting the same skill outdoors without proofing indoors first.");
  } else {
    items.push("Sessions that run too long and end in frustration.");
  }

  lesson.topics.slice(0, 2).forEach((t) => items.push(`Rushing ${t.toLowerCase()} before the basics are solid.`));
  return items.slice(0, 5);
}

function troubleshooting(lesson: AcademyLesson, category: TrackCategory) {
  const rows: { trigger: string; tryThis: string }[] = [];

  if (category === "separation") {
    rows.push(
      { trigger: "Panic within seconds", tryThis: "Shorten absences. Use management so panic is not repeated." },
      { trigger: "Will not eat when alone", tryThis: "Dog is over threshold. Reduce duration and simplify." },
      { trigger: "Progress stalls", tryThis: "Hold at the last calm level. Add a recovery day." }
    );
  } else if (category === "reactivity") {
    rows.push(
      { trigger: "Will not take treats outside", tryThis: "Increase distance from triggers." },
      { trigger: "Barking before you can mark", tryThis: "You are too close. Exit earlier next time." },
      { trigger: "Good at home, hard on walks", tryThis: "Rebuild distance criteria outside." }
    );
  } else if (category === "puppy") {
    rows.push(
      { trigger: "Wild biting", tryThis: "Offer a chew, shorten play, check if a nap is due." },
      { trigger: "Potty accidents", tryThis: "Increase potty trips and supervise more closely." },
      { trigger: "Crate fussing", tryThis: "Slow down duration. Meet potty and rest needs first." }
    );
  } else {
    rows.push(
      { trigger: "Dog loses focus", tryThis: "Shorten sessions and upgrade rewards." },
      { trigger: "Skill breaks with distractions", tryThis: "Go back one stage. Add distance slowly." }
    );
  }

  rows.push({
    trigger: `Still stuck on ${lesson.title.toLowerCase()}`,
    tryThis: "Lower difficulty and contact a Fitdog trainer if safety is a concern."
  });

  return rows;
}

function successChecklist(lesson: AcademyLesson, category: TrackCategory): string[] {
  const items = [
    `I can explain the main point of "${lesson.title}" clearly.`,
    "My dog stayed under threshold during most practice this week.",
    "I ended sessions while my dog could still succeed."
  ];

  if (category === "separation") {
    items.push("Video shows calm body language during short absences.");
    items.push("I increased duration only after three calm reps.");
  } else if (category === "reactivity") {
    items.push("My dog can notice triggers and take food at our working distance.");
  } else if (category === "obedience") {
    items.push("My dog responds at least 4 out of 5 times in an easy environment.");
  }

  lesson.topics.slice(0, 2).forEach((t) => items.push(`We practiced ${t.toLowerCase()} at least three times.`));
  return items.slice(0, 6);
}

function trackerHeaders(category: TrackCategory): string[] {
  if (category === "separation") return ["Date", "Time", "Duration", "Body language", "Reward/setup", "Next step"];
  if (category === "reactivity") return ["Date", "Location", "Trigger distance", "Response", "What helped", "Next step"];
  if (category === "puppy") return ["Date", "Duration", "Environment", "Response", "Notes", "Rating 1–5"];
  return ["Date", "Duration", "Environment", "Response", "Notes", "Next step"];
}

function headlineForLesson(lesson: AcademyLesson, category: TrackCategory): string {
  const map: Record<string, string> = {
    "alone-time-assessment": "Find today's starting point.",
    "building-alone-time-duration": "Practice small. Track everything.",
    "departure-cue-desensitization": "Make departures predictable and boring.",
    "management-before-training": "Protect progress before you push duration.",
    "separation-anxiety-vs-normal-adjustment": "A calm plan starts below threshold.",
    thresholds: "Distance first. Learning second.",
    "look-at-that": "Notice triggers. Reward calm choices.",
    "understanding-reactivity": "Map the pattern before you change it.",
    "potty-training-without-the-guesswork": "Routine beats guesswork.",
    "puppy-biting-and-teething": "Redirect, rest, repeat.",
    "loose-leash-walking": "Reward the position you want.",
    recall: "Make coming to you the best deal."
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
      { title: "Stay below threshold", body: "If your dog cannot eat, rest, or settle, the absence is too long.", accent: "orange" as const },
      { title: "Track on video", body: "Camera footage tells you whether to increase, hold, or decrease.", accent: "sky" as const },
      { title: "End calm", body: "Return before panic. Calm returns build trust.", accent: "green" as const }
    ];
  }
  if (category === "reactivity") {
    return [
      { title: "Distance is training", body: "Your dog learns when they can notice a trigger and still think.", accent: "orange" as const },
      { title: "Soft leash", body: "Create space early. Tension raises arousal.", accent: "sky" as const },
      { title: "Mark calm", body: "Reward looking, sniffing, and disengaging.", accent: "green" as const }
    ];
  }
  return [
    { title: "Short sessions", body: `Keep ${lesson.title.toLowerCase()} practice to a few minutes.`, accent: "orange" as const },
    { title: "Clear rewards", body: "Mark the moment your dog gets it right.", accent: "sky" as const },
    { title: "End on success", body: lesson.takeaway, accent: "green" as const }
  ];
}

function trainerNote(category: TrackCategory): string | undefined {
  const notes: Partial<Record<TrackCategory, string>> = {
    separation: "If your dog shows panic or cannot eat when alone, pause increases and contact a qualified professional.",
    reactivity: "Stay below threshold. Distance and safety come before performance.",
    puppy: "A calm three-minute session beats a frustrating twenty-minute one."
  };
  return notes[category];
}

function safetyNote(category: TrackCategory): string {
  if (category === "separation") {
    return "Do not use flooding or cry-it-out. If your dog shows panic or self-injury, contact a veterinarian or behavior professional.";
  }
  if (category === "reactivity") {
    return "Do not force greetings or punish reactivity. Safety, distance, and decompression support progress.";
  }
  return "Use humane, reward-based training. If your dog shows pain, fear, or aggression, consult a qualified trainer or vet.";
}

function separationExtras(lesson: AcademyLesson): WorksheetPageContent[] {
  if (lesson.id === "separation-anxiety-vs-normal-adjustment") {
    return [
      {
        sectionNumber: 2,
        sectionTitle: "Know what you are seeing",
        checklistItems: lesson.topics,
        checklistColumns: 2
      }
    ];
  }

  if (lesson.id === "alone-time-assessment") {
    return [
      {
        worksheetLabel: "WORKSHEET 02",
        headline: "Build the calm setup first.",
        intro: "Map your space before you test absences.",
        sectionNumber: 3,
        sectionTitle: "Your home setup map",
        gridCards: [
          { title: "Space", prompt: "Where will your dog settle?", accent: "sky" },
          { title: "Sound", prompt: "White noise, music, or quiet?", accent: "orange" },
          { title: "Enrichment", prompt: "Kong, chew, or snuffle mat?", accent: "sky" },
          { title: "Camera", prompt: "Where is your phone placed?", accent: "orange" }
        ]
      },
      {
        sectionNumber: 4,
        sectionTitle: "Baseline absence test",
        table: {
          headers: ["Absence", "Body language score", "Returned before stress?", "Notes"],
          rows: [
            ["5 sec", "Relaxed / Mild / Stressed", "Yes / No", ""],
            ["10 sec", "Relaxed / Mild / Stressed", "Yes / No", ""],
            ["20 sec", "Relaxed / Mild / Stressed", "Yes / No", ""],
            ["30 sec", "Relaxed / Mild / Stressed", "Yes / No", ""],
            ["45 sec", "Relaxed / Mild / Stressed", "Yes / No", ""]
          ]
        },
        bodyLanguageScale: [
          { score: 0, label: "Resting", color: "#2E9E5B" },
          { score: 1, label: "Looks up", color: "#2E9E5B" },
          { score: 2, label: "Pacing", color: "#FFB020" },
          { score: 3, label: "Whining", color: "#9CA3AF" },
          { score: 4, label: "Panic", color: "#F15A24" },
          { score: 5, label: "Distress", color: "#F4A6B8" }
        ]
      }
    ];
  }

  if (lesson.id === "building-alone-time-duration") {
    return [
      {
        worksheetLabel: "WORKSHEET 02",
        headline: "Practice small. Track everything.",
        callout: {
          title: "Practice rule",
          body: "Do 1–2 short sessions per day. End while your dog can still think, sniff, eat, or settle.",
          variant: "peach"
        },
        sectionNumber: 6,
        sectionTitle: "5-day micro plan",
        dayCards: [
          { day: "Day 1", title: "Baseline only", body: "Repeat the longest calm absence from your assessment.", accent: "sky" },
          { day: "Day 2", title: "Hold steady", body: "Same duration. Focus on calm returns.", accent: "orange" },
          { day: "Day 3", title: "Tiny increase", body: "Add 5–15 seconds only if Days 1–2 looked calm.", accent: "sky" },
          { day: "Day 4", title: "Recovery day", body: "Hold or shorten if stress appeared.", accent: "orange" },
          { day: "Day 5", title: "Review", body: "Watch video. Decide increase, hold, or decrease.", accent: "sky" }
        ]
      },
      {
        sectionNumber: 7,
        sectionTitle: "Decide the next rep",
        decisionOptions: [
          { label: "1", action: "Increase — 3 calm reps", accent: "green" },
          { label: "2", action: "Hold — mild stress", accent: "sky" },
          { label: "3", action: "Decrease — panic signs", accent: "orange" }
        ]
      },
      {
        sectionNumber: 8,
        sectionTitle: "Departure practice log",
        table: {
          headers: trackerHeaders("separation"),
          rows: Array.from({ length: 5 }, () => ["", "", "", "", "", ""])
        }
      },
      {
        sectionNumber: 9,
        sectionTitle: "Weekly reflection",
        reflectionPrompts: ["Biggest win:", "What made it easier:", "Trainer questions:"],
        safetyNote: safetyNote("separation")
      }
    ];
  }

  return [];
}

export function buildWorksheetContent(lesson: AcademyLesson, track: AcademyTrack): WorksheetContent {
  const category = track.category;

  const pages: WorksheetPageContent[] = [
    {
      worksheetLabel: "WORKSHEET 01",
      headline: headlineForLesson(lesson, category),
      intro: lesson.summary,
      trainerNote: trainerNote(category),
      startHereFields: ["Dog", "Date", "Owner", "Best reward"],
      ruleCards: ruleCardsForLesson(lesson, category)
    },
    {
      sectionNumber: 2,
      sectionTitle: "Lesson focus checklist",
      checklistItems: lesson.topics.length ? lesson.topics : ["Review the lesson video", "Gather supplies", "Pick a quiet practice time"],
      checklistColumns: 2,
      supplies: suppliesForLesson(lesson, category)
    },
    {
      sectionNumber: 3,
      sectionTitle: "Step-by-step practice plan",
      steps: practiceSteps(lesson, category)
    }
  ];

  const extras = separationExtras(lesson);
  if (extras.length) {
    pages.push(...extras);
  } else {
    pages.push({
      worksheetLabel: "WORKSHEET 02",
      sectionNumber: 4,
      sectionTitle: "Practice tracker",
      table: {
        headers: trackerHeaders(category),
        rows: Array.from({ length: 6 }, () => trackerHeaders(category).map(() => ""))
      }
    });
    pages.push({
      sectionNumber: 5,
      sectionTitle: "Common mistakes",
      mistakes: mistakesForLesson(lesson, category),
      troubleshooting: troubleshooting(lesson, category)
    });
    pages.push({
      sectionNumber: 6,
      sectionTitle: "Ready to progress?",
      successChecklist: successChecklist(lesson, category)
    });
  }

  if (!pages.some((p) => p.reflectionPrompts?.length)) {
    pages.push({
      worksheetLabel: "WORKSHEET 03",
      sectionNumber: 7,
      sectionTitle: "Homework",
      homework:
        lesson.homework ||
        `Practice one skill from "${lesson.title}" three times this week. Note what was easy and what needs to be simpler.`
    });
    pages.push({
      sectionNumber: 8,
      sectionTitle: "Owner reflection",
      reflectionPrompts: [
        "What went well this week?",
        "When did my dog struggle?",
        "What will I make easier next session?",
        "Questions for my trainer:"
      ],
      callout: { title: "Remember", body: lesson.takeaway, variant: "sky" },
      safetyNote: safetyNote(category)
    });
  }

  return {
    courseName: track.title,
    courseSlug: track.id,
    lessonTitle: lesson.title,
    lessonSlug: lesson.id,
    worksheetSubtitle: lesson.worksheetTitle,
    footerTitle: `${track.title} Worksheet`,
    trainingGoal: lesson.takeaway,
    pages
  };
}
