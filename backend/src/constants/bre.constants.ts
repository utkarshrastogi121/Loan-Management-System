export const BRE_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_SALARY: 25_000,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  DISALLOWED_EMPLOYMENT: ['Unemployed'],
  ALLOWED_EMPLOYMENT: ['Salaried', 'Self-Employed'] as const,
} as const;