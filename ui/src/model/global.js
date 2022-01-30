/** @format */

import { types, getSnapshot, onSnapshot } from 'mobx-state-tree';
import * as API from '../io/api.js';

const Person = types
  .model({
    did: '',
    pubkey: '',
    contract: '',
    username: '',
    jobtitle: '',
    teaser: '',
    img: '',
    avatar: '',
    tags: '',
    ref0: '',
    ref1: '',
    ref2: '',
    metaverse: '',
    location: '',
    status: '',
    email: '',
    mobile: '',
    gname: '',
    sname: '',
    metafile: '',
    flags: '',
    created: '',
    pin: '',
    magic: '',
  })
  .actions((self) => ({
    set(p) {
      if (p == null || p.length < 10) {
        return;
      }
      self.did = p.did;
      self.pubkey = p.pubkey;
      self.contract = p.contract;
      self.username = p.username;
      self.jobtitle = p.jobtitle;
      self.avatar = p.avatar;
      self.teaser = p.teaser;
      self.img = p.img;
      self.tags = p.tags;
      self.ref0 = p.ref0;
      self.ref1 = p.ref1;
      self.ref2 = p.ref2;
      self.metaverse = p.metaverse;
      self.location = p.location;
      self.status = p.status;
      self.email = p.email;
      self.mobile = p.mobile;
      self.gname = p.gname;
      self.sname = p.sname;
      self.metafile = p.metafile;
      self.flags = p.flags;
      self.created = p.created;
      self.magic = p.magic;
      self.pin = p.pin;
    },
  }));

const AppState = types
  .model({
    searchfield: '',
    did: '',
    isLoaded: false,
    searchResult: '',
    chainId: 0,
    chainTitle: 'unknown',
    routeky: 0,
    token: '',
    connected: false,
    position: 0,
    scannedCount: 0,
    firstSearch: true,
    didfound: false,
    pagestate: 'FIND',
  })
  .actions((self) => ({
    set(key, val) {
      switch (key) {
        case 'pagestate':
          self.pagestate = val;
          return;
        case 'didfound':
          self.didfound = val;
          return;
        case 'firstSearch':
          self.firstSearch = val;
          return;

        case 'position':
          self.position = val;
          return;

        case 'scannedCount':
          self.scannedCount = val;
          return;

        case 'routeky':
          self.routeky = val;
          return;

        case 'did':
          self.did = val;
          return;

        case 'searchfield':
          self.searchfield = val;
          return;

        case 'isLoaded':
          self.isLoaded = val;
          return;

        case 'searchResult':
          self.searchResult = val;
          return;

        case 'chainId':
          self.chainId = val;
          return;

        case 'chainTitle':
          self.chainTitle = val;
          return;

        case 'token':
          self.token = val;
          return;

        case 'connected':
          self.connected = val;
          return;

        default:
          alert(
            'unknown key in appstate action key: ' + key + ' value: ' + val
          );
          return;
      }
    },
  }));

const me = Person.create();
const you = Person.create();
const appState = AppState.create();

const RootStore = types.model({
  me: types.map(Person),
  you: types.map(Person),
  appState: types.map(AppState),
});

// create an instance from a snapshot
const store = RootStore.create({});

// listen to new snapshots
onSnapshot(store, (snapshot) => {
  console.dir(snapshot);
});

export function getMe() {
  return getSnapshot(me);
}

export function getYou() {
  return getSnapshot(you);
}

export function getAppState() {
  return getSnapshot(appState);
}

export async function loadYouByPubKey(pubkey) {
  try {
    var p = await API.getPerson(pubkey);
    you.set(p.person);
    return p.person;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function setYou(person) {
  you.set(person);
}

export async function loadMeByPubKey(pubkey) {
  var p = await API.getPerson(pubkey);
  me.set(p.person);
  return p.person;
}

export async function setAppstate(key, val) {
  appState.set(key, val);
  return appState;
}

export async function updateMePerson(person) {
  me.set(person);
  API.postPerson(person);
  return me;
}

export async function UpdateMePersonNoDbSave(person) {
  me.set(person);
  return me;
}
