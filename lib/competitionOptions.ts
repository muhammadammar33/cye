/** Extra per-competition choices on the registration form. */
export const SPEECH_LANGUAGES = ["English", "Urdu"] as const;
export const ARTS_CATEGORIES = ["Painting", "English Calligraphy", "Urdu Calligraphy"] as const;

/** Field stored with the registration, the form label, its placeholder and the allowed values. */
export type CompetitionChoice = { field: "language" | "artCategory"; label: string; prompt: string; options: readonly string[] };

const CHOICES: { match: RegExp; choice: CompetitionChoice }[] = [
  // The Speech (declamation) competition is judged separately in English and Urdu.
  { match: /speech|declamation/i, choice: { field: "language", label: "Speech language", prompt: "Choose English or Urdu", options: SPEECH_LANGUAGES } },
  // Arts has three categories, each with its own rules (rule book 19).
  { match: /^arts?$/i, choice: { field: "artCategory", label: "Arts category", prompt: "Choose Painting, English Calligraphy or Urdu Calligraphy", options: ARTS_CATEGORIES } },
];

export const CHOICE_FIELDS = ["language", "artCategory"] as const;

/** The extra choice a competition asks for, if any. */
export function choiceFor(competition: string): CompetitionChoice | null {
  return CHOICES.find((c) => c.match.test(competition.trim()))?.choice ?? null;
}
