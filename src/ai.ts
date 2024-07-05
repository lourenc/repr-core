import Anthropic from '@anthropic-ai/sdk';
import { TextBlock } from '@anthropic-ai/sdk/resources';
import { ANTHROPIC_API_KEY } from './config';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export async function attemptAnswer(
  systemPrompt: string,
  proposalBody: string
) {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: proposalBody }],
    model: 'claude-3-opus-20240229',
  });

  const text = (message.content[0] as TextBlock).text;
  return text;
}
