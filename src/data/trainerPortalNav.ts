export type TrainerPortalSectionId = "dashboard" | "course-management" | "student-support";

export type TrainerPortalItem = {
  slug: string;
  label: string;
  description: string;
  bullets: string[];
};

export type TrainerPortalSection = {
  id: TrainerPortalSectionId;
  label: string;
  description: string;
  items: TrainerPortalItem[];
};

export const trainerPortalSections: TrainerPortalSection[] = [
  {
    id: "dashboard",
    label: "Trainer Dashboard",
    description: "Your daily command center for sessions, progress, and assigned dogs.",
    items: [
      {
        slug: "todays-online-sessions",
        label: "Today's Online Sessions",
        description: "View and manage your scheduled online training sessions for today.",
        bullets: [
          "Upcoming video sessions with start time and owner name",
          "Join link and session status (scheduled, in progress, completed)",
          "Quick prep notes and assigned lesson focus",
          "Mark session complete and log follow-up homework"
        ]
      },
      {
        slug: "student-progress",
        label: "Student Progress",
        description: "Track lesson completion and training milestones for assigned owners and dogs.",
        bullets: [
          "Completion percentage by course track",
          "Last opened lesson and recent activity",
          "Completed lessons and favorites",
          "Progress trends to guide your next session"
        ]
      },
      {
        slug: "submitted-videos",
        label: "Submitted Videos",
        description: "Review owner-submitted practice clips and provide feedback.",
        bullets: [
          "Video submissions queue with date and lesson context",
          "Playback with timestamp notes",
          "Approve, request revision, or add coaching comments",
          "Link feedback to homework and next lesson"
        ]
      },
      {
        slug: "trainer-notes",
        label: "Trainer Notes",
        description: "Your private notes across assigned dogs and sessions.",
        bullets: [
          "Session summaries and behavior observations",
          "Homework assigned and owner follow-through",
          "Search notes by dog, owner, or date",
          "Notes visible only to Fitdog trainers and admins"
        ]
      },
      {
        slug: "assigned-dogs",
        label: "Assigned Dogs",
        description: "Active client assignments approved by admin.",
        bullets: [
          "Dog name, breed, age, and owner contact",
          "Assessment summary and training goals",
          "Contract status and conversation link",
          "Quick access to message owner"
        ]
      },
      {
        slug: "course-feedback",
        label: "Course Feedback",
        description: "Feedback from owners about academy lessons and coaching.",
        bullets: [
          "Lesson ratings and owner comments",
          "Common questions by course track",
          "Flag content that needs trainer clarification",
          "Share insights with the Fitdog curriculum team"
        ]
      },
      {
        slug: "lesson-plan-library",
        label: "Lesson Plan Library",
        description: "Browse full curriculum, lesson plans, and pricing previews.",
        bullets: [
          "All Fitdog Academy tracks and lessons",
          "Lesson plan previews and recommended plans",
          "Worksheets and homework for each module",
          "Link owners to the right next course"
        ]
      },
      {
        slug: "cgc-evaluation-requests",
        label: "CGC Evaluation Requests",
        description: "Owners preparing for AKC Canine Good Citizen evaluation.",
        bullets: [
          "CGC Prep enrollments and skill module progress",
          "Evaluation scheduling requests",
          "Readiness checklist by CGC skill item",
          "Coordinate with Ivonne or assigned CGC evaluator"
        ]
      }
    ]
  },
  {
    id: "course-management",
    label: "Course Management",
    description: "Create, edit, and publish academy content.",
    items: [
      {
        slug: "add-lesson",
        label: "Add Lesson",
        description: "Add a new lesson to an existing course track.",
        bullets: [
          "Select track and enter lesson title and summary",
          "Add topics, homework, and takeaway",
          "Set duration and worksheet title",
          "Submit for admin review before publishing"
        ]
      },
      {
        slug: "edit-course",
        label: "Edit Course",
        description: "Update course track details and lesson order.",
        bullets: [
          "Edit track title, subtitle, and description",
          "Reorder lessons within a track",
          "Update lesson metadata and preview flags",
          "Save drafts for admin approval"
        ]
      },
      {
        slug: "upload-video",
        label: "Upload Video",
        description: "Attach or update lesson video URLs.",
        bullets: [
          "Link hosted MP4 or preview embed URL",
          "Set thumbnail for library cards",
          "Verify mobile playback",
          "Mark video ready for publish"
        ]
      },
      {
        slug: "add-worksheet",
        label: "Add Worksheet",
        description: "Manage downloadable PDF worksheets for lessons.",
        bullets: [
          "Generate or upload Fitdog-branded worksheet PDF",
          "Verify worksheet download in lesson view",
          "Match worksheet title to lesson content",
          "Flag worksheet for curriculum QA"
        ]
      },
      {
        slug: "publish-unpublish-lesson",
        label: "Publish / Unpublish Lesson",
        description: "Control lesson visibility for students.",
        bullets: [
          "Publish lessons when content and video are ready",
          "Unpublish for edits without deleting progress",
          "Set free preview vs. paid access",
          "Preview access rules before going live"
        ]
      },
      {
        slug: "preview-as-student",
        label: "Preview as Student",
        description: "See exactly what owners see in the library.",
        bullets: [
          "Open library as a student would",
          "Test locked vs. unlocked lesson flow",
          "Download worksheet as student",
          "Verify pricing and plan gates"
        ]
      }
    ]
  },
  {
    id: "student-support",
    label: "Student Support",
    description: "Support assigned owners between sessions.",
    items: [
      {
        slug: "message-owner",
        label: "Message Owner",
        description: "Send messages to assigned owners.",
        bullets: [
          "Open conversation from assigned dog card",
          "Send session recap and homework reminders",
          "Attach lesson links and worksheet downloads",
          "View message history per client"
        ]
      },
      {
        slug: "review-homework",
        label: "Review Homework",
        description: "Review completed worksheets and practice logs.",
        bullets: [
          "Homework submission queue by dog",
          "Worksheet completion status",
          "Comment on practice log entries",
          "Assign follow-up drills for next session"
        ]
      },
      {
        slug: "add-trainer-notes",
        label: "Add Trainer Notes",
        description: "Add coaching notes to a specific owner or dog file.",
        bullets: [
          "Timestamped notes after each session",
          "Behavior concerns and wins",
          "Homework compliance tracking",
          "Share notes with admin if escalation needed"
        ]
      },
      {
        slug: "recommend-next-course",
        label: "Recommend Next Course",
        description: "Guide owners to the next best Fitdog track.",
        bullets: [
          "Assessment-based track recommendations",
          "Link to lesson plan preview pages",
          "Suggest single lesson vs. membership",
          "Log recommendation in owner file"
        ]
      },
      {
        slug: "flag-behavior-concern",
        label: "Flag Behavior Concern",
        description: "Escalate safety or behavior concerns to Fitdog admin.",
        bullets: [
          "Describe concern with date and context",
          "Severity level and immediate safety notes",
          "Notify admin team for follow-up",
          "Refer to veterinary or behavior specialist when appropriate"
        ]
      }
    ]
  }
];

export function getTrainerPortalSection(sectionId: string) {
  return trainerPortalSections.find((s) => s.id === sectionId);
}

export function getTrainerPortalItem(sectionId: string, itemSlug: string) {
  const section = getTrainerPortalSection(sectionId);
  return section?.items.find((i) => i.slug === itemSlug);
}

export function trainerPortalHref(basePath: string, sectionId: TrainerPortalSectionId, itemSlug?: string) {
  if (!itemSlug) return `${basePath}/${sectionId}`;
  return `${basePath}/${sectionId}/${itemSlug}`;
}
