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
  Button,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { useMoralis } from 'react-moralis';
import { useNavigate } from 'react-router-dom';
import * as GLOBAL from '../model/global';

export default function Message() {
  const [connectionUser, setConnectionUser] = useState('Matd');
  const [connectionDid, setConnectionDid] = useState(
    'did:yfm:0x345879B60BF5ccDDd06BC91E49A6eBc4e93CfDAa'
  );
  const [isConnected, setIsConnected] = useState(false);

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

  const closeNow = () => {
    window.close();
  };

  const visit = () => {
    navigate('/show/' + connectionDid);
  };

  useEffect(() => {
    if (user) {
      setIsConnected(true);
      if (GLOBAL.getAppState().token == '') {
      }
    }
  });

  return (
    <Container>
      <Heading>Message</Heading>
      <br />
      <Text>Thank you, {connectionUser} is a new connection.</Text>
      <br />
      <br />
      <Button onClick={visit}>View Matd</Button>

      {!isConnected && (
        <Text fontSize="xs" color="blue.500">
          To access your new contact please login first.
        </Text>
      )}
    </Container>
  );
}
