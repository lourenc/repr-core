export const ERRORS = {
  404: 'User not found',
} as const;

export const WELCOME_MESSAGE = `Welcome to the DAO Voting Assistant Bot!

Hello there! 🤖✨

I'm your AI assistant, here to help you navigate the world of DAO (Decentralized Autonomous Organization) voting and facilitate decision-making on various proposals. Whether you're a seasoned DAO member or a newcomer, I'm here to ensure your voting experience is smooth and informed.

Here's what I can do for you:

📜 Provide Proposal Information: Get detailed insights on all current and upcoming voting proposals.
📊 Track Voting Progress: Stay updated on the status and results of ongoing votes.
📈 Analyze Voting Trends: Access data-driven analysis to understand the implications of each proposal.
🔔 Set Voting Reminders: Never miss a vote with our timely reminders.
🤔 Answer Your Questions: Have queries about the DAO or a specific proposal? Just ask me!

Welcome aboard, and happy voting! 🗳️🚀

Further steps is to setup your profile. Please type /profile to get started.`;

export const PROFILE_SETUP_COMPLETE_MESSAGE =
  'Your profile is already setup ✨ You can now indicate DAO Snapshot space name by sending /space command';

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
