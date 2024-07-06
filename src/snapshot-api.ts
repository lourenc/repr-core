import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { WalletClient } from 'viem'
import { Vote, Proposal, vote2Types, voteArray2Types, voteString2Types, voteTypes, voteStringTypes, voteArrayTypes } from './snapshot-types'

import {SNAPSHOT_SEQ_URL} from './config'

// const pk = generatePrivateKey();
// console.log(pk)
// const account = privateKeyToAccount("0xb8ec65298d3a5ebf199694c3b6edf6ca9c52ee4063856277da96f39df5421be2");

export const generateNewSecretKey = () => {
  return generatePrivateKey();
}

export const getWallet = (sk: `0x${string}`) => {
  const account = privateKeyToAccount(sk);
  const client = createWalletClient({
    chain: mainnet,
    transport: http(),
    account: account
  });
  return client
}

const NAME = 'snapshot';
const VERSION = '0.1.4';

export const domainAux: {
  name: string;
  version: string;
  chainId?: number;
} = {
  name: NAME,
  version: VERSION
  // chainId: 1
};

const sign = async (web3: WalletClient, message: any, type: any) => {
  const account = web3.account!;
  const checksumAddress = account.address;
  message.from = message.from || checksumAddress;
  if (!message.timestamp)
    message.timestamp = parseInt((Date.now() / 1e3).toFixed());

  const domainData = {
    ...domainAux
  };

  const data: any = { domain: domainData, types: type, message };
  const sig = await web3.signTypedData({ account, domain: domainData, types: data.types, primaryType: "Vote", message });

  return { address: checksumAddress, sig, data }
}

export const vote = async (web3: WalletClient, message: Vote) => {
  const isShutter = message?.privacy === 'shutter';
  if (!message.reason) message.reason = '';
  if (!message.app) message.app = '';
  if (!message.metadata) message.metadata = '{}';
  const type2 = message.proposal.startsWith('0x');
  let type = type2 ? vote2Types : voteTypes;
  if (['approval', 'ranked-choice'].includes(message.type))
    type = type2 ? voteArray2Types : voteArrayTypes;
  if (!isShutter && ['quadratic', 'weighted'].includes(message.type)) {
    type = type2 ? voteString2Types : voteStringTypes;
    message.choice = JSON.stringify(message.choice);
  }
  if (isShutter) type = type2 ? voteString2Types : voteStringTypes;
  delete message.privacy;
  // @ts-ignore
  delete message.type;
  return await sign(web3, message, type);
}

export const domain = {
  // name: 'Ether Mail',
  // version: '1',
  // chainId: 1,
  // verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const


export const doVote = async (wallet: WalletClient, proposalId: `0x${string}`, choice: number, space: string) => {
  const signedVote = await vote(wallet, {
    space: space,
    proposal: proposalId,
    type: 'single-choice',
    choice: choice,
    reason: 'Voted from repr.ai',
    app: 'my-app',
  });

  const response = await send(signedVote);
  return response.json();
}

// main()
//     .then(text => {
//         console.log(text);
//     })

const send =  async (envelop: any) => {
  let address = SNAPSHOT_SEQ_URL;
  const init = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(envelop)
  };
  return fetch(address, init);
}

