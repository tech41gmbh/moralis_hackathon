/** @format */
import Frame, { FrameContextConsumer } from 'react-frame-component';
import axios from 'axios';
import useMessage from '@rottitime/react-hook-message-event';
import React, { useEffect, useState } from 'react';
import {
  Text,
  Button,
  HStack,
  Input,
  Heading,
  Container,
  AlertIcon,
  Box,
  Link as CHAKRALINK,
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  CloseButton,
  useAriaHidden,
  Checkbox,
  Td,
  Tr,
  Table,
  Textarea,
} from '@chakra-ui/react';

import { useMoralis } from 'react-moralis';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Global from '../model/global';
import * as IPFS from '../io/ipfs_api';
import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';
import * as HELPER from '../model/helper';

// Avatar https://youfoundme.s3.eu-central-1.amazonaws.com/matd.glb
export default function Avatar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageLink, setPageLink] = useState('');
  const [avataruri, setAvataruri] = useState('');

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

  const script = document.createElement('script');

  script.src = 'https://use.typekit.net/foobar.js';
  script.async = true;

  document.body.appendChild(script);

  useEffect(() => {});

  const saveAvatar = async () => {
    var privKey = await user.get('ethAddress');
    var uri = document.getElementById('avatarUrl').value;
    var person = Object.assign({}, Global.getMe());
    person.avatar = uri;
    Global.updateMePerson(person);
    navigate('/editor');
  };

  return (
    <center>
      <Container>
        <HStack>
          <Input
            hidden
            id="avatarUrl"
            value={avataruri}
            onChange={(e) => setAvataruri(e.target.value)}></Input>
          <Button hidden id="btnuse" onClick={saveAvatar}>
            Use avatar
          </Button>
        </HStack>
      </Container>
      <iframe
        id="iframe"
        height="800"
        width="1200"
        class="content"
        allow="camera *; microphone *"
        src="https://youfoundme.readyplayer.me/"></iframe>
    </center>
  );
}
