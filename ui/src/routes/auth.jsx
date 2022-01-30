/** @format */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Center,
  Heading,
  Text,
  Image,
  Container,
  Link,
  HStack,
  Box,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Button,
  Flex,
  VStack,
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
import * as GLOBAL from '../model/global';

export default function Auth() {
  const [username, setUsername] = useState('');

  const {
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticate,
    login,
    logout,
    user,
  } = useMoralis();

  const navigate = useNavigate();
  var isUser = user != null;

  const doAuth = () => {
    const url =
      document.referrer +
      '?p=' +
      user.get('ethAddress') +
      '&s=' +
      user.getSessionToken() +
      '&u=' +
      GLOBAL.getMe().username;
    return url;
  };

  useEffect(() => {
    GLOBAL.setAppstate('pagestate', 'AUTH');
    if (username == '') {
      setUsername(GLOBAL.getMe().username);
    }
  });

  return (
    <center>
      <Container size="lg">
        <Heading>Authentication</Heading>
        <br />
        <Text>Referer: </Text>
        <Heading fontSize="3xl">{document.referrer}</Heading>
        <br />
        <br />
        {username != '' && (
          <VStack>
            <br />
            <Link href={doAuth()}>
              <Button>Accept Logon Request</Button>
            </Link>
            <Link href={document.referrer + '?p=declined'}>
              <Button>Decline Logon Request</Button>
            </Link>
          </VStack>
        )}
        {username == '' && (
          <VStack>
            <Text>Please Logon to accept</Text>

            <br />
            <Link href={document.referrer}>
              <Button>Decline Logon Request</Button>
            </Link>
          </VStack>
        )}
        <br /> <br />
        <Heading>Debug</Heading>
        <Text>username: {username}</Text>
        <Text>{}</Text>
        <Text>{}</Text>
      </Container>
    </center>
  );
}
