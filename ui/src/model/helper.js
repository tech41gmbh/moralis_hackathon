/** @format */
import Web3 from 'web3';
import { getHasher, OutputType, HashType } from 'bigint-hash';
import Web3EthAbi from 'web3-eth-abi';

//10196219370672644541601216188660491276260478785220810163497529090616   SHA3_224
//96932911298637702523298034616076952241110591865517956290731622492456824546905
// 82751696802861446618287329271326379553441206173434891033707984521910594309783
// export function TokenIdFromDid(did) {
//   return (
//     '' +
//     getHasher(HashType.SHA3_256)
//       .update(Buffer.from(did.substr(8)))
//       .digest(OutputType.BigInt)
//   );
// }

export function CreateMetafile(
  did,
  tokenid,
  image,
  avatar,
  username,
  jobtitle,
  teaser
) {
  var attr = {};
  attr['did'] = did;
  attr['tokenid'] = tokenid;
  attr['username'] = username;
  attr['avatar'] = avatar;
  attr['jobtitle'] = jobtitle;
  attr['teaser'] = teaser;

  var meta = {};
  meta['name'] = did;
  meta['description'] = 'Youfoundme DID, see https://youfoundme.io';
  meta['image'] = image;
  meta['external_url'] = 'https://youfoundme.io';
  meta['attributes'] = attr;
  return JSON.stringify(meta);
}

export function createTextFileDownload(meta, name) {
  const TextFile = (meta) => {
    const element = document.createElement('a');
    const file = new Blob([meta], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = name;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
}

export function TokenIdFromPubkey(pubkey) {
  //return uint256(Web3.utils.soliditySha3(pubkey));
  const hash = Web3.utils.soliditySha3({
    t: 'string',
    v: pubkey.toLowerCase(),
  });
  return Web3.utils.hexToNumberString(hash);
}

export function PubkeyFromDid(did) {
  return did.substr(8).toLowerCase();
}

export function DidFromPubkey(pubkey) {
  return 'did:yfm:' + pubkey.toLowerCase();
}

export function MapChainId(chaindId) {
  switch (chaindId) {
    case 1:
      return 'Ethereum Mainnet';

    case 43113:
      return 'Avalance Fuji';

    case 43114:
      return 'Avalance Main';

    default:
      return '';
  }
}

export function kmpSearch(text, pattern) {
  if (pattern.length == 0) return 0; // Immediate match

  // Compute longest suffix-prefix table
  var lsp = [0]; // Base case
  for (var i = 1; i < pattern.length; i++) {
    var j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
    while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) j = lsp[j - 1];
    if (pattern.charAt(i) == pattern.charAt(j)) j++;
    lsp.push(j);
  }

  // Walk through text string
  var j = 0; // Number of chars matched in pattern
  for (var i = 0; i < text.length; i++) {
    while (j > 0 && text.charAt(i) != pattern.charAt(j)) j = lsp[j - 1]; // Fall back in the pattern
    if (text.charAt(i) == pattern.charAt(j)) {
      j++; // Next char matched, increment position
      if (j == pattern.length) return i - (j - 1);
    }
  }
  return -1; // Not found
}
