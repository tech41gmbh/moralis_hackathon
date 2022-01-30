import { Router } from 'itty-router';
const { json } = require('itty-router-extras');
const {URL} = require("url");
const { handleCors, wrapCorsHeader } = require('./corshelper')
const jwt = require('@tsndr/cloudflare-worker-jwt')

// Create a new router
const router = Router();

router.options("/*", handleCors({ methods: 'POST', maxAge: 86400 }))
router.options("/*", handleCors({ methods: 'GET', maxAge: 86400 }))

const version ='0.0.12';


// this is editable, not a const !
var majorVersion = "v0";


https://yfm_sign-dev.yfm.workers.dev/

var DB = "https://yfm_db.yfm.workers.dev/";
var SIGN = "https://yfm_sign.yfm.workers.dev/";
var NOTIFY = "https://yfm_notify.yfm.workers.dev/";
var URLROOT = "https://app.youfoundme.io/";
var secret = TOKENSECRET;

if (ENVIRONMENT === "dev") {
  DB = "https://yfm_db-dev.yfm.workers.dev/";
  SIGN = "https://yfm_sign-dev.yfm.workers.dev/";
  NOTIFY = "https://yfm_notify-dev.yfm.workers.dev/";
  URLROOT = "http://localhost:3000/";
}

// helper https://developers.cloudflare.com/workers/examples/post-json
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


const encodeGetParams = p => Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

// ========================================================================================================================================================
//      POST
// ========================================================================================================================================================
router.post("/*", async (req) => {
  console.log(version);

  try{
    let { params, query, url } = req;
    let requestArray = url.split("/");

    const protocol = requestArray[0];
    const domain = requestArray[2];

    console.log("protocol " + protocol);
    console.log("domain " + domain);
    if(requestArray.length < 3){
       if (ENVIRONMENT === "prod") {
           return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'prod'}));
        }else{
           return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'dev'}));
        }
    }
    majorVersion = requestArray[3];
    const type = requestArray[4];


    console.log("version " + majorVersion);
    console.log("type " + type);
 
    if(majorVersion != "v0"){
      return wrapCorsHeader(json({error:'requested version not available, please us v0', version:version}));
    }

    // ========================================================================================================================================
    // sign POST
    // 
    // https://api.yofoundme.io.de/v0/sign
    // ========================================================================================================================================
    if(type == "signer"){
       var str = JSON.stringify(await req.json());
      console.log("json: " + str);
      const init = {
        body: str,
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      }
      try{
        const response = await fetch(SIGN + 'signer', init);
        console.log(response);
        const results = await gatherResponse(response);
        console.log(results);
        return wrapCorsHeader(new Response(results));
      }catch(e){
        console.log(e);
        return wrapCorsHeader(json({error:e.message}));
      }
    }

    // ========================================================================================================================================
    // person POST
    // 
    // https://api.yofoundme.io.de/v0/person
    // ========================================================================================================================================
    if(type == "person"){
      const cmd = requestArray[6];
      console.log("cmd " +cmd);
      var str = JSON.stringify(await req.json());
      console.log("json: " + str);

      var token = req.headers.get('Authorization');
      console.log("token: " + token);

      const init = {
        body: str,
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Authorization" : token
        },
      }
      try{
        const response = await fetch(DB + 'post', init);
        console.log(response);
        const results = await gatherResponse(response);
        console.log(results);
        return wrapCorsHeader(json({status:results}));
      }catch(e){
        console.log(e);
        return wrapCorsHeader(json({error:e.message}));
      }
    }



    // ========================================================================================================================================
    // version POST
    // 
    // https://api.yofoundme.io.de/v0/person
    // ========================================================================================================================================
    if(type == "version"){
     if (ENVIRONMENT === "prod") {
         return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'prod'}));
      }else{
         return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'dev'}));
      }
    }

    // Default 
    return wrapCorsHeader(json({error:'unknown type',type:type, version:version,majorVersion:majorVersion}));
  }
  catch(err){
    return wrapCorsHeader(json({error:err}));
  }
})

// ========================================================================================================================================================
//      GET
// ========================================================================================================================================================
router.get("/*", async (req) => {
  try{
    let { params, query, url } = req;
    let requestArray = url.split("/");
    const protocol = requestArray[0];
    const domain = requestArray[2];
    if(requestArray.length < 5){
       if (ENVIRONMENT === "prod") {
           return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'prod'}));
        }else{
           return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'dev'}));
        }
    }
    majorVersion = requestArray[3];
    const type = requestArray[4];
    console.log("version " + version);
    console.log("type " + type);
 
    if(majorVersion != "v0"){
      return wrapCorsHeader(json({error:'requested version not available, please us v0', version:version}));
    }

    // ========================================================================================================================================
    // Person
    // https://api-dev.youfoundme.io/v0/person/get/0x58D22F24cd7fDa155F9F7EEfE9b32AdD46388aB9
    // https://api.youfoundme.io/v0/person/get/0x58D22F24cd7fDa155F9F7EEfE9b32AdD46388aB9
    // ========================================================================================================================================
    if(type == "person"){
      const cmd = requestArray[5];
      const param = requestArray[6];
      console.log("cmd: " + cmd);
      console.log("param: " + param);
      var token = req.headers.get('Authorization');
      if(token==null){
        token = "";
      }
      console.log("token: " + token);
      const url = DB + cmd + '/' + param.toLowerCase();
      console.log("requesting: " + url);
      return fetch(url,
          {
            headers:{
              "content-type": "application/json;charset=UTF-8",
              "Authorization" : token
            },
          },
        )
    }

    if(type == "search"){
      const term = requestArray[5];
      const startKey = requestArray[6];
      console.log("term: " + term);
      console.log("startKey: " + startKey);
      var token = req.headers.get('Authorization');
      if(token==null){
        token = "";
      }
      console.log("token: " + token);
      const url = DB  + 'search/' + term + "/" + startKey;
      console.log("requesting: " + url);
      return fetch(url,
          {
            headers:{
              "content-type": "application/json;charset=UTF-8",
              "Authorization" : token
            },
          },
        )
    }

    // ========================================================================================================================================
    // Message
    // 
    // 
    // ========================================================================================================================================
    if(type == "message"){
        const message = requestArray[5];
        console.log("message: " + message);
        const u = NOTIFY + 'message/investor@youfoundme.io/' + message;
        console.log("u: " + u);
        return fetch(u);
    }

    // ========================================================================================================================================
    // Confirm
    // 
    // 
    // ========================================================================================================================================
    if(type == "confirm"){
      const taskHash = requestArray[5];
      console.log("taskHash: " + taskHash)

      var task = JSON.parse(await KV_TOKEN.get(taskHash)); // expiryseconds
      console.log("task: " + task)

      // Insert Permission
      const dbUrl = DB + 'set/'  + task.from  + '/' + task.to + '?override=true'
      await fetch(dbUrl);
      console.log('first done')
      dbUrl = DB + 'set/'  + task.to + '/' + task.from + '?override=true'
      await fetch(dbUrl);
      console.log('seccond done')

      // redirect to message page
      return Response.redirect(URLROOT + "#/message/1/?did=did:yfm:" + task.to, 307);
    }

    // ========================================================================================================================================
    // Connect
    // 
    // https://api.yofoundme.io.de/v0/connect
    // ========================================================================================================================================
    if(type == "connect"){
      const from = requestArray[5];
      const to = requestArray[6];
      const usernameFrom = requestArray[7];
      const msg = requestArray[8];
      console.log("from: "  + from);
      console.log("to: "  + to);
      console.log("msg: "  + msg);

      try{
        //  get person from db
        const dbUrl = DB + 'get/'  + to + '?override=true'
        const personRes = await fetch(dbUrl,
          {
             headers:{
              "content-type": "application/json;charset=UTF-8"
            },
          });
        var personObj = JSON.parse(await gatherResponse(personRes));
        var person = personObj.person;
        var toEmail = person.email;
        var uernameTo = person.username;

        var task = {from:from, to:to,permission:'CONTACT'};
        var strTask = JSON.stringify(task);
        const myText = new TextEncoder().encode(strTask)
        const magic = btoa(await crypto.subtle.digest({ 
          name: "SHA-256",
          },
        myText, 
        ))

        // await NAMESPACE.delete(key)
        const expire = 60 * 60 * 24; // seconds
        var set = await KV_TOKEN.put(magic, strTask,{expirationTtl: expire}); // expiryseconds
        console.log('magic set' + magic);

        // Send email
        // /connect/:email/:magic/:usernameTo/:usernameFrom/:msg
        const u = NOTIFY + 'connect/' + toEmail + '/' + magic + '/' + uernameTo + '/' + usernameFrom + '/' + msg ;
        console.log(u);
        const emailRes = await fetch(u,
          {
             headers:{
              "content-type": "application/json;charset=UTF-8",
            },
          });
        var emailDone = JSON.parse(await gatherResponse(emailRes));

        //  create Task
        // TODO calculate hash
        // store in KV
        // send email
         return wrapCorsHeader(json({emailDone}));
      }catch(e){
         return wrapCorsHeader(json({error:e}));
      }
      return wrapCorsHeader(json({status:'ok'}));
    }

    // ========================================================================================================================================
    // Email
    // 
    // https://api.yofoundme.io.de/v0/email
    // ========================================================================================================================================
    if(type == "email"){
      const cmd = requestArray[5];
      const param = requestArray[6];
      return fetch(NOTIFY  + cmd + '/' + param)
    }

    // ========================================================================================================================================
    // SMS
    // 
    // https://api.yofoundme.io.de/v0/sms
    // ========================================================================================================================================
    if(type == "sms"){
      const cmd = requestArray[5];
      const param = requestArray[6];
      return fetch(NOTIFY + cmd + '/' + param)
    }

    // ========================================================================================================================================
    // Perm2
    // 
    // https://api.yofoundme.io.de/v0/perm2
    // ========================================================================================================================================
    if(type == "perm2"){
      var token = req.headers.get('Authorization');
      console.log("JWT token: " + token);
      const cmd = requestArray[5];
      const param0 = requestArray[6];
      const param1 = requestArray[7];
      return fetch(NOTIFY + 'perm/' + cmd + '/' + param0  + '/' + param1,
        {
           headers:{
             "content-type": "application/json;charset=UTF-8",
             "Authorization" : token
          },
        }
      );
    }

/*
https://1a2b3c4c5d6f.moralis.io:2053/server/functions/Hello?_ApplicationId=1a2b3c4c5d6f1a2b3c4c5d6f&name=CryptoChad
NDlhNmViYzRlOTNjZmRhYSIsIm5hbWUiOiJRZUo2U3ZyeTJsYmF5bFZNbUo2OGloamZEIiwiYWRtaW4iOiJmYWxzZSIsInNlc3Npb24iOiJyOjRjODQ4MWZjN2U5ZmIwY2I1YTNkODQwYjliZTZmZTgwIiwibmJmIjoxNjQxMjE2MjcyLCJleHAiOjE2NDEyOTkwNzIsImlhdCI6MTY0MTIxMjY3Mn0.AK20jTpXv2X3fEQgwMDq_yWwzp-LwiOI3naGtshzpZw
*/
    // ========================================================================================================================================
    // token
    // 
    // https://api.yofoundme.io.de/v0/token
    // ========================================================================================================================================
    if(type == "token"){
      const cmd = requestArray[5];

      if(cmd == 'validate'){
        const token = requestArray[6];
        console.log("token to validate: " + token);
        if(token == ""){
            return wrapCorsHeader(json({verified:'no token supplied'}));
        }
        
        try{
          const verified = await jwt.verify(token, secret)
          console.log("verified: " + verified);

          if(verified){
            const payload = await jwt.decode(token);
            console.log("sub: " + payload.sub);
            console.log("name: " + payload.name);
            console.log("session: " + payload.session);
            console.log("exp: " + payload.exp);
          }

          return wrapCorsHeader(json({verified:verified}));
        }catch(e){
          console.log("verified: " + e)
          return wrapCorsHeader(json({verified:'not a valid token'}));
        }
        return wrapCorsHeader(json({verified:'unknown'}));
      }

      if(cmd == 'set'){
          const username = requestArray[6];
          const did = requestArray[7];
          const session = requestArray[8];
          if(session == ""){
            return wrapCorsHeader(json({error:'no session supplied'}));
          }
          if(did == ""){
            return wrapCorsHeader(json({error:'no did supplied'}));
          }
          if(username == ""){
            return wrapCorsHeader(json({error:'no username supplied'}));
          }

          // https://github.com/tsndr/cloudflare-worker-jwt
          const token = await jwt.sign({
              sub: did,
              name: username,
              admin: 'false',
              session: session,
             // nbf: Math.floor(Date.now() / 1000) + (60 * 60),      // Not before: Now + 1h
              exp: Math.floor(Date.now() / 1000) + (24 * (60 * 60)) // Expires: Now + 23h
          }, secret)
          console.log("signed token with JWT secret: " + secret);
          console.log("in did: " + did);
          console.log("in username: " + username);
          console.log("in session: " + session);
          console.log("out token: " + token);
          return wrapCorsHeader(new Response(token));
      }
    } 

    // Catch ALL
    if (ENVIRONMENT === "prod") {
       return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'prod'}));
    }else{
       return  wrapCorsHeader(json({name:'yfm-api', version: version, env:'dev'}));
    }
  }
  catch(err){
    return wrapCorsHeader(json({error:err}));
  }
})


router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', async (e) => {
  e.respondWith(router.handle(e.request))
})
