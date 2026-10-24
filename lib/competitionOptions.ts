/** Extra per-competition choices on the registration form. */
export const SPEECH_LANGUAGES = ["English", "Urdu"] as const;

/** The Speech (declamation) competition is judged separately in English and Urdu. */
export const needsLanguage = (competition: string) => /speech|declamation/i.test(competition);
