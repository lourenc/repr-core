import QUESTIONS_LIST from './questions.json';

import { PROPOSAL_SYSTEM_PROMPT } from './constants';
import { ChatState } from './state';

export type Question = string;
export type Answer = string;
export type Profile = Record<Question, Answer>;

// export const QUESTIONS_LIST = {
//   'What is your name?': [
//     'John Doe',
//     'Mark Zuckerberg',
//     'Elon Musk',
//     'Jeff Bezos',
//   ],
//   'How old are you?': ['18', '19', '20', '21', '60+'],
//   'What is your favorite color?': ['Red', 'Blue', 'Green', 'Yellow'],
// };

export function nextUnansweredQuestion(profile: Profile) {
  const unansweredQuestion = Object.keys(QUESTIONS_LIST).find(
    (question) => !profile[question]
  );

  return unansweredQuestion as keyof typeof QUESTIONS_LIST | undefined;
}

export function formQaList(state: ChatState) {
  let qaList = '';
  for (const [que, ans] of Object.entries(state.profile)) {
    qaList += `${que} ${ans}\n`;
  }
  return qaList.replaceAll(/\(\d+\/\d+\)/g, '').trim();
}

export function generateProfileSystemPrompt(state: ChatState) {
  const systemPrompt = PROPOSAL_SYSTEM_PROMPT;
  const qaList = formQaList(state);
  return systemPrompt + qaList;
}
export { QUESTIONS_LIST };
