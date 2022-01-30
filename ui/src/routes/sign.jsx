/** @format */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Heading,
  Text,
  Image,
  Container,
  Link as CLink,
  HStack,
  Box,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Textarea,
  Button,
  Input,
} from '@chakra-ui/react';
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
import { useMoralis } from 'react-moralis';
import { useNavigate } from 'react-router-dom';
import { SHA3 } from 'sha3';
import { web3 } from 'web3';

import * as GLOBAL from '../model/global';
import * as IPFS from '../io/ipfs_api';
import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';
import * as HELPER from '../model/helper';

export default function Sign() {
  const [signature, setSignature] = useState('');
  const [messageText, setMessageText] = useState(
    'this is a simple text message'
  );

  const [did, setDid] = useState('');
  const [address, setAddress] = useState('');
  const [signerDid, setSignerDid] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [runFirst, setRunFirst] = useState(true);
  const [haveUser, setHaveUser] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

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

  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!haveUser) {
        Moralis.User.currentAsync().then(function (user) {
          if (user == null) {
            return;
          }
          setHaveUser(true);
          const addr = user.get('ethAddress');
          setAddress(addr);
          setDid(HELPER.DidFromPubkey(addr));
          setSignerDid(HELPER.DidFromPubkey(addr));
        });
      }
    } catch (e) {}
    GLOBAL.setAppstate('pagestate', 'SIGN');
  });

  // ============================================================
  const validate = async () => {
    setIsValidating(true);
    const r = '0x' + signature.substring(0, 64);
    const s = '0x' + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);

    var set = { text: messageText };
    const res = await WEB3.isValidSignature(
      Moralis,
      HELPER.PubkeyFromDid(signerDid),
      set,
      v,
      r,
      s
    );
    setIsValidating(false);
    setIsValid(res);
  };

  const copySignerDid = () => {
    setSignerDid(did);
    setAddress(did.substring(8));
  };

  const signMessage = async () => {
    const msgParams2 = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: STATIC.CHAIN_ID,
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Youfoundme',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: STATIC.CONTRACT_ADDRESS,
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },

      // Defining the message signing data content.
      message: {
        text: messageText,
      },
      // Refers to the keys of the *types* object below.
      primaryType: 'set',
      types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        set: [{ name: 'text', type: 'string' }],
      },
    });

    Moralis.User.currentAsync().then(function (user) {
      Moralis.enableWeb3().then((_web3) => {
        const addr = HELPER.PubkeyFromDid(signerDid);
        _web3.currentProvider.sendAsync(
          {
            method: 'eth_signTypedData_v4',
            params: [addr, msgParams2],
            from: addr,
          },
          function (err, result) {
            if (err) {
              return console.error(err);
            }
            const signature = result.result.substring(2);
            const r = '0x' + signature.substring(0, 64);
            const s = '0x' + signature.substring(64, 128);
            const v = parseInt(signature.substring(128, 130), 16);
            setSignature(signature);
          }
        );
      });
    });
  };

  if (haveUser) {
    return (
      <center>
        <Heading>Sign</Heading>
        <br />
        <Container>
          <Text>Signing DID: {did}</Text>{' '}
          <CLink onClick={() => copySignerDid()} color="blue.500">
            set as Verification DID
          </CLink>
          <br /> <br />
          <Text>Message</Text>
          <Textarea
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
            width="700px"
            height="200px"
            placeholder="Message"></Textarea>
          <Box h="10px" />
          <HStack>
            <Button onClick={() => signMessage()}>Sign Message</Button>
          </HStack>
          <Box h="10px" />
          <Text>Signature</Text>
          <Textarea
            value={signature}
            placeholder="Signature"
            onChange={(e) => setSignature(e.target.value)}
            width="700px"
            height="200px"
            fontSize="2xl"></Textarea>
          <Box h="10px" />
          <Text>Verification DID</Text>
          <Input
            fontSize="sm"
            value={signerDid}
            onChange={(e) => setSignerDid(e.target.value)}></Input>
          <Box h="10px" />
          <HStack>
            <Button onClick={() => validate()}>Validate Message</Button>
          </HStack>
          <Box h="10px" />
          {isValid && <Text color="green.500">valid</Text>}
          {!isValid && <Text color="red.500">not valid</Text>}
          {isValidating && <Text color="yellow.500">validating...</Text>}
        </Container>
      </center>
    );
  }

  return (
    <center>
      <Heading>Signature</Heading>
      <Container>
        <Text>
          Please connect your Wallet to sign in.
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
        </Text>
      </Container>
    </center>
  );
}
