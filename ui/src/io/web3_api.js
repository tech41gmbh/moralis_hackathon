/** @format */

import { useMoralis } from 'react-moralis';

import { ABI_YOUFOUNDME } from './abis';
import * as STATIC from '../model/static';

const ethers = require('ethers');

// '0xdE9C2EBbb5d42F094271e21A9F911A9A2F9E0a67'
export async function redeem(moralis, redeemer, voucher, price) {
  const web3 = await moralis.enableWeb3();
  const contract = new web3.eth.Contract(
    ABI_YOUFOUNDME,
    STATIC.CONTRACT_ADDRESS
  );
  const f = contract.methods.redeem(redeemer, voucher);
  return f.send({ from: redeemer, value: price });
}

// https://medium.com/coinmonks/eip712-a-full-stack-example-e12185b03d54
export async function isValidSignature(moralis, address, set, v, r, s) {
  try {
    const web3 = await moralis.enableWeb3();
    const contract = new web3.eth.Contract(
      ABI_YOUFOUNDME,
      STATIC.CONTRACT_ADDRESS
    );
    const f = contract.methods.isValidSignature(address, set, v, r, s);
    var result = await f.call();
    return result;
  } catch (e) {
    return false;
  }
}

export async function setTokenURI(moralis, redeemer, tokenId, uri) {
  const web3 = await moralis.enableWeb3();
  const contract = new web3.eth.Contract(
    ABI_YOUFOUNDME,
    STATIC.CONTRACT_ADDRESS
  );
  const f = contract.methods.setTokenURI(tokenId, uri);
  return f.send({ from: redeemer, value: moralis.Units.ETH('0.0') });
}

export async function tokenURI(moralis, tokenId) {
  const web3 = await moralis.enableWeb3();
  const contract = new web3.eth.Contract(
    ABI_YOUFOUNDME,
    STATIC.CONTRACT_ADDRESS
  );
  const f = contract.methods.tokenURI(tokenId);
  return f.call();
}

export async function ownerOf(moralis, tokenId) {
  const web3 = await moralis.enableWeb3();
  const contract = new web3.eth.Contract(
    ABI_YOUFOUNDME,
    STATIC.CONTRACT_ADDRESS
  );
  const f = contract.methods.ownerOf(tokenId);
  return f.call();
}

export async function getTokenByUsername(moralis, username) {
  const web3 = await moralis.enableWeb3();
  const contract = new web3.eth.Contract(
    ABI_YOUFOUNDME,
    STATIC.CONTRACT_ADDRESS
  );
  const f = contract.methods.getTokenByUsername(username);
  return f.call();
}
