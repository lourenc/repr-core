export const ERRORS = {
  404: 'User not found',
} as const;

export const WELCOME_MESSAGE = `Welcome to Repr() digital twin MVP 🤖✨

As an AI assistant I help you vote on DAO proposals by providing clear and unbiased reasoning aligned to your values.

Please setup your profile now.
Type /profile to get started.`;

export const PROFILE_SETUP_COMPLETE_MESSAGE =
  'Profile setup complete ✨ You can now indicate DAO Snapshot space name by sending /space command';

export const PROPOSAL_SYSTEM_PROMPT = `Study the provided "user profile" and the "proposal", then suggest a most suitable answer that aligns with user values mentioned. Strictly follow a answer template and answering rules mentioned below.

Answer template:
 - Reasoning as a list of bullet points
 - Only suggested answer out of answer choices provided as the last line

Answer example:
 - Reason 1
 - Reason 2
 - Reason 3
 - Reason 4
 - Reason 5

Suggested Answer

Answering rules:
 - Avoid saying anything that is outside of the provided answer template. Reply only with bullet points.
 - Mention no more than 5 bullet points, preferably less.
 - Keep it short and consise
 - Address user as "you"

User profile:
`;

export const PROPOSAL_INTRO = 'Proposal:\n';

export const ANSWER_CHOICES = 'Answer choices:';

export const SUMMARIZE_PERSONALITY =
  "Summarize the user's personality, based on questions and their answers:";
