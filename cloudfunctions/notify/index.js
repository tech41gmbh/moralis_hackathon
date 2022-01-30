import { Router } from 'itty-router'
const { json } = require('itty-router-extras')
const { handleCors, wrapCorsHeader } = require('./corshelper')
const { SESClient, SendTemplatedEmailCommand } = require("@aws-sdk/client-ses"); 
const {SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const REGION = 'eu-central-1'; // Frankfurt
const jwt = require('@tsndr/cloudflare-worker-jwt')

// JWT secret
var secret = TOKENSECRET

// get-email-template

//  aws ses create-template --cli-input-json  file://YFM_EmailVerify.json
//  aws ses create-template --cli-input-json  file://YFM_EmailConnect.json
//  aws ses create-template --cli-input-json  file://YFM_EmailConfirm.json

// aws ses delete-template  --template-name YFM_EmailVerify
// aws ses delete-template  --template-name YFM_EmailConfirm
// aws ses delete-template  --template-name YFM_EmailConnect

// Private Stuff
async function myCredentialProvider() {
    return {
        // use wrangler secrets to provide these global variables
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
}

// wrangler secret put SENDGRID_API_KEY
function generatePin (){
    var min = 100000;
    var max = 999999;
    return ("0" + (Math.floor(Math.random() * (max - min + 1)) + min)).substr(-6);
}

const sendeVerifyEmail = async(email, code) =>{
    const client = new SESClient({
        region: REGION,
        credentialDefaultProvider: myCredentialProvider
    });

    var tpl = {email:email, code:code};
    const params = {
          Destination: {
            ToAddresses: [
              email, //RECEIVER_ADDRESS
            ],
          },
          Template: "YFM_EmailVerify",
          Source: "info@youfoundme.io",
          TemplateData: JSON.stringify(tpl)
        };
    return await client.send(new SendTemplatedEmailCommand(params));
}


// https://yfm_emailer.tech41.workers.dev/sendeConnectEmail/mathias.dietrich@gmail.com/1234/matd/turtle/thisismessage
const sendConnectEmail = async(email, magic, usernameTo, usernameFrom, msg) =>{
    const client = new SESClient({
        region: REGION,
        credentialDefaultProvider: myCredentialProvider
    });

    var tpl = {magic:magic, usernameFrom:usernameFrom, usernameTo:usernameTo,msg:msg};
    console.log(tpl)
    const params = {
          Destination: {
            ToAddresses: [
              email, //RECEIVER_ADDRESS
            ],
          },
          Template: "YFM_EmailConnect",
          Source: "info@youfoundme.io",
          TemplateData: JSON.stringify(tpl)
        };
    try{
       await client.send(new SendTemplatedEmailCommand(params));
   }catch(e){
     return e.toString();
  }
  return "ok"
}

const sendConfirmEmail = async(email, did, usernameTo, usernameFrom ) =>{
    const client = new SESClient({
        region: REGION,
        credentialDefaultProvider: myCredentialProvider
    });

    var tpl = {did:did, usernameFrom:usernameFrom, usernameTo:usernameTo};
    console.log(tpl)
    const params = {
          Destination: {
            ToAddresses: [
              email, //RECEIVER_ADDRESS
            ],
          },
          Template: "YFM_EmailConfirm",
          Source: "info@youfoundme.io",
          TemplateData: JSON.stringify(tpl)
        };
    try{
      await client.send(new SendTemplatedEmailCommand(params));
    }
    catch(e){
     return e.toString()
    }
    return "ok"
}


const sendMessage = async(email, message) =>{
    const client = new SESClient({
        region: REGION,
        credentialDefaultProvider: myCredentialProvider
    });

    var tpl = {email:email, message:message};
    const params = {
          Destination: {
            ToAddresses: [
              email, //RECEIVER_ADDRESS
            ],
          },
          Template: "YFM_EmailMessage",
          Source: "info@youfoundme.io",
          TemplateData: JSON.stringify(tpl)
        };
    return await client.send(new SendTemplatedEmailCommand(params));
}

const sendsms =  async (mobno, otp) =>{
    console.log("sendsms  mobno: " + mobno);
    console.log("sendsms otp: " + otp);

    global.window = {}
    window.crypto = crypto

    var params = {
      Message: otp + ' is your Youfoundme  Pin',
      PhoneNumber: mobno,
      MessageStructure: 'string',
      Subject: 'Youfoundme'
    };


    const client = new SNSClient({
        region: REGION,
        credentialDefaultProvider: myCredentialProvider
    });
    return client.send(new PublishCommand(params));
}

// Create a new router
const router = Router()
router.options('/email/', handleCors({ methods: 'POST', maxAge: 86400 }))
router.options('/email/', handleCors({ methods: 'GET', maxAge: 86400 }))
router.options('/sms/', handleCors({ methods: 'GET', maxAge: 86400 }))
router.options('/message/', handleCors({ methods: 'GET', maxAge: 86400 }))

const verifyToken = async(req) =>{
  var verified = false;
  let token = req.headers.get('Authorization');
  if(token.length > 7){
    token = token.substr(7).trim();
    return await jwt.verify(token, secret)
  }
  return false;
}

router.get("/verifyemail/:email", async (req) => {
  let { params, query, url } = req;
  var verified = verifyToken(req);
  if(!verified){
    console.log("JWT token invalid")
    return wrapCorsHeader(json({error:'JWT Token not valid'}));
  }
  var code = generatePin();
  let email = decodeURIComponent(params.email);
  const result = await sendeVerifyEmail(email, code);
  console.log("sending email to " + email)
  const jstring = JSON.stringify({'status':'ok','code':code})
  return wrapCorsHeader(json({code:code}));
})

router.get("/message/:email/:message", async (req) => {
  let { params, query, url } = req;
  let email = decodeURIComponent(params.email);
  let message = decodeURIComponent(params.message);
  const result = await sendMessage(email, message);
  console.log("sending email to: " + email)
  console.log("sending message"  + message)
  return wrapCorsHeader(json({status:'ok'}));
})

router.get("/connect/:email/:magic/:usernameTo/:usernameFrom/:msg", async (req) => {
  let { params, query, url } = req;

  let email = decodeURIComponent(params.email);
  let magic = decodeURIComponent(params.magic);
  let usernameFrom = decodeURIComponent(params.usernameFrom);
  let usernameTo = decodeURIComponent(params.usernameTo);
  let msg = decodeURIComponent(params.msg);

  console.log("email: " +email );
  console.log("magic: " + magic);
  console.log("usernameFrom: " + usernameFrom);
  console.log("usernameTo: " + usernameTo);
  console.log("msg: " + msg);
  const result = await sendConnectEmail(email, magic, usernameTo, usernameFrom, msg) ;
  return wrapCorsHeader(json({status:result}));
})

router.get("/confirm/:email/:did/:usernameFrom/:usernameTo", async (req) => {
  let { params, query, url } = req;

  let email = decodeURIComponent(params.email);
  let did = decodeURIComponent(params.did);
  let usernameFrom = decodeURIComponent(params.usernameFrom);
  let usernameTo = decodeURIComponent(params.usernameTo);
  const result = await sendConfirmEmail(email, did, usernameTo, usernameFrom) ;
  console.log("sending connect email to " + email)
  return wrapCorsHeader(json({status:result}));
})

router.get("/sendsms/:mobno", async (req ) => {
  let { params, query, url } = req;
  var verified = verifyToken(req);
  if(!verified){
    return wrapCorsHeader(json({error:'JWT Token not valid'}));
  }
  var code = generatePin();
  let mobno = decodeURIComponent(params.mobno);
  const result = await sendsms(mobno, code);
  const jstring = JSON.stringify({'status':'ok','code':code})
  return wrapCorsHeader(json({code:code}));
})


async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json())
  }
  else if (contentType.includes("application/text")) {
    return response.text()
  }
  else if (contentType.includes("text/html")) {
    return response.text()
  }
  else {
    return response.text()
  }
}

async function handleRequest(body) {
  const init = {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      'Authorization': 'Bearer ' + SENDGRID_API_KEY,
      'Content-Length': Buffer.byteLength(body)
    },
  }
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", init)
  const results = await gatherResponse(response)
  return new Response(results, init)
}

router.post("/email", async request => {
  var r = await request.json();
  var template = r.tpl;
  var to = r.to;
  var code = r.code;

  console.log(to)
  console.log(code)

  var html = "Thank you for joining <a href='https://youfoundme.io'>youfoundme.io</a>.<br/><br/>Your Code is <b>" + code + "</b>."
  var data =
  {"personalizations":
  [
      {"to":[{"email": to}]}
  ], 
  "from":{"email":"info@youfoundme.io"}, 
  "subject":"YouFoundMe email verification",
  "content": [{"type": "text/html", "value":  html }]
  }
  var res = await handleRequest(data);

  const jstring = JSON.stringify({ status: 'ok'})
  return wrapCorsHeader(
      new Response(jstring, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
});

router.get('/', () => {
  if (ENVIRONMENT === "prod") {
     return new Response("{'name:'yfm_notify', 'version': '1.0.2', 'env':'prod'}")
  } 
  else{
     return new Response("{'name:'yfm_notify', 'version': '1.0.2', 'env':'dev'}")
  }
})


router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
