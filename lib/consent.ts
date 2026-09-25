import type { InterestField } from "@/components/ui/InterestForm";

export const CONSENT_FIELDS: InterestField[] = [
  {
    name: "consent_accuracy",
    label: "I confirm that the information provided is accurate.",
    type: "checkbox",
    required: true,
  },
  {
    name: "consent_rules",
    label: "I agree to the rules and policies of Capital Youth Expo 2026.",
    type: "checkbox",
    required: true,
  },
];
