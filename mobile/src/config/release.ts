/** Deliberate release gates. Changing these requires evidence recorded in workflow-status.md. */
export const RELEASE = Object.freeze({
  audience: 'INTERNAL_PREVIEW',
  scanner: false,
  remoteSos: false,
  parentAccounts: false,
  adaptiveReports: false,
  minigames: false,
  timedChallenges: false,
  multipleLanguages: false,
  tour: false,
});
