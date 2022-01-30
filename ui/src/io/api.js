/** @format */

import axios from 'axios';
import * as GLOBAL from '../model/global';
import * as STATIC from '../model/static';

var APIURL = 'https://api.youfoundme.io/v0/';
if (STATIC.ENV == 'DEV') {
  APIURL = 'https://api-dev.youfoundme.io/v0/';
}

/*
========================================================================================================================
= Search
========================================================================================================================
*/

export async function getAvaxPrice() {
  try {
    let res = await axios.get(
      'https://api.kraken.com/0/public/Ticker?pair=AVAXUSD'
    );
    return res.data.result.AVAXUSD.c[0];
  } catch (e) {
    return '~5.00';
  }
}

// https://api-dev.youfoundme.io/v0/search/latest/none
export async function searchPerson(term, startkey) {
  const GETPERSONURL = APIURL + 'search/';
  const url = GETPERSONURL + term + '/' + startkey;
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data;
}

export async function getPermissions(me, you) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(APIURL + 'perm2/get/' + me + '/' + you, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data.permissions;
}

export async function deletePermissions(me, you) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(APIURL + 'perm2/del/' + me + '/' + you, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data.status;
}

export async function setPermissions(me, you) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(APIURL + 'perm2/set/' + me + '/' + you, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data.status;
}

export async function sendEmail(email) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(APIURL + 'email/verifyemail/' + email, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data.code;
}

export async function getPerson(pubkey) {
  const GETPERSONURL = APIURL + 'person/get/';
  const url = GETPERSONURL + pubkey;
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data;
}

export async function getPersonByUserName(username) {
  const GETPERSONURL = APIURL + 'person/getuser/';
  const url = GETPERSONURL + username;
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data;
}

export async function SignVoucher(voucher) {
  const SIGNERURL = APIURL + 'signer';
  const token = GLOBAL.getAppState().token;
  let res = await axios.post(
    SIGNERURL,
    {
      voucher: voucher,
    },
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }
  );
  return res.data;
}

export async function postPerson(person) {
  const POSTPERSONURL = APIURL + 'person/post/';
  const token = GLOBAL.getAppState().token;
  axios
    .post(
      POSTPERSONURL,
      {
        person: person,
      },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }
    )
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}

export async function sendSMS(mobile) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(APIURL + 'sms/sendsms/' + mobile, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
  return res.data.code;
}

// Not securees by JWT
export async function getJWT(username, did, session) {
  let res = await axios.get(
    APIURL + 'token/get/' + username + '/' + did + '/' + session
  );
  return res.data.token;
}

export async function verifyJWT(token) {
  let res = await axios.get(APIURL + 'token/validate/' + token);
  return res.data.verified;
}

export async function connect(from, to, usernameFrom, msg) {
  const token = GLOBAL.getAppState().token;
  let res = await axios.get(
    APIURL +
      'connect/' +
      from +
      '/' +
      to +
      '/' +
      usernameFrom +
      '/' +
      encodeURIComponent(msg),
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }
  );
  return res.data;
}
