const base = "/assets/fitdog-academy";

export const fitdogAcademyAssets = {
  logos: {
    dogHead: `${base}/logos/fitdog-dog-head-orange-transparent.png`,
    dogHead64: `${base}/logos/fitdog-dog-head-orange-64.png`,
    wordmarkCharcoal: `${base}/logos/fitdog-wordmark-charcoal-transparent.png`,
    wordmarkWhite: `${base}/logos/fitdog-wordmark-white-transparent.png`,
    academyLockupDark: `${base}/logos/fitdog-academy-lockup-dark.png`,
    academyLockupLight: `${base}/logos/fitdog-academy-lockup-light-transparent.png`
  },
  hero: {
    landingHero: `${base}/hero/hero-dog-owner-glow.png`
  },
  courses: {
    puppyFoundations: `${base}/courses/puppy-foundations.png`,
    everydayObedience: `${base}/courses/everyday-obedience.png`,
    calmHomeSkills: `${base}/courses/calm-home-skills.png`,
    separationSupport: `${base}/courses/separation-support.png`,
    leashReactivityReset: `${base}/courses/leash-reactivity-reset.png`,
    enrichmentAtHome: `${base}/courses/enrichment-at-home.png`
  },
  /** Real photography for featured track cards (not AI-generated pack art) */
  coursePhotos: {
    puppyFoundations: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80",
    everydayObedience: "https://images.unsplash.com/photo-1551779891-b83901e1f8b3?w=800&auto=format&fit=crop&q=80",
    calmHomeSkills: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80",
    separationSupport: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&auto=format&fit=crop&q=80",
    leashReactivityReset: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
    enrichmentAtHome: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80",
    akcCgcPrep: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80"
  },
  icons: {
    course: {
      puppyFoundations: `${base}/icons/course/puppy-foundations.png`,
      everydayObedience: `${base}/icons/course/everyday-obedience.png`,
      calmHomeSkills: `${base}/icons/course/calm-home-skills.png`,
      separationSupport: `${base}/icons/course/separation-support.png`,
      leashReactivityReset: `${base}/icons/course/leash-reactivity-reset.png`,
      enrichmentAtHome: `${base}/icons/course/enrichment-at-home.png`
    },
    pricing: {
      singleLesson: `${base}/icons/pricing/single-lesson.png`,
      monthly: `${base}/icons/pricing/monthly-membership.png`,
      lifetime: `${base}/icons/pricing/lifetime-access.png`
    },
    benefits: {
      videoLessons: `${base}/icons/benefits/video-lessons.png`,
      positiveReinforcement: `${base}/icons/benefits/positive-reinforcement.png`,
      certifiedTrainers: `${base}/icons/benefits/certified-trainers.png`,
      results: `${base}/icons/benefits/results.png`
    },
    ui: {
      arrowRight: `${base}/icons/ui/arrow-right.png`,
      bookmark: `${base}/icons/ui/bookmark.png`,
      check: `${base}/icons/ui/check.png`,
      download: `${base}/icons/ui/download.png`,
      lock: `${base}/icons/ui/lock.png`,
      play: `${base}/icons/ui/play.png`
    }
  },
  appIcons: {
    favicon32: `${base}/app-icons/favicon-32.png`,
    favicon16: `${base}/app-icons/favicon-16.png`,
    appIcon180: `${base}/app-icons/fitdog-academy-app-icon-180.png`
  },
  mockups: {
    landingPageShowcase: `${base}/mockups/fitdog-academy-landing-page-flashy.png`,
    appShowcase: `${base}/mockups/fitdog-academy-website-and-app-showcase.png`
  }
} as const;

/** Map academy track IDs to course photo + branded icon */
export const trackAssetMap: Record<string, { thumbnail: string; icon: string }> = {
  "puppy-foundations": {
    thumbnail: fitdogAcademyAssets.coursePhotos.puppyFoundations,
    icon: fitdogAcademyAssets.icons.course.puppyFoundations
  },
  "everyday-obedience": {
    thumbnail: fitdogAcademyAssets.coursePhotos.everydayObedience,
    icon: fitdogAcademyAssets.icons.course.everydayObedience
  },
  "calm-home-skills": {
    thumbnail: fitdogAcademyAssets.coursePhotos.calmHomeSkills,
    icon: fitdogAcademyAssets.icons.course.calmHomeSkills
  },
  "separation-support": {
    thumbnail: fitdogAcademyAssets.coursePhotos.separationSupport,
    icon: fitdogAcademyAssets.icons.course.separationSupport
  },
  "leash-reactivity-reset": {
    thumbnail: fitdogAcademyAssets.coursePhotos.leashReactivityReset,
    icon: fitdogAcademyAssets.icons.course.leashReactivityReset
  },
  "fitdog-enrichment-at-home": {
    thumbnail: fitdogAcademyAssets.coursePhotos.enrichmentAtHome,
    icon: fitdogAcademyAssets.icons.course.enrichmentAtHome
  },
  "akc-cgc-prep": {
    thumbnail: fitdogAcademyAssets.coursePhotos.akcCgcPrep,
    icon: fitdogAcademyAssets.icons.course.everydayObedience
  }
};

export function getTrackAssets(trackId: string) {
  return trackAssetMap[trackId] ?? trackAssetMap["puppy-foundations"];
}
