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
  Textarea,
  Text,
  Button,
  Container,
  Image,
  Link,
  Box,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Input,
  Table,
  HStack,
  VStack,
  Tr,
  Td,
} from '@chakra-ui/react';
import { useMoralis } from 'react-moralis';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonByUserName } from '../io/api';
import { _toEscapedUtf8String } from 'ethers/lib/utils';

import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';
import * as HELPER from '../model/helper';
import * as GLOBAL from '../model/global';

export default function Connect() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [jobtitle, setJobtitle] = useState('');
  const [img, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [errormsg, setErrormsg] = useState('');
  const [okmsg, setOkmsg] = useState('');

  const [isSendDiabled, setIsSendDisabled] = useState(false);

  var { did } = useParams();

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

  const send = () => {
    if (message.length < 2) {
      setErrormsg('Please add a message');
      setOkmsg('');
      return;
    }

    API.connect(
      GLOBAL.getMe().pubkey,
      HELPER.PubkeyFromDid(did),
      GLOBAL.getMe().username,
      message
    );
    setErrormsg('');
    setOkmsg('Your message has been sent');
    setIsSendDisabled(true);
  };

  useEffect(() => {
    var pubkey = HELPER.PubkeyFromDid(did);
    var person = GLOBAL.getYou();
    setUsername(person.username);
    setImage(person.img);
    setEmail(person.email);
    setJobtitle(person.jobtitle);
  });

  if (user == null) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <center>
          <Container>
            <Heading>Conntact</Heading>
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

  var placeholder = 'Hi ' + username + ',\n\nwould you be interested in.... ';
  return (
    <Container>
      <Heading>{username}</Heading>

      <Image boxSize="150" objectFit="cover" alt={username} src={img}></Image>
      <Box w="10px" />
      <Text>{jobtitle}</Text>

      <Box h="10px"></Box>
      <Textarea
        h="400px"
        placeholder={placeholder}
        onChange={(e) => setMessage(e.target.value)}>
        {message}
      </Textarea>
      <Box h="10px"></Box>
      <Button onClick={send} disabled={isSendDiabled}>
        Send message
      </Button>
      <Text color="red.500" fontSize="xs">
        {errormsg}
      </Text>
      <Text color="green.500" fontSize="xs">
        {okmsg}
      </Text>
      <Box h="10px" />
      <Text fontSize="xs" color="teal.500">
        Get in touch with {username}, we will pass your details on to {username}{' '}
        and email you back with contact details.
      </Text>
    </Container>
  );
}
