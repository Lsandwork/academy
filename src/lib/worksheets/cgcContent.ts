import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import type { WorksheetPageContent } from "./types";

export const CGC_SKILL_META: Record<
  string,
  {
    item: string;
    criteria: string;
    handlerTips: string[];
    commonFails: string[];
    testDayChecklist: string[];
  }
> = {
  "cgc-accepting-a-friendly-stranger": {
    item: "CGC Item 1",
    criteria:
      "Dog allows a friendly stranger to approach and speak to the handler in a natural, everyday situation. Handler shakes hands and has a brief conversation. Dog shows no shyness or resentment; no jumping on the stranger.",
    handlerTips: [
      "Keep leash loose — tension invites pulling and jumping.",
      "Stand still. Do not step toward the stranger if your dog surges.",
      "Reward four-on-the-floor before the stranger arrives.",
      "If your dog jumps, ask the helper to pause until calm."
    ],
    commonFails: ["Jumping on stranger", "Hiding behind handler", "Barking or lunging", "Handler correcting harshly on leash"],
    testDayChecklist: ["Dog pottied before ring", "Treat pouch ready", "Sit-stay practiced pre-test", "Stranger approach rehearsed this week"]
  },
  "cgc-sitting-politely-for-petting": {
    item: "CGC Item 2",
    criteria:
      "Dog sits politely for petting. Stranger pets head and body. Dog must show no shyness or resentment; no jumping or mouthing.",
    handlerTips: [
      "Cue sit before the stranger reaches.",
      "Feed low and slow while petting happens.",
      "Keep sessions short — 5–10 seconds of petting first.",
      "Shy dogs: let them sniff the stranger's hand first."
    ],
    commonFails: ["Breaking sit to jump", "Mouthing the stranger's hand", "Moving away from touch", "Handler pulling dog into sit"],
    testDayChecklist: ["Sit held 10+ sec with petting at home", "Three different helpers practiced", "Mouthy dogs fed between pets"]
  },
  "cgc-appearance-and-grooming": {
    item: "CGC Item 3",
    criteria:
      "Dog welcomes being groomed and examined by evaluator. Evaluator lightly combs or brushes, examines ears, and picks up front foot. Owner supplies brush/comb.",
    handlerTips: [
      "Bring a brush your dog already accepts.",
      "Chin rest on your hand during handling.",
      "One body part at a time — ears, then paws.",
      "Stop before your dog shakes off or pulls away."
    ],
    commonFails: ["Pulling foot away", "Mouthiness during exam", "Refusing brush", "Owner forcing handling"],
    testDayChecklist: ["Brush in bag", "Ear + paw touches at home this week", "Dog exercised before test"]
  },
  "cgc-loose-leash-walking": {
    item: "CGC Item 4",
    criteria:
      "Handler and dog walk a course. Dog need not be on exact heel but must show no sustained pulling. Dog should be on handler's left with leash mostly loose.",
    handlerTips: [
      "Reward at your left hip when leash is loose.",
      "Stop when the leash tightens — movement is the reward.",
      "Short strides keep your dog beside you.",
      "Practice left-side position daily."
    ],
    commonFails: ["Sustained pulling", "Dog forging far ahead", "Handler yanking leash", "Dog lagging behind consistently"],
    testDayChecklist: ["Harness + 6-ft leash", "Loose leash on sidewalk yesterday", "Left-side position practiced"]
  },
  "cgc-walking-through-a-crowd": {
    item: "CGC Item 5",
    criteria:
      "Dog and handler walk through a small crowd. Dog may show interest but must stay under control without jumping, lunging, or shyness that stops the walk.",
    handlerTips: [
      "Plan a path with space — don't walk through the tightest gap.",
      "Reward check-ins before entering the crowd.",
      "Keep momentum; stopping invites jumping.",
      "Increase crowd density slowly in practice."
    ],
    commonFails: ["Jumping on people", "Refusing to move (shyness)", "Straining at people/dogs", "Handler dragging dog"],
    testDayChecklist: ["Crowd walk at farmers market or plaza", "Arc paths practiced", "Dog under threshold entering group"]
  },
  "cgc-sit-down-stay": {
    item: "CGC Item 6",
    criteria:
      "Dog sits and downs on command. Handler asks dog to stay, walks 20 feet away, and returns. Evaluator may use distraction. Dog must stay until released.",
    handlerTips: [
      "One clear cue for sit and down — no repeating.",
      "Return to your dog before releasing.",
      "Build 20-foot distance over multiple sessions.",
      "If your dog breaks, shorten distance — don't repeat stay cue."
    ],
    commonFails: ["Breaking stay before release", "Needing multiple cues", "Handler releasing from distance", "Dog creeping forward"],
    testDayChecklist: ["20-ft stay at home", "Sit/down first cue in new location", "Release word practiced"]
  },
  "cgc-coming-when-called": {
    item: "CGC Item 7",
    criteria:
      "Handler walks 10 feet from dog and calls dog. Dog comes promptly on one call. Handler may use 20-foot line. Dog may sit in front or at side.",
    handlerTips: [
      "Use your best rewards — not everyday kibble.",
      "Call once. If no response, shorten distance.",
      "Practice on 20-foot line before test day.",
      "Never call to end something fun without a trade."
    ],
    commonFails: ["Ignoring first call", "Slow recall", "Running past handler", "Handler repeating cue loudly"],
    testDayChecklist: ["10-ft recall on long line", "High-value reward ready", "Recall practiced in test-like environment"]
  },
  "cgc-reaction-to-another-dog": {
    item: "CGC Item 8",
    criteria:
      "Two handlers and dogs approach, stop, shake hands, and continue. Dogs must show no more than casual interest — no over-excitement, shyness, or aggression.",
    handlerTips: [
      "Parallel walk passes before face-to-face setups.",
      "Feed at your hip when the other dog appears.",
      "Increase closeness over weeks, not one session.",
      "If either dog is over threshold, increase distance."
    ],
    commonFails: ["Barking/lunging", "Pulling hard toward other dog", "Hiding or refusing to approach", "Over-excited jumping"],
    testDayChecklist: ["Parallel pass at working distance", "Calm handshake setup with helper", "Treat scatter plan if needed"]
  },
  "cgc-reaction-to-distractions": {
    item: "CGC Item 9",
    criteria:
      "Dog shows confidence at a public place with moderate distractions — people, noise, movement. No panic, sustained pulling, or attempts to leave.",
    handlerTips: [
      "Rank distractions easy → hard. Train one level at a time.",
      "Mark look-at-that, feed when dog reorients.",
      "Dropped items: reward leave-it before the item lands.",
      "End while your dog can still eat."
    ],
    commonFails: ["Chasing dropped items", "Bolting from noise", "Sustained pulling at joggers", "Shutdown/refusal to move"],
    testDayChecklist: ["Distraction list ranked", "Look-at-that practiced", "Public outing this week"]
  },
  "cgc-supervised-separation": {
    item: "CGC Item 10",
    criteria:
      "Owner leaves dog with evaluator for up to 3 minutes, out of sight. Dog must remain calm without excessive whining, barking, or escape behavior.",
    handlerTips: [
      "Build out-of-sight time in seconds, then minutes.",
      "Calm handoff — no long emotional goodbye.",
      "Practice with trusted helpers before test day.",
      "Video sessions to track stress signals."
    ],
    commonFails: ["Excessive whining/barking", "Pulling toward exit", "Panicking when owner leaves", "Owner lingering — increases anxiety"],
    testDayChecklist: ["90-sec+ calm separation on video", "Handoff to helper practiced", "Calm exit routine rehearsed"]
  }
};

export function cgcWorksheetPages(lesson: AcademyLesson, track: AcademyTrack): WorksheetPageContent[] {
  const meta = CGC_SKILL_META[lesson.id];
  if (!meta) {
    return [];
  }

  return [
    {
      isCover: true,
      headline: `Master ${meta.item.toLowerCase()}.`,
      intro: lesson.summary,
      trainerNote:
        "CGC prep is about reliable real-life manners — not perfection under pressure. Practice below threshold, log your reps, and build test-day confidence one skill at a time.",
      startHereFields: ["Dog's name", "Target test date", "Handler name", "Best reward"],
      ruleCards: [
        { title: "Know the criteria", body: meta.criteria.slice(0, 120) + "…", accent: "orange" as const },
        { title: "Handler mechanics", body: meta.handlerTips[0], accent: "sky" as const },
        { title: "End on success", body: "Stop while your dog can still think, eat, and cooperate.", accent: "green" as const }
      ],
      sections: [
        {
          sectionNumber: 1,
          sectionTitle: "Official skill criteria",
          callout: { title: meta.item, body: meta.criteria, variant: "peach" }
        },
        {
          sectionNumber: 2,
          sectionTitle: "Handler checklist",
          checklistItems: meta.handlerTips,
          checklistColumns: 1,
          supplies: ["6-ft leash", "Front-clip harness", "High-value treats", "Treat pouch", "Brush (Item 3)", "20-ft long line (Item 7)", "Helper for social skills"]
        }
      ]
    },
    {
      worksheetLabel: "CGC PRACTICE · FITDOG",
      sections: [
        {
          sectionNumber: 3,
          sectionTitle: "Step-by-step practice plan",
          steps: lesson.exercise?.length ? lesson.exercise : meta.handlerTips.map((t, i) => `${i + 1}. ${t}`)
        },
        {
          sectionNumber: 4,
          sectionTitle: "Common reasons dogs fail this item",
          checklistItems: meta.commonFails,
          checklistColumns: 2
        },
        {
          sectionNumber: 5,
          sectionTitle: "Weekly practice log",
          table: {
            headers: ["Date", "Setup", "Duration", "Success 1–5", "Notes / next step"],
            rows: [
              ["Day 1", "Easy environment", "5 min", "", ""],
              ["Day 2", "Add one distraction", "5 min", "", ""],
              ["Day 3", "Hold difficulty", "5 min", "", ""],
              ["Day 4", "New location", "5 min", "", ""],
              ["Day 5", "Review + film", "5 min", "", ""]
            ]
          },
          bodyLanguageScale: [
            { score: 1, label: "Over threshold", color: "#EF4444" },
            { score: 3, label: "Working", color: "#FFB020" },
            { score: 5, label: "Test ready", color: "#2E9E5B" }
          ]
        }
      ]
    },
    {
      worksheetLabel: "TEST DAY · READINESS",
      sections: [
        {
          callout: {
            title: "Fitdog trainer homework",
            body: lesson.homework || lesson.takeaway,
            variant: "sky"
          },
          sectionNumber: 6,
          sectionTitle: "Test-day readiness checklist",
          checklistItems: meta.testDayChecklist,
          checklistColumns: 2
        },
        {
          sectionNumber: 7,
          sectionTitle: "Self-score before scheduling your evaluation",
          table: {
            headers: ["Question", "Yes", "Not yet"],
            rows: [
              ["Dog succeeds 4/5 reps in practice this week", "", ""],
              ["Handler can explain criteria without reading notes", "", ""],
              ["Dog can eat treats in practice environment", "", ""],
              ["No safety concerns (bite risk, panic, escape)", "", ""],
              ["Ready to schedule official CGC evaluation", "", ""]
            ]
          },
          decisionOptions: [
            { label: "READY", action: "Schedule evaluation — stack wins look solid", accent: "green" },
            { label: "HOLD", action: "Another 2 weeks of practice at this skill", accent: "sky" },
            { label: "HELP", action: "Contact Fitdog for trainer support", accent: "orange" }
          ]
        },
        {
          sectionNumber: 8,
          sectionTitle: "Notes for your trainer or evaluator",
          table: {
            headers: ["Observation", "Details"],
            rows: [
              ["Strongest rep this week", ""],
              ["Hardest moment", ""],
              ["Equipment that helped", ""],
              ["Question for test day", ""]
            ]
          }
        }
      ]
    }
  ];
}
