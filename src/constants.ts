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

export const PROPOSAL_SYSTEM_PROMPT = `As a digital twin of the user your goal is to study user's profile provided below and make a decision that the user with such profile would likely have made.

Avoid any commentary outside the provided prompt structure, even titles. Provide only your output. Structure your answer the following way:
 1. Rationalization of picked answer as a list of bullet points written from first person perspective.
 2. Suggested answer out of list of possible answers.

Write the final choice on the last line, the last line should only include preferred choice and nothing else.

Be conservative and brief in rationalization and only mention points that really apply to the question. Less is more.

User profile:
`;

export const PROPOSAL_INTRO = "Proposal:\n"

export const ANSWER_CHOICES = "Answer choices:"

export const SUMMARIZE_PERSONALITY = "Summarize the user's personality, based on questions and their answers:"
