import { fitdogAcademyAssets, getTrackAssets } from "@/assets/fitdogAcademyAssets";

export const colors = {
  orange: "#F15A24",
  skyBlue: "#1E9BFF",
  charcoal: "#303842",
  muted: "#667085",
  successGreen: "#2E9E5B",
  dark: "#0D1117",
  darkCard: "#161B22",
  darkBorder: "#2A3140",
  white: "#FFFFFF",
  softBlueBackground: "#F4FAFF"
};

export const heroImage = fitdogAcademyAssets.hero.landingHero;

export const courseImages: Record<string, string> = Object.fromEntries(
  Object.entries({
    "puppy-foundations": getTrackAssets("puppy-foundations").thumbnail,
    "everyday-obedience": getTrackAssets("everyday-obedience").thumbnail,
    "calm-home-skills": getTrackAssets("calm-home-skills").thumbnail,
    "separation-support": getTrackAssets("separation-support").thumbnail,
    "leash-reactivity-reset": getTrackAssets("leash-reactivity-reset").thumbnail,
    "fitdog-enrichment-at-home": getTrackAssets("fitdog-enrichment-at-home").thumbnail
  })
);

export { fitdogAcademyAssets, getTrackAssets };
