export type WorksheetRuleCard = { title: string; body: string; accent?: "orange" | "sky" | "green" };

export type WorksheetTable = {
  headers: string[];
  rows: string[][];
};

export type WorksheetDayCard = { day: string; title: string; body: string; accent?: "orange" | "sky" };

export type WorksheetDecisionOption = { label: string; action: string; accent: "green" | "sky" | "orange" };

export type WorksheetSection = {
  sectionNumber?: number;
  sectionTitle?: string;
  checklistItems?: string[];
  checklistColumns?: 1 | 2;
  steps?: string[];
  table?: WorksheetTable;
  dayCards?: WorksheetDayCard[];
  decisionOptions?: WorksheetDecisionOption[];
  gridCards?: { title: string; prompt: string; accent: "sky" | "orange" }[];
  bodyLanguageScale?: { score: number; label: string; color: string }[];
  supplies?: string[];
  mistakes?: string[];
  troubleshooting?: { trigger: string; tryThis: string }[];
  successChecklist?: string[];
  homework?: string;
  reflectionPrompts?: string[];
  callout?: { title: string; body: string; variant: "peach" | "sky" | "orange" };
  safetyNote?: string;
  splitColumns?: boolean;
};

export type WorksheetPageContent = {
  isCover?: boolean;
  worksheetLabel?: string;
  headline?: string;
  intro?: string;
  trainerNote?: string;
  startHereFields?: string[];
  ruleCards?: WorksheetRuleCard[];
  keySkills?: string[];
  sections: WorksheetSection[];
};

export type WorksheetContent = {
  courseName: string;
  courseSlug: string;
  lessonTitle: string;
  lessonSlug: string;
  worksheetSubtitle: string;
  footerTitle: string;
  trainingGoal: string;
  pages: WorksheetPageContent[];
};
