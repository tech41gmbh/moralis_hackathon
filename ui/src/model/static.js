/** @format */

export const ENV = 'PROD'; // DEV - PROD

export const ENABLE_WALLETCONNECT = false;
export const DISABLE_MINTING = false;

// Contract Adresses
const CONTRACT_ADDRESS_FUJI = '0xe83cA455C78fdc4Eac78444Da84cFb835A10ccA4';
const CONTRACT_ADDRESS_MAIN = '0x1A014C43a4A67e74449337bCC53220F9de9f7A13';
export const CONTRACT_ADDRESS =
  ENV == 'DEV' ? CONTRACT_ADDRESS_FUJI : CONTRACT_ADDRESS_MAIN;

// Expolorer
const AVALANCHE_EXPLORER_FUJI = 'https://testnet.snowtrace.io/';
const AVALANCHE_EXPLORER_MAIN = 'https://snowtrace.io/';
export const AVALANCHE_EXPLORER =
  ENV == 'DEV' ? AVALANCHE_EXPLORER_FUJI : AVALANCHE_EXPLORER_MAIN;

// Chain ID
const AVALANCHE_FUJI_CHAIN_ID = 43113;
const AVALANCHE_MAIN_CHAIN_ID = 43114;
export const CHAIN_ID =
  ENV == 'DEV' ? AVALANCHE_FUJI_CHAIN_ID : AVALANCHE_MAIN_CHAIN_ID;

const serverUrl_test = 'https://xhuajeqb4esg.usemoralis.com:2053/server';
const serverUrl_main = 'https://k2dnmd29p6q0.usemoralis.com:2053/server';
export const MORALIS_SERVER = ENV == 'DEV' ? serverUrl_test : serverUrl_main;

const appId_test = 'EKKcMCLp0U2o6l5xCNbuvZmmjCKkyRThrBqzEj9Z';
const appId_main = '0vuLj9rAMGGW5G4cARAiB70K8dB8uvIaiDMuRkDq';
export const MORALIS_APPID = ENV == 'DEV' ? appId_test : appId_main;

export const MORALIS_IPFS = 'https://ipfs.moralis.io:2053/';
export const PINATA_IPFS = 'https://gateway.pinata.cloud/ipfs/';
export const WEBROOT = 'https://youfoundme.io';

const NanoAvax = 1;
const MicroAvax = 1000 * NanoAvax;
const Schmeckle = 49 * MicroAvax + 463 * NanoAvax;
const MilliAvax = 1000 * MicroAvax;
const Avax = 1000 * MilliAvax;
const KiloAvax = 1000 * Avax;
const MegaAvax = 1000 * KiloAvax;

function convertAvax(amount) {
  return Math.round(amount * 10 ** 18);
}

export const DID_PRICE_AVAX_MULTI = 0.05; //Float
export const DID_PRICE_AVAX_DISPLAY = '0.05'; //String
export const DID_PRICE_AVAX = convertAvax(0.05);

export const VERSION = '0.0.1' + ' ' + ENV;
export const VERSION_YEAR = '2022';

/*NanoAvax uint64 = 1
MicroAvax uint64 = 1000 * NanoAvax
Schmeckle uint64 = 49*MicroAvax + 463*NanoAvax
MilliAvax uint64 = 1000 * MicroAvax
Avax uint64 = 1000 * MilliAvax
KiloAvax uint64 = 1000 * Avax
MegaAvax uint64 = 1000 * KiloAvax

*/

export const FLA_EMAILCONFIRMED = 1; // not NFT Meta
export const FLA_SMSCONFIRMED = 2; // not NFT Meta
export const FLA_FULLTIME = 4; // not NFT Meta
export const FLA_PARTTIME = 8; // not NFT Meta
export const FLA_CONTRACTS = 16; // not NFT Meta
export const FLA_PROJECTS = 32; // not NFT Meta
export const FLA_SCHOOL = 64; // Not NFT
export const FLA_STUDENT = 128; // Not NFT
export const FLA_LOCATION = 256; // Not NFT
export const FLA_REFERENCES = 512; // Hide References (Not NFT Meta)
export const FLA_CONTACT = 1024; // Disallow request of contact details (Not NFT)
export const FLA_ANONYMOUS = 2048; // Anonymous
export const FLA_MINTED = 4096; // User has an NFT
export const FLA_INVESTOR = 8192; // Investor

export const FLA_SPARE0 = 16384;
export const FLA_SPARE1 = 32768;
export const FLA_SPARE2 = 65536;
export const FLA_SPARE3 = 131072;
export const FLA_SPARE4 = 262144;
