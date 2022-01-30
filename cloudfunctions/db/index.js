// Handles DynamoDB


// imports
const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
  DeleteItemCommand
} = require('@aws-sdk/client-dynamodb')

const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')
const {
  RDSDataClient,
  ExecuteStatementCommand,
} = require('@aws-sdk/client-rds-data')
const { Router } = require('itty-router')
const { handleCors, wrapCorsHeader } = require('./corshelper')
const { json } = require('itty-router-extras')
const jwt = require('@tsndr/cloudflare-worker-jwt')


// const
const REGION = 'eu-central-1' // Frankfurt

const FLA_EMAILCONFIRMED = 1; // not NFT Meta
const FLA_SMSCONFIRMED = 2; // not NFT Meta
const FLA_FULLTIME = 4; // not NFT Meta
const FLA_PARTTIME = 8; // not NFT Meta
const FLA_CONTRACTS = 16; // not NFT Meta
const FLA_PROJECTS = 32; // not NFT Meta
const FLA_SCHOOL = 64; // Not NFT
const FLA_STUDENT = 128; // Not NFT
const FLA_LOCATION = 256; // Not NFT
const FLA_REFERENCES = 512; // Hide References (Not NFT Meta)
const FLA_CONTACT = 1024; // Disallow request of contact details (Not NFT)
const FLA_ANONYMOUS = 2048; // Anonymous
const FLA_MINTED = 4096; // User has an NFT
const FLA_INVESTOR = 8192; // Investor
const FLA_SPARE0 = 16384;
const FLA_SPARE1 = 32768;
const FLA_SPARE2 = 65536;
const FLA_SPARE3 = 131072;
const FLA_SPARE4 = 262144;

var TBL_REGISTER = "yfm_person"
var TBL_PERMISSION = "yfm_permission"
var secret = TOKENSECRET;



 // table names switch
 if (ENVIRONMENT === "dev") {
    TBL_REGISTER = "yfm_dev_person"
    TBL_PERMISSION = "yfm_dev_permission"
 }

const router = Router()
router.options('/get/:pubkey', handleCors({ methods: 'GET', maxAge: 86400 }))
router.options('/post/', handleCors({ methods: 'POST', maxAge: 86400 }))
router.options('/getuser/:name', handleCors({ methods: 'GET', maxAge: 86400 }))
router.options('/perm/get/:me/:you', handleCors({ methods: 'GET', maxAge: 86400 }))
router.options('/search/:term/:startkey', handleCors({ methods: 'GET', maxAge: 86400 }))

async function myCredentialProvider() {
  return {
    // use wrangler secrets to provide these global variables
    accessKeyId: 'AKIAXW6XU6E25N32QAOO', // AWS_ACCESS_KEY_ID,
    secretAccessKey: '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', //AWS_SECRET_ACCESS_KEY
  }
}

function didToPubkey(did) {
  return did.substr(8).toLowerCase();
}

async function parseToken(token) {
  const verified = await jwt.verify(token, secret)
  console.log("verified: " + verified);

  if(verified){
    const payload = await jwt.decode(token);
    console.log("sub: " + payload.sub);
    console.log("name: " + payload.name);
    console.log("session: " + payload.session);
    console.log("exp: " + payload.exp);
    return payload.sub;
  }
  return "";
}

export class Person {
  constructor() {
    this.did = ''
    this.pubkey = ''
    this.contract = ''
    this.username = ''
    this.jobtitle = ''
    this.teaser = ''
    this.img = ''
    this.avatar = ''
    this.tags = ''
    this.ref0 = ''
    this.ref1 = ''
    this.ref2 = ''
    this.metaverse = ''
    this.location = ''
    this.status = ''
    this.email = ''
    this.mobile = ''
    this.gname = ''
    this.sname = ''
    this.metafile = ''
    this.flags = ""
    this.created = ""
    this.magic = ""
    this.pin = ""
  }
}

function parsePerson(data, isOwner){
  var person = new Person()

  var flag = parseInt(data.Item.flags.S);

  person.did = data.Item.did.S
  person.pubkey = data.Item.pubkey.S
  person.contract = data.Item.contract.S
  person.username = data.Item.username.S
  person.jobtitle = data.Item.jobtitle.S
  person.teaser = data.Item.teaser.S
  person.img = data.Item.img.S
  person.avatar = data.Item.avatar.S
  person.tags = data.Item.tags.S
  person.flags = data.Item.flags.S
  person.metafile = data.Item.metafile.S
  person.created = data.Item.created.S
  person.magic = data.Item.magic.S
  person.pin = data.Item.pin.S
  person.status = data.Item.status.S

  if(isOwner || (!(flag & FLA_LOCATION))){
    person.metaverse = data.Item.metaverse.S
    person.location = data.Item.location.S
  }

  if(isOwner || (!(flag & FLA_REFERENCES))){
    person.ref0 = data.Item.ref0.S
    person.ref1 = data.Item.ref1.S
    person.ref2 = data.Item.ref2.S
  }

  // TODO add if permission for contacts exist
  if(isOwner){
    person.email = data.Item.email.S
    person.mobile = data.Item.mobile.S
    person.gname = data.Item.gname.S
    person.sname = data.Item.sname.S
  }
  return person;
}

/* ================================================================================================================================================================
*   People
  ================================================================================================================================================================*/
router.post('/post/', async req => {
  try {
    const j = await req.json()
    const person = j.person
    global.window = {}
    window.crypto = crypto

  var isOwner = false;
  let pubkey = person.pubkey
  let token = req.headers.get('Authorization');

  console.log("using JWT secret " + secret);
  console.log("token: " + token);

  if(token.length > 7){
    token = token.substr(7).trim();
    const verified = await jwt.verify(token, secret)
    if(!verified){
        const jstring = JSON.stringify({ error: 'JWT not valid-0' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
    }

    const did = await parseToken(token);
    console.log("did: " + did);
    if(!did.startsWith('did:yfm:')){
      const jstring = JSON.stringify({ error: 'JWT not valid-1' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
    }
    const pubkeyToken = didToPubkey(did);
    isOwner = (pubkeyToken == pubkey);
    console.log("pubkeyToken " + pubkeyToken);
  }

  if(!isOwner){
    console.log("Registration Hack pubkey: " + pubkey +  "JWT pubkey: " + pubkeyToken );
    const jstring = JSON.stringify({ error: 'Registration Hack pubkey: ' + pubkey +  'JWT pubkey: ' + pubkeyToken })
    return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
  }

  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })


  console.log("Got person " + JSON.stringify(person));

  const params = {
    TableName: TBL_REGISTER,
    Item: {
      pubkey: { S: person.pubkey },
      did: { S: person.did },
      contract: { S: person.contract },
      username: { S: person.username },
      jobtitle: { S: person.jobtitle },
      teaser: { S: person.teaser },
      img: { S: person.img },
      avatar: { S: person.avatar },
      tags: { S: person.tags },
      ref0: { S: person.ref0 },
      ref1: { S: person.ref1 },
      ref2: { S: person.ref2 },
      metaverse: { S: person.metaverse },
      location: { S: person.location },
      status: { S: person.status },
      email: { S: person.email },
      mobile: { S: person.mobile },
      gname: { S: person.gname },
      sname: { S: person.sname },
      metafile: { S: person.metafile },
      flags: { S: person.flags },
      created: { S: person.created },
      magic: { S: person.magic },
      pin: { S: person.pin },
    },
  }

  console.log("Inserting person " + JSON.stringify(params));

    const data = await client.send(new PutItemCommand(params))
    console.log(data)
    return wrapCorsHeader(json({ status: 'ok', data: data }))
  } catch (e) {
    return wrapCorsHeader(json({ error: e.message }))
  }
})

router.get('/get/:pubkey', async (req) => {
  let { params, query, url } = req;

  global.window = {}
  window.crypto = crypto

  var isOwner = false;
  let pubkey = decodeURIComponent(params.pubkey)
  let token = req.headers.get('Authorization');

  if(token != null && token.length > 7){
    token = token.substr(7).trim();

    const verified = await jwt.verify(token, secret)
    if(!verified){
        const jstring = JSON.stringify({ error: 'JWT not valid' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
    }

    console.log("token: " + token);
    const did = await parseToken(token);
    const pubkeyToken = didToPubkey(did);//perm/secret
    isOwner = (pubkeyToken == pubkey);
    console.log("pubkeyToken " + pubkeyToken);
  }

  if(query.override =='true'){
    console.log("using override: true");
     isOwner = true
  }

  console.log("Getting person " + pubkey);
  console.log("isOwner " + isOwner);

  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  var p = {
    TableName: TBL_REGISTER,
    Key: {
      pubkey: { S: pubkey }
    },
  }

  try {
    const data = await client.send(new GetItemCommand(p))
    var person = parsePerson(data, isOwner);
    var p = { person: person }
    const jstring = JSON.stringify(p, null, 2)
    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
  } catch (error) {
    const jstring = JSON.stringify({ error: error })
    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
  }
})


// used to check if username is taken
router.get('/getuser/:name', async ({ params }) => {
  global.window = {}
  window.crypto = crypto
  let username = decodeURIComponent(params.name)

  console.log(username)

 const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  const sp = 
  { 
    TableName: TBL_REGISTER,
    IndexName: 'username-index',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: { ':username':{'S': username}},
    ProjectionExpression: "pubkey,username,flags,created"
  }

 try {
    const data = await client.send(new QueryCommand(sp))

    const jstring = JSON.stringify(data.Items);
    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
  } catch (error) {
    console.log(error);
    const jstring = JSON.stringify({ error: error })
    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
  }
})


router.get('/search/:term/:startkey', async ({ params }) => {

  // let value = await TOKEN.get("my-key") // KV
  global.window = {}
  window.crypto = crypto
  const term = decodeURIComponent(params.term)
  var startkey = decodeURIComponent(params.startkey)
  console.log("term: " + term)
  console.log("startkey: " + startkey)
  
  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  const PROJECTION = "pubkey, did, teaser, jobtitle, username, flags,img"
  try {
    var sp ={}
    var data = {}
    if(term == "latest"){
      if(startkey == "" || startkey == "none"){
          sp = 
          { 
            TableName: TBL_REGISTER,
            ProjectionExpression: PROJECTION,
            Limit: 100
          }
        }else{
          sp = 
          { 
            TableName: TBL_REGISTER,
            ProjectionExpression: PROJECTION,
            ExclusiveStartKey: JSON.parse(startkey),
            Limit: 100
          }
        }
         data = await client.send(new ScanCommand(sp))
    }else{
          // check username exists============================
        const sp_username = 
        { 
          TableName: TBL_REGISTER,
          ProjectionExpression: PROJECTION,
          IndexName: 'username-index',
          KeyConditionExpression: 'username = :username',
          ExpressionAttributeValues: { ':username':{'S': term}}
        }
        data = await client.send(new QueryCommand(sp_username))
        if( data.ScannedCount  == 1){
          // we have one user
        }else{
            // search Title
          const sp_Title = 
            { 
              TableName: TBL_REGISTER,
              ProjectionExpression: PROJECTION,
              FilterExpression: 'contains(jobtitle, :jobtitle) or contains(teaser, :teaser) or contains(tags, :tags)',
              ExpressionAttributeValues: { ':jobtitle':{'S': term}, ':teaser':{'S': term},':tags':{'S': term}}
            }
            data = await client.send(new ScanCommand(sp_Title))
              if( data.ScannedCount >0){
                // we have job titles
              }else{
                // query Tags
              }
            }
    }
   
    var people = [];
    for(var p in data.Items){
      people.push({'did':data.Items[p].did.S, 'username':data.Items[p].username.S, 'img':data.Items[p].img.S, 'jobtitle':data.Items[p].jobtitle.S,'teaser':data.Items[p].teaser.S,'flags':data.Items[p].flags.S});
    }

    var search = {
        people:people,
        lastKey:data.LastEvaluatedKey,
        scannedCount:data.ScannedCount,
    }
    const jstring = JSON.stringify(search, null, 2)

    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )


  } catch (error) {
    console.log(error);
    const jstring = JSON.stringify({ error: error })
    return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
  }
})


/* ================================================================================================================================================================
*   Permissions
  ================================================================================================================================================================*/
// https://www.mischianti.org/2021/05/20/dynamodb-javascript-sdk-v2-v3-scan-table-data-with-pagination-5/
router.get('/perm/get/:me/:you', async (req) => {
   let { params, query, url } = req;
  global.window = {};
  window.crypto = crypto;



  let me = decodeURIComponent(params.me);
  let you = decodeURIComponent(params.you);
  console.log(me)
  console.log(you)

  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  var obj ={}
  var p = {
    TableName: TBL_PERMISSION,
    Key: {
      me: { S: me },
      you: { S: you},
    },
  }
  try{
    const data = await client.send(new GetItemCommand(p))
    const permission = data.Item.permission.S;
    obj = {permissions: permission};
  }catch(e){
    obj = e;
  }
  const jstring = JSON.stringify(obj, null, 2)
  return wrapCorsHeader(
    new Response(jstring, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }),
  )
})



// https://www.mischianti.org/2021/05/20/dynamodb-javascript-sdk-v2-v3-scan-table-data-with-pagination-5/
router.get('/perm/set/:me/:you', async (req) => {
  let { params, query, url } = req;
  global.window = {};
  window.crypto = crypto;

  let me = decodeURIComponent(params.me);
  let you = decodeURIComponent(params.you);
  let token = req.headers.get('Authorization');
  console.log("me; " + +me)
  console.log("you: " + you)
  console.log("token: " + token);

  var isOwner = false;
  if(token!= null && token.length > 7){
    token = token.substr(7).trim();
    const verified = await jwt.verify(token, secret)
    if(!verified){
        const jstring = JSON.stringify({ error: 'JWT not valid' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
    }
    const did = await parseToken(token);
    const pubkeyToken = didToPubkey(did);
    isOwner = (pubkeyToken == me);
  }

  if(query.override =='true'){
    console.log("using override: true");
     isOwner = true
  }

  if(!isOwner){
     const jstring = JSON.stringify({ error: 'operation not allowd' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
  }

  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  var obj ={}

  const p0 = {
    TableName: TBL_PERMISSION,
    Item: {
       me: { S: me },
      you: { S: you},
      permission: { S: 'CONTACT' },
   }
  }
  var p1 = {
    TableName: TBL_PERMISSION,
    Item: {
      me: { S: you },
      you: { S: me},
      permission: { S: 'CONTACT' },
   }
  }

  var obj = {};
  try{
    await client.send(new PutItemCommand(p0))
    await client.send(new PutItemCommand(p1))
    obj = {status: 'ok'};
  }catch(e){
    obj = e;
  }
  const jstring = JSON.stringify(obj, null, 2)
  return wrapCorsHeader(
    new Response(jstring, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }),
  )
})

//==========================================================================================================================================================================================
// https://www.mischianti.org/2021/05/20/dynamodb-javascript-sdk-v2-v3-scan-table-data-with-pagination-5/
// PERM DEL
//========================================================================================================================================================================================
router.get('/perm/del/:me/:you', async (req) => {
  let { params, query, url } = req;
  global.window = {};
  window.crypto = crypto;

  let me = decodeURIComponent(params.me);
  let you = decodeURIComponent(params.you);
  let token = req.headers.get('Authorization');
  console.log("me: " + me);
  console.log("you: " + you);
  console.log("JWT: " + token);
  console.log("running del: ")
 

  var isOwner = false;
  console.log("JWT: " + token);
  if(token.length > 7){
    token = token.substr(7).trim();

    const verified = await jwt.verify(token, secret);
    if(!verified)return wrapCorsHeader(json({error:'JWT not valid'}));

    const did = await parseToken(token);
    const pubkeyToken = didToPubkey(did);
    console.log("pubkeyToken: "  + pubkeyToken);
    isOwner = (pubkeyToken == me);
  }

  if(!isOwner){
    console.log("status: not the owner"  );
     const jstring = JSON.stringify({ error: 'operation not allowd' })
        return wrapCorsHeader(
          new Response(jstring, {
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
          }),
      )
  }

 console.log("going for delete" );
  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  var obj ={}
  var p0 = {
    TableName: TBL_PERMISSION,
    Key: {
      me: { S: me },
      you: { S: you},
    },
  }
   var p1 = {
    TableName: TBL_PERMISSION,
    Key: {
      me: { S: you },
      you: { S: me},
    },
  }
  try{
    await client.send(new DeleteItemCommand(p0));
    await client.send(new DeleteItemCommand(p1));

    obj = {'status': 'ok'};
  }catch(e){
    obj = {'status': e};
  }
  const jstring = JSON.stringify(obj, null, 2)
  console.log(jstring)
  return wrapCorsHeader(
    new Response(jstring, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }),
  )
})

//====================================================================================================================================================================================
// https://www.mischianti.org/2021/05/20/dynamodb-javascript-sdk-v2-v3-scan-table-data-with-pagination-5/
router.get('/perm/:me', async ({ params }) => {
  global.window = {};
  window.crypto = crypto;

  let me = decodeURIComponent(params.me);
  console.log(me)

  const client = new DynamoDBClient({
    region: REGION,
    credentialDefaultProvider: myCredentialProvider,
  })

  var obj = {permissions: []};

  const sp = 
  { 
    TableName: TBL_PERMISSION,
    ExpressionAttributeValues: {
        ':me' : {S: me}
    },
    FilterExpression: 'me = :me'
  }
  try{
    const data = await client.send(new ScanCommand(sp))

    for ( const p of data.Items) {
      obj.permissions.push({"you":p.you.S,"permission":p.permission.S});
   }
  }catch(e){
    obj = e;
  }

  const jstring = JSON.stringify(obj, null, 2)

  return wrapCorsHeader(
    new Response(jstring, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }),
  )
})



router.get('/get', async ({ params }) => {
  return new Response("{'error:'pubkey not provided'}")
})

// DEV:  https://yfm_db-dev.yfm.workers.dev
//       https://dbs-dev.youfoundme.io
// PROD: https://yfm_db.yfm.workers.dev
//       https://dbs.youfoundme.io

router.get('/', () => {
  if (ENVIRONMENT === "prod") {
     return new Response("{'name:'yfm_db', 'version': '1.0.1', 'env':'prod'}")
  } 
  else{
     return new Response("{'name:'yfm_db', 'version': '1.0.1', 'env':'dev'}")
  }
})

router.all('*', () => new Response('404, not found!', { status: 404 }))

/*

*/
addEventListener('fetch', e => {
  e.respondWith(router.handle(e.request))
})
