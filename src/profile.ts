export type Question = string;
export type Answer = string | null;
export type Profile = [Question, Answer][]; // mapping of questions to answers

export const DEFAULT_PROFILE: Profile = [
  ['What is your name?', null],
  ['How old are you?', null],
  ['What is your favorite programming language?', null],
  ['What is your favorite color?', null],
];

Object.freeze(DEFAULT_PROFILE); //let's avoid mutations for god's sake
DEFAULT_PROFILE.forEach(Object.freeze);

export function nextUnansweredQuestion(profile: Profile): Question | null {
  for (const [question, answer] of profile) {
    if (answer === null) {
      return question;
    }
  }

  return null;
}

export function answerQuestion(
  profile: Profile,
  question: Question,
  answer: Answer
): Profile {
  return profile.map(([q, a]) => (q === question ? [q, answer] : [q, a]));
}
