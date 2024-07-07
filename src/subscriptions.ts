import { Markup, Telegraf } from 'telegraf';
import { db } from './db';
import {
  fetchProposals,
  getProposalSummary,
  prepareProposalPrompt,
} from './proposals';
import { attemptAnswer } from './ai';
import { getPersistedState, persistState } from './state';
import { generateProfileSystemPrompt } from './profile';
import { escapeSpecialCharacters, hexToBase64 } from './helpers';
import { STAGES } from './state';

export async function pollSubscriptions(bot: Telegraf) {
  const spacesToWatch = await getSpacesToWatch();
  const proposals = await fetchProposals(spacesToWatch);

  console.info(`fetched ${proposals.length} proposals...`);

  for (const proposal of proposals) {
    const usersSubscribedToSpace = await getUsersSubscribedToSpace(
      proposal.space.id
    );

    console.info(`found proposal ${proposal.id} ${proposal.title}`);
    console.info(`total users subscribed: ${usersSubscribedToSpace.length}`);
    console.info('usersSubscribedToSpace', usersSubscribedToSpace);

    for (const chatId of usersSubscribedToSpace) {
      const userState = await getPersistedState(chatId);

      if (
        userState.knownProposalIds.includes(proposal.id) ||
        userState.stage !== STAGES.AWAITING_PROPOSALS ||
        !userState.delegatedAt ||
        userState.delegatedAt > proposal.start * 1000
      ) {
        console.info(
          `skipping ${proposal.id} for chat ${chatId} because of reasons...`
        );
        continue;
      }

      const systemPrompt = generateProfileSystemPrompt(userState);
      const proposalSummary = getProposalSummary(proposal).trim();

      await bot.telegram.sendMessage(chatId, proposalSummary, {
        parse_mode: 'MarkdownV2',
      });

      const proposalPrompt = prepareProposalPrompt(proposal);
      const response = (
        await attemptAnswer('', systemPrompt + proposalPrompt)
      ).trim();
      const lastLineIndex = response.lastIndexOf('\n');

      await bot.telegram.sendMessage(
        chatId,
        '*AI thoughts:*\n' +
          escapeSpecialCharacters(
            lastLineIndex > 0 ? response.substring(0, lastLineIndex) : response
          ),
        {
          parse_mode: 'MarkdownV2',
        }
      );

      await persistState(chatId, {
        ...userState,
        knownProposalIds: [...userState.knownProposalIds, proposal.id],
        stage: STAGES.AWAITING_USER_DECISION,
      });

      const choice = (
        response
          .split('\n')
          .filter((str) => str !== '')
          .pop() as string
      ).trim();

      const choiceIndex = proposal.choices
        .map((choice) => choice.trim())
        .indexOf(choice);

      if (choiceIndex === -1) {
        await bot.telegram.sendMessage(
          chatId,
          'Cannot suggest a choice for this proposal\\.',
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              Markup.button.callback(
                'Ignore',
                `ignore-${hexToBase64(proposal.id.substring(2))}`
              ),
            ]),
          }
        );
      } else {
        const inlineKeyboard = Markup.inlineKeyboard([
          Markup.button.callback(
            'Accept & vote',
            `vote-${hexToBase64(proposal.id.substring(2))}-${choiceIndex}`
          ),
          Markup.button.callback(
            'Disagree',
            `disagree-${hexToBase64(proposal.id.substring(2))}`
          ),
          Markup.button.callback(
            'Ignore',
            `ignore-${hexToBase64(proposal.id.substring(2))}`
          ),
        ]);

        await bot.telegram.sendMessage(
          chatId,
          '*Suggested choice:* ' + escapeSpecialCharacters(choice),
          {
            parse_mode: 'MarkdownV2',
            ...inlineKeyboard,
          }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }
}

export async function saveSubscription(chatId: number, spaceId: string) {
  const usersSubscribedToSpace = await getUsersSubscribedToSpace(spaceId);
  if (!usersSubscribedToSpace.includes(chatId)) {
    usersSubscribedToSpace.push(chatId);
  }

  await db.put(
    `users-subscribed-to-space:${spaceId}`,
    JSON.stringify(usersSubscribedToSpace)
  );

  const spacesWatchlist = await getSpacesToWatch();
  if (!spacesWatchlist.includes(spaceId)) {
    spacesWatchlist.push(spaceId);
  }

  await db.put(`spaces-to-watch`, JSON.stringify(spacesWatchlist));
}

async function getUsersSubscribedToSpace(spaceId: string) {
  try {
    const raw = await db.get(`users-subscribed-to-space:${spaceId}`);
    return JSON.parse(raw.toString()) as number[];
  } catch (e: unknown) {
    return [];
  }
}

async function getSpacesToWatch() {
  try {
    const raw = await db.get(`spaces-to-watch`);
    return JSON.parse(raw.toString()) as string[];
  } catch (e: unknown) {
    return [];
  }
}
