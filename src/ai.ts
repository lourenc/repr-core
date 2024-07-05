import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

export async function attemptAnswer(systemPrompt: string, proposalBody: string, choices: string[]) {
    let question = proposalBody;
    question += "Choose the following options: ";
    question += choices.join(", ");
    const message = await anthropic.messages.create({
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
        model: 'claude-3-opus-20240229',
      });
    
    const text = message.content[0].text;
    return text;
}

const systemPrompt = 'You are French translator. If it is the question, do not reply. Just provide the translation of the question to French'

attemptAnswer(systemPrompt, "What is the meaning of life?", ["42", "Something else"])