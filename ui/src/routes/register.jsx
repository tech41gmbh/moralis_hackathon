/** @format */
import React, { useEffect, useState } from 'react';
import {
  ExternalLinkIcon,
  StarIcon,
  PhoneIcon,
  EmailIcon,
  TimeIcon,
  DownloadIcon,
  InfoOutlineIcon,
  ViewIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import {
  Heading,
  Text,
  Button,
  Container,
  Link,
  HStack,
  Box,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Input,
  Table,
  Tr,
  Td,
} from '@chakra-ui/react';
import { useMoralis } from 'react-moralis';
import { useNavigate } from 'react-router-dom';
import { getPersonByUserName } from '../io/api';
import { _toEscapedUtf8String } from 'ethers/lib/utils';

import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';
import * as HELPER from '../model/helper';
import * as GLOBAL from '../model/global';

export default function Register() {
  const [username, setUsername] = useState('');

  const [isUnique, setIsUnique] = useState(false);
  const [isReserved, setIsReserved] = useState(false);

  const [verified, SetVerified] = useState(false);
  const navigate = useNavigate();

  const [creation, setCreation] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameOk, setNameOk] = useState('');

  const {
    Moralis,
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticate,
    login,
    logout,
    user,
  } = useMoralis();

  // const isEmailValid = (val) => {
  //   let regEmail =
  //     /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   if (!regEmail.test(val)) {
  //     return false;
  //   }
  //   return true;
  // };

  useEffect(() => {
    GLOBAL.setAppstate('pagestate', 'REGISTER');
  });

  var regex = /^[A-Za-z]/;
  var regex2 = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  const setUsernamePre = (val) => {
    if (val.length == 0) {
      setUsername('');
      return;
    }
    if (val.length > 20) {
      return;
    }
    val = val.trim();
    if (val.length == 1) {
      var matches = val.match(regex);
      if (matches == null) {
        return;
      }
    }
    var matches = val.match(regex2);
    if (matches != null) {
      return;
    }
    var fChar = val.charAt(0).toUpperCase();
    if (val.length > 1) {
      fChar = fChar + val.substring(1);
    }
    setUsername(fChar);
  };

  const check = async () => {
    if (username.length < 2) {
      setNameError('username minimum 2 letters');
      setNameOk('');
      return;
    } else {
      setNameError('');
      setNameOk('checking...');
      var person = await getPersonByUserName(username);
      if (person.length > 0) {
        setNameError('Username taken');
        setNameOk('');
        setIsUnique(false);
        return;
      }
      setNameError('');
      setNameOk('username available');
      setIsUnique(true);
    }
  };

  const reserve = () => {
    if (username.length < 2) {
      setNameError('username minimum 2 letters');
      setNameOk('');
      return;
    } else {
      setNameError('');

      if (isUnique) {
        if (Moralis.User.current() == null) {
          alert('Please connect Metamask');
          return;
        }

        setIsReserved(true);
        setNameOk('reserved');

        var pubkey = Moralis.User.current().get('ethAddress');
        var did = HELPER.DidFromPubkey(pubkey);

        // Insert into Db
        var person = {};
        person.did = did;
        person.pubkey = pubkey.toLowerCase();
        person.contract = STATIC.CONTRACT_ADDRESS;
        person.username = username;
        person.jobtitle = '';
        person.teaser = '';
        person.img =
          'https://youfoundme.s3.eu-central-1.amazonaws.com/user/default.png';
        person.avatar = '';
        person.tags = '';
        person.ref0 = '';
        person.ref1 = '';
        person.ref2 = '';
        person.metaverse = '';
        person.location = '';
        person.status = '';
        person.email = '';
        person.mobile = '';
        person.gname = '';
        person.sname = '';
        person.metafile = '';
        person.flags = '0';
        person.created = new Date().toString();
        person.pin = '';
        person.magic = '';
        person.chain = STATIC.CHAIN_ID;
        GLOBAL.updateMePerson(person);
        navigate('/editor');
      }
    }
  };

  if (Moralis.User.current == null) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <center>
          <Container>
            <Heading>Me Editor</Heading>
            <br />
            <Text>
              Connect your Wallet to sign in.
              <br />
              <br />
              Please use&nbsp;
              <a href="https://metamaski.io" target="_blank">
                MetaMask&nbsp;
                <ExternalLinkIcon
                  fontSize="xs"
                  color="teal.500"
                  style={{ marginBottom: '-1px', marginLeft: '2px' }}
                />
              </a>{' '}
              or&nbsp;
              <a href="https://walletconnect.com/" target="_blank">
                Wallet Connect&nbsp;
                <ExternalLinkIcon
                  fontSize="xs"
                  color="teal.500"
                  style={{ marginBottom: '-1px', marginLeft: '2px' }}
                />
              </a>
              .
            </Text>
          </Container>
        </center>
      </main>
    );
  }

  return (
    <Container>
      <Heading>Register</Heading>
      <Table
        variant="unstyled"
        style={{ padding: '0px', margin: '0px' }}
        className="table-tiny"
        size="sm"
        width="100%"
        cellPadding="0">
        <Tr>
          <Td>Username</Td>
          <Td width="400px">
            <Input
              width="250px"
              placeholder="Username (no spaces!)"
              value={username}
              onChange={(e) => setUsernamePre(e.target.value)}
              isDisabled={isReserved}
            />
          </Td>
          <Td width="100px">
            <HStack>
              <Button isDisabled={isReserved} onClick={check}>
                Check availability
              </Button>
              <Button isDisabled={!isUnique || isReserved} onClick={reserve}>
                Reserve
              </Button>
            </HStack>
          </Td>
        </Tr>
        <Tr>
          <Td></Td>
          <Td>
            <Text color="red.500">{nameError}</Text>
            <Text color="green.500">{nameOk}</Text>
          </Td>
        </Tr>

        <Tr>
          <Td colSpan="3">
            <Text color="white.500">Reserve your username today!</Text>
            <br />
            <Text color="gray.500" t>
              Your username will become permanent, when you create your NFT on
              the next screen. It is not possible to change the username without
              creating another NFT with a different wallet address, so choose
              wisely. We reserve for max 5 days, so mint your NFT today.
              <br />
              <br />
              Usernames are case sensitive, minimum 2 characters, start with a
              capital letter.
            </Text>
          </Td>
        </Tr>
      </Table>
    </Container>
  );
}
