/** @format */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
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

export default function Home() {
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

  navigate('/search?term=latest');

  return (
    <center>
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
          .
        </Text>
      </Container>
    </center>
  );
}
