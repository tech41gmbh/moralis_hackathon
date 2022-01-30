import { Router } from 'itty-router'
const { handleCors, wrapCorsHeader } = require('./corshelper')
const { json } = require('itty-router-extras')
const { getMessage, createTypeData} = require('eip-712')
const { SHA3, Keccak } = require('sha3');
const  ethers  = require('ethers');
const  utils  = require('ethers').utils;

const router = Router()

const signMessage = async (address, message) => {
    const hash = await ethers.utils.id(message);
    const sig  = await address.signMessage(ethers.utils.arrayify(hash));
    return sig;
}

/**
 * JSDoc typedefs.
 * 
 * @typedef {object} NFTVoucher
 * @property {ethers.BigNumber | number} tokenId the id of the un-minted NFT
 * @property {ethers.BigNumber | number} minPrice the minimum price (in wei) that the creator will accept to redeem this NFT
 * @property {string} uri the metadata URI to associate with this NFT
 * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
 */

var CHAINID = 43113
if (ENVIRONMENT === "prod") {
     CHAINID = 43114
  }else{
     CHAINID = 43113
}

const signingDomain = (contract) =>{
   return {
      name: "Youfoundme-Voucher",
      version: "1",
      chainId:CHAINID,
      verifyingContract: contract
    }
  }

const createVoucher = async (tokenId, uri, username, minPrice, contract, privKey)  =>{
    const voucher = { tokenId, uri, username, minPrice };
    const domain = signingDomain(contract);
    const types = {
      NFTVoucher: [
        {name: "tokenId", type: "uint256"},
        {name: "minPrice", type: "uint256"},
        {name: "uri", type: "string"},  
        {name: "username", type: "string"},  
      ]
    };

    // sign with private key
    var privateKey = new Buffer(privKey,"hex");
    var wallet = new ethers.Wallet(privateKey);
    var signature =  await wallet._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature,
    }
}

router.post("/signer", async request => {
    console.log("version 0.0.8 ")
    const j = await request.json()
    const voucher = j.voucher
    var fields = {};
    fields.tokenId = ethers.BigNumber.from(voucher.tokenId);
    fields.uri = voucher.uri;
    fields.username = voucher.username;
    fields.minPrice = voucher.minPrice;
    fields.key = voucher.key;
    fields.contract = voucher.contract;
    let privKey  = ""
    switch(fields.key ){
      case "KEY_PRIV_DEV0":
        if (ENVIRONMENT === "prod") {
          privKey = KEY_PRIV_PROD0;
        }else{
          privKey = KEY_PRIV_DEV0;
        }
         
      }
    console.log("privKey: " + privKey)
    console.log("tokenId "+ fields.tokenId)
    console.log("uri "+ fields.uri )
    console.log("username "+ fields.username)
    console.log("minPrice "+ fields.minPrice)
    console.log("key "+ fields.key)
    console.log("contract "+ fields.contract)
    let r = await createVoucher(fields.tokenId, fields.uri, fields.username, fields.minPrice, fields.contract, privKey);
    return wrapCorsHeader(json(r));
})

router.get('/', () => {
  if (ENVIRONMENT === "prod") {
     return new Response("{'name:'yfm_signer', 'version': '0.0.2', 'env':'prod'}")
  } 
  else{
     return new Response("{'name:'yfm_signer', 'version': '0.0.2', 'env':'dev'}")
  }
})

router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
