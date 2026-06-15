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
  if (category === "reactivity") {
    if (lesson.id === "understanding-reactivity") return ["Notebook", "Phone/camera (optional)", "Treat pouch", "Leash + harness"];
    if (lesson.id === "safety-and-walk-management") return ["Front-clip harness", "Backup leash clip", "Treat pouch", "Muzzle (if recommended)"];
    if (lesson.id === "emergency-walk-skills") return ["Treat pouch", "6-ft leash", "High-value treats", "Quiet practice spot"];
    return ["Front-clip harness", "Leash + backup", "High-value treats", "Treat pouch"];
  }
  if (category === "calm") {
    if (lesson.id === "barking-basics") return ["Notebook", "Treat pouch", "Phone/camera (optional)", "Baby gate or visual blocker"];
    if (lesson.id === "grooming-and-handling-prep" || lesson.id === "vet-visit-confidence") {
      return ["High-value treats", "Brush or handling tool", "Non-slip mat", "Timer"];
    }
    if (lesson.id === "polite-greetings") return ["Leash", "Treat pouch", "Mat/bed", "Baby gate (optional)"];
    return ["Mat/bed", "Treat pouch", "Quiet room", "Enrichment chew or Kong"];
  }
  if (category === "enrichment") {
    if (lesson.id === "enrichment-101") return ["Food puzzle or Kong", "Treats/kibble", "Cardboard box", "Snuffle mat or towel"];
    if (lesson.id === "fitness-and-body-awareness") return ["Non-slip mat", "Low platform or book", "Treats", "Timer"];
    if (lesson.id === "better-walks-through-sniffing") return ["Harness + leash", "Treat pouch", "Long line (optional)", "Notebook"];
    return ["Treat pouch", "Enrichment toys", "Mat", "Timer"];
  }
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
    ],
    "building-an-off-switch": [
      "1. Sit quietly near your dog. When they lie down or sigh, mark and treat calmly.",
      "2. Place a mat in a low-traffic spot. Reward any voluntary contact with the mat.",
      "3. Practice 2-minute settle sessions after a short walk or play.",
      "4. Turn off extra stimulation (TV, rough play) for 10 minutes before settle practice.",
      "5. Log one moment today when your dog chose rest without being asked."
    ],
    "polite-greetings": [
      "1. With your dog on leash, practice four paws on the floor before any petting.",
      "2. Have a helper approach slowly. Mark calm feet. Treat before they jump.",
      "3. If jumping starts, step back and wait for calm before re-approaching.",
      "4. Practice at the door with a gate or leash barrier.",
      "5. End the session while greetings are still manageable."
    ],
    "barking-basics": [
      "1. Log three barking episodes today: what happened right before the bark?",
      "2. Label the type: alert, demand, fear, boredom, or frustration.",
      "3. For one episode, change the environment (distance, sound blocker, enrichment).",
      "4. Reward quiet for 2 seconds — not during barking.",
      "5. Note one pattern you see after reviewing your log."
    ],
    "grooming-and-handling-prep": [
      "1. Touch one body part for 2 seconds (paw, ear, or shoulder). Treat. Release.",
      "2. Introduce the brush: one gentle stroke, treat, stop before your dog pulls away.",
      "3. Practice chin rest on your hand for 3 seconds.",
      "4. Pair collar or harness handling with a treat at the same moment.",
      "5. End while your dog is still comfortable — not when they escape."
    ],
    "vet-visit-confidence": [
      "1. Practice getting on a low stable surface (mat or step). Mark and treat.",
      "2. Run a mock exam: touch ears, lift lip, feel belly — 2 seconds each, treat after.",
      "3. Pair car entry with a high-value treat at the door.",
      "4. Practice mat settle for 30 seconds in a new room.",
      "5. Write one handling skill to practice before the next vet visit."
    ],
    "understanding-reactivity": [
      "1. Log one reactive moment today: what was the trigger and how far away was it?",
      "2. Label the type: fear, frustration, excitement, or barrier frustration.",
      "3. Note body language 5 seconds before the reaction (stiff, stare, pull, freeze).",
      "4. Write one thing your dog was trying to achieve (space, access, relief).",
      "5. Choose one management change for your next walk."
    ],
    "safety-and-walk-management": [
      "1. Check harness fit — two fingers under straps, no rubbing at armpits.",
      "2. Attach a backup clip from harness to collar before every walk.",
      "3. Walk your route and mark three safe exit points (corners, cars, driveways).",
      "4. Identify one quieter alternate route for high-trigger days.",
      "5. Practice turning away from a trigger before you are within 30 feet."
    ],
    thresholds: [
      "1. At a safe distance, offer a treat. Can your dog eat? That is under threshold.",
      "2. Move 10 feet closer. Check again: eat, check in, or loose body?",
      "3. Find today's working distance — the closest point where your dog can still eat.",
      "4. Practice one skill at working distance for 2 minutes only.",
      "5. Log where your dog went over threshold and how far you moved back."
    ],
    "emergency-walk-skills": [
      "1. In a quiet area, practice a U-turn: say “let's go,” turn, and treat for following.",
      "2. Practice treat scatter: toss treats on the ground and say “find it.”",
      "3. Practice magnet hand: treat at your thigh, dog at your side for 5 steps.",
      "4. Walk toward a pretend trigger, then exit early using your U-turn.",
      "5. Log which skill felt easiest and which needs more reps."
    ],
    "better-leash-handling": [
      "1. Walk one block focusing on a soft, J-shaped leash — mark loose leash.",
      "2. When you see a trigger, create an arc — do not walk head-on.",
      "3. Breathe out slowly before passing a trigger. Notice your grip.",
      "4. Reward placement: treat at your side, not toward the trigger.",
      "5. End the walk before leash tension becomes constant."
    ],
    "rebuilding-real-world-confidence": [
      "1. Pick the easiest stage from your progression list for this week.",
      "2. Set up one controlled rep at working distance. Mark calm behavior.",
      "3. If your dog succeeds 4/5 times, note whether to hold or advance one step.",
      "4. If your dog fails twice, move back one stage — non-linear is normal.",
      "5. Write one real-world win from this week, however small."
    ],
    "enrichment-101": [
      "1. Pick one food-based enrichment: scatter feed, puzzle, or stuffed Kong.",
      "2. Set it up in a quiet spot. Let your dog work for 5–10 minutes without interruption.",
      "3. Add one sniff game: hide treats in a towel or cardboard box.",
      "4. Log which activity kept your dog engaged longest.",
      "5. Schedule one enrichment session before a usual chaos time (before guests, before leaving)."
    ],
    "fitness-and-body-awareness": [
      "1. Warm up with 30 seconds of slow walking or gentle movement indoors.",
      "2. Practice one balance skill: front paws on a low book or platform for 3 seconds.",
      "3. Guide your dog over a non-slip surface they are unsure about — treat for brave steps.",
      "4. Cool down with calm sniffing or a chew for 2 minutes.",
      "5. Note any hesitation or discomfort — stop and consult your vet if pain is suspected."
    ],
    "better-walks-through-sniffing": [
      "1. Plan one decompression walk: loose leash, no strict heel, sniffing allowed.",
      "2. Mark and treat when your dog chooses to sniff — that is the reward.",
      "3. Use a sniff break after a structured training rep on your next walk.",
      "4. Compare: one structured walk vs. one sniff-focused walk. Log your dog's energy after.",
      "5. Write one route change that gives your dog more sniff opportunities."
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
    if (lesson.id === "understanding-reactivity") items.push("Assuming all barking is aggression or dominance.");
    if (lesson.id === "emergency-walk-skills") items.push("Trying new skills for the first time during a meltdown.");
    if (lesson.id === "rebuilding-real-world-confidence") items.push("Advancing stages after one lucky success.");
  } else if (category === "puppy") {
    items.push("Waiting too long between potty trips.", "Using the crate as punishment.", "Rough play when overtired.");
  } else if (category === "obedience") {
    items.push("Repeating cues without response.", "Skipping indoor proofing before outdoors.");
  } else if (category === "calm") {
    items.push("Only training when the dog is already wild.", "Forgetting to reward calm, settled behavior.");
    if (lesson.id === "barking-basics") items.push("Yelling over barking — adds arousal.", "Punishing without identifying the function.");
    if (lesson.id === "polite-greetings") items.push("Allowing jumping because guests say they do not mind.");
    if (lesson.id === "grooming-and-handling-prep" || lesson.id === "vet-visit-confidence") {
      items.push("Forcing handling when the dog pulls away.", "Waiting until appointment day to start practice.");
    }
  } else if (category === "enrichment") {
    items.push("Using enrichment only when the dog is already destructive.", "Puzzles that are too hard — frustration, not fulfillment.");
    if (lesson.id === "fitness-and-body-awareness") items.push("Pushing balance exercises when your dog shows fear or pain.");
    if (lesson.id === "better-walks-through-sniffing") items.push("Every walk is a strict heel — no sniff time at all.");
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
    if (lesson.id === "better-leash-handling") {
      rows.push({ trigger: "Leash always tight", tryThis: "Stop when leash tightens. Reward loose leash before moving again." });
    }
  } else if (category === "puppy") {
    rows.push(
      { trigger: "Wild biting", tryThis: "Chew + nap check." },
      { trigger: "Potty accidents", tryThis: "More potty trips + supervision." }
    );
  } else if (category === "calm") {
    rows.push(
      { trigger: "Dog will not settle", tryThis: "Meet exercise needs first, then reward smaller calm moments." },
      { trigger: "Behavior gets worse with guests", tryThis: "Increase distance and use a gate or leash barrier." }
    );
    if (lesson.id === "barking-basics") {
      rows.push({ trigger: "Barking increases when ignored", tryThis: "Check if it is demand barking — reward quiet instead." });
    }
  } else if (category === "enrichment") {
    rows.push(
      { trigger: "Dog loses interest fast", tryThis: "Make the puzzle easier or use higher-value food." },
      { trigger: "Still restless after enrichment", tryThis: "Add sniffing or decompression — tired ≠ fulfilled." }
    );
    if (lesson.id === "fitness-and-body-awareness") {
      rows.push({ trigger: "Refuses balance work", tryThis: "Lower the surface. Reward one paw on, not full pose." });
    }
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
  const items =
    category === "enrichment"
      ? [
          `I can explain "${lesson.title}" clearly.`,
          "I added at least one new enrichment activity this week.",
          "I ended sessions while my dog was still engaged."
        ]
      : [
          `I can explain "${lesson.title}" clearly.`,
          "My dog stayed under threshold most of the week.",
          "I ended sessions while my dog could still succeed."
        ];
  if (category === "separation") items.push("Video shows calm body language in short absences.");
  if (category === "reactivity") items.push("My dog notices triggers and eats at working distance.");
  if (category === "obedience") items.push("4/5 success rate in an easy environment.");
  if (category === "calm") items.push("I rewarded at least three calm moments this week.");
  if (category === "enrichment") items.push("My dog had daily outlets for sniffing, chewing, or problem-solving.");
  return items.slice(0, 4);
}

function trackerHeaders(category: TrackCategory, lesson: AcademyLesson): string[] {
  if (lesson.id === "potty-training-without-the-guesswork") return ["Date", "Meals", "Potty trips", "Accidents", "Notes"];
  if (lesson.id === "barking-basics") return ["Date", "Trigger", "Bark type", "Duration", "What helped"];
  if (lesson.id === "building-an-off-switch") return ["Date", "Calm moment", "Location", "What I did", "Result"];
  if (lesson.id === "polite-greetings") return ["Date", "Guest/setup", "Dog response", "What worked", "Next step"];
  if (lesson.id === "grooming-and-handling-prep") return ["Date", "Body part", "Duration", "Response 1–5", "Notes"];
  if (lesson.id === "vet-visit-confidence") return ["Date", "Skill practiced", "Duration", "Response 1–5", "Notes"];
  if (lesson.id === "understanding-reactivity") return ["Date", "Trigger", "Distance", "Body language", "Notes"];
  if (lesson.id === "safety-and-walk-management") return ["Date", "Route", "Safety gear", "Incident", "Plan change"];
  if (lesson.id === "thresholds") return ["Date", "Trigger", "Distance", "Can eat?", "Next step"];
  if (lesson.id === "look-at-that") return ["Date", "Trigger", "Distance", "Calm looks", "Notes"];
  if (lesson.id === "emergency-walk-skills") return ["Date", "Skill", "Setup", "Success", "Notes"];
  if (lesson.id === "better-leash-handling") return ["Date", "Location", "Leash tension", "Handler note", "Next"];
  if (lesson.id === "rebuilding-real-world-confidence") return ["Date", "Stage", "Environment", "Response", "Next"];
  if (lesson.id === "enrichment-101") return ["Date", "Activity", "Duration", "Engagement 1–5", "Notes"];
  if (lesson.id === "fitness-and-body-awareness") return ["Date", "Exercise", "Duration", "Confidence 1–5", "Notes"];
  if (lesson.id === "better-walks-through-sniffing") return ["Date", "Walk type", "Duration", "Sniff time", "Notes"];
  if (category === "separation") return ["Date", "Duration", "Body lang.", "Setup", "Next"];
  if (category === "reactivity") return ["Date", "Location", "Distance", "Response", "Next"];
  return ["Date", "Duration", "Environment", "Response", "Next"];
}

function trackerRows(category: TrackCategory, lesson: AcademyLesson): string[][] {
  const headers = trackerHeaders(category, lesson);
  const hints: Record<string, string[]> = {
    "potty-training-without-the-guesswork": ["Day 1", "Breakfast", "Every 45m", "0", ""],
    "building-alone-time-duration": ["", "___ sec", "0–5", "Kong", ""],
    "building-an-off-switch": ["Day 1", "Lay on mat", "Living room", "Marked + treated", ""],
    "polite-greetings": ["Day 1", "Friend at door", "4 paws / jump", "Treat before petting", ""],
    "barking-basics": ["Day 1", "Doorbell", "Alert", "30 sec", "Distance + treat quiet"],
    "grooming-and-handling-prep": ["Day 1", "Paw touch", "2 sec", "4", ""],
    "vet-visit-confidence": ["Day 1", "Mock exam touch", "2 min", "4", ""],
    "understanding-reactivity": ["Day 1", "Dog across street", "40 ft", "Stiff stare", "Fear?"],
    "safety-and-walk-management": ["Day 1", "Neighborhood loop", "Harness + backup", "None", "Marked exits"],
    thresholds: ["Day 1", "Other dog", "50 ft", "Yes", "Hold distance"],
    "look-at-that": ["Day 1", "Person walking", "60 ft", "3 looks", "End early"],
    "emergency-walk-skills": ["Day 1", "U-turn", "Quiet block", "4/5", ""],
    "better-leash-handling": ["Day 1", "Main st.", "Loose 70%", "Arc past dog", "Reward at hip"],
    "rebuilding-real-world-confidence": ["Day 1", "Trigger far away", "Quiet park", "Calm", "Repeat"],
    "enrichment-101": ["Day 1", "Scatter feed", "8 min", "5", "Used breakfast kibble"],
    "fitness-and-body-awareness": ["Day 1", "Paws on book", "3 sec", "4", ""],
    "better-walks-through-sniffing": ["Day 1", "Decompression", "20 min", "Most of walk", "Calmer after"]
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
    "bringing-your-puppy-home": "Calm start. Clear routine. Safe landing.",
    "building-an-off-switch": "Notice calm. Reward rest.",
    "polite-greetings": "Calm feet earn the hello.",
    "barking-basics": "Name the reason before you change the behavior.",
    "grooming-and-handling-prep": "Small touches build big trust.",
    "vet-visit-confidence": "Practice at home. Confidence at the vet.",
    "understanding-reactivity": "Name the pattern before you change it.",
    "safety-and-walk-management": "Safety is part of training.",
    "emergency-walk-skills": "Rehearse exits when nothing is happening.",
    "better-leash-handling": "Soft leash. Early distance.",
    "rebuilding-real-world-confidence": "Stack small wins. Build real confidence.",
    "enrichment-101": "Fulfillment beats exhaustion.",
    "fitness-and-body-awareness": "Build body confidence safely.",
    "better-walks-through-sniffing": "Let sniffing be the point."
  };
  if (map[lesson.id]) return map[lesson.id];
  if (category === "separation") return "Work below threshold. Track what you see.";
  if (category === "reactivity") return "Create space. Build calm reps.";
  if (category === "puppy") return "Small steps. Calm wins.";
  if (category === "calm") return "Calm is a skill worth training.";
  if (category === "enrichment") return "Enrich daily. Track what works.";
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
  if (category === "calm") {
    return [
      { title: "Reward rest", body: "Calm behavior should pay as well as tricks and obedience.", accent: "orange" as const },
      { title: "Set up success", body: "Lower excitement before asking for settle or handling.", accent: "sky" as const },
      { title: "End on calm", body: lesson.takeaway.slice(0, 90) + (lesson.takeaway.length > 90 ? "…" : ""), accent: "green" as const }
    ];
  }
  if (category === "enrichment") {
    return [
      { title: "Daily outlets", body: "Sniffing, chewing, and problem-solving are needs — not extras.", accent: "orange" as const },
      { title: "Match difficulty", body: "Enrichment should engage, not frustrate.", accent: "sky" as const },
      { title: "Track engagement", body: lesson.takeaway.slice(0, 90) + (lesson.takeaway.length > 90 ? "…" : ""), accent: "green" as const }
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
    puppy: "A calm three-minute session beats a frustrating twenty-minute one.",
    calm: "If your dog cannot settle, make the setup easier before adding duration.",
    enrichment: "If your dog finishes puzzles instantly, increase difficulty slowly — or add sniffing."
  };
  return notes[category];
}

function safetyNote(category: TrackCategory, lesson: AcademyLesson): string {
  if (category === "separation") return "No flooding or cry-it-out. Contact a vet or behavior pro for panic or self-injury.";
  if (category === "reactivity") return "No forced greetings or punishment. Safety and distance support progress.";
  if (category === "enrichment" && lesson.id === "fitness-and-body-awareness") {
    return "Stop if your dog shows pain, limping, or fear. Consult your vet before fitness work.";
  }
  if (category === "enrichment") return "Supervise new enrichment setups. Remove items your dog could swallow or destroy unsafely.";
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
        safetyNote: safetyNote(category, lesson)
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
