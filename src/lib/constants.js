import * as bitcoin from "bitcoinjs-lib";

export const INSCRIPTION_SEARCH_DEPTH = 5;
export const GITHUB_URL = "https://github.com/dannydeezy/nosft";
export const DEFAULT_FEE_RATE = 7;
export const SENDS_ENABLED = true;
export const TESTNET = false;
export const ASSUMED_TX_BYTES = 111;
export const RELAYS = ["wss://nostr.openordex.org"];
export const NOSTR_INSCRIPTION_KIND = 1002;
export const ORDINALS_EXPLORER_URL = "https://turbo.ordinalswallet.com/inscription";
export const ORDINALS_WALLET = "https://ordinalswallet.com/";
export const TURBO_API = "https://turbo.ordinalswallet.com";
export const BITCOIN_PRICE_API_URL = "https://blockchain.info/ticker?cors=true";
export const BLOCKSTREAM_API = "https://blockstream.info/api";
export const DEFAULT_DERIV_PATH = "m/86'/0'/0'/0/0";
export const MEMPOOL_API_URL = TESTNET ? "https://mempool.space/signet" : "https://blockstream.info";

export const NETWORK = TESTNET ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
export const ORDINALS_EXPLORER_URL_LEGACY = !TESTNET ? "https://ordinals.com" : "https://explorer-signet.openordex.org";
