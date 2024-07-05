import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

export async function attemptAnswer(systemPrompt: string, proposalBody: string) {
  let question = proposalBody;
  const message = await anthropic.messages.create({
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
      model: 'claude-3-opus-20240229',
    });
  
  const text = message.content[0].text;
  return text;
}