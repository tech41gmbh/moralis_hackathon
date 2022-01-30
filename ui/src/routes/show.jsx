/** @format */

import React, { useEffect, useState, updateState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
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
  SunIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  HStack,
  useClipboard,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
  Image,
  Heading,
  Container,
  Link,
  Button,
  Box,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useLatestRef,
  VStack,
  Avatar,
} from '@chakra-ui/react';

import { useMoralis } from 'react-moralis';

import * as GLOBAL from '../model/global';
import * as HELPER from '../model/helper';
import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';

//******************************************************** */
export default function Show() {
  const [lastDid, setLastDid] = useState('');
  const [tokenid, setTokenid] = useState('');
  const [showConnect, setShowConnect] = useState(false);
  const [showUnlink, setShowUnlink] = useState(false);
  const [enableConnect, setEnableShowConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  var { did } = useParams();
  const { hasCopied, onCopy } = useClipboard(did);

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
  //0x345879b60bf5ccddd06bc91e49a6ebc4e93cfdaa   Matd
  //0x58d22f24cd7fda155f9f7eefe9b32add46388ab9   Turtle
  //0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc   Cryptophine

  const navigate = useNavigate();
  const appState = GLOBAL.getAppState();

  // TODO multiple requests
  useEffect(() => {
    GLOBAL.setAppstate('pagestate', 'VIEW');
    if (did != GLOBAL.getYou().did) {
      GLOBAL.setAppstate('didfound', false);
      getPerson();
    }
  });

  const getPerson = async () => {
    if (lastDid == '' || did !== lastDid) {
      var pkey = HELPER.PubkeyFromDid(did);

      const person = await GLOBAL.loadYouByPubKey(pkey);
      if (person == null || JSON.stringify(person) == '{}') {
        GLOBAL.setAppstate('didfound', false);
        return;
      }
      setLastDid(did);
      var t = HELPER.TokenIdFromPubkey(person.pubkey);
      setTokenid(t);
      GLOBAL.setAppstate('didfound', true);

      if (user == null) {
        // we are not authenticated
        GLOBAL.setAppstate('pagestate', 'VIEW');
        navigate('/show/' + did);
        return;
      }

      API.getPermissions(GLOBAL.getMe().pubkey, person.pubkey).then(
        (permission) => {
          setIsConnected(permission == 'CONTACT');
        }
      );
      // enable the connect button
      setEnableShowConnect(isAuthenticated);

      // show the connect button
      var showConnectButton = isAuthenticated;
      if (GLOBAL.getYou().pubkey == GLOBAL.getMe().pubkey || isConnected) {
        showConnectButton = false;
        setShowUnlink(true);
      }
      setShowConnect(showConnectButton);
      GLOBAL.setAppstate('pagestate', 'VIEW');
      navigate('/show/' + did);
    }
  };

  const downloadVcf = () => {
    const element = document.createElement('a');

    // https://en.wikipedia.org/wiki/VCard
    var content = 'BEGIN:VCARD' + '\r\n';
    content += 'VERSION:2.1' + '\r\n';
    content += 'N:' + person.sname + ';' + person.gname + '\r\n';
    content += 'TITLE:' + person.username + '\r\n';
    content += 'PHOTO;PNG:' + person.img + '\r\n';
    content += 'TEL;WORK;VOICE:' + person.mobile + '\r\n';
    content += 'EMAIL:' + person.email + '\r\n';
    content += 'ROLE:' + person.jobtitle + '\r\n';
    content +=
      'Note:' +
      'https://app.youfoundme.io/#/show/' +
      HELPER.DidFromPubkey(person.pubkey) +
      '\r\n';
    content += 'GEO:' + person.location + '\r\n';
    content += 'UID:' + HELPER.DidFromPubkey(person.pubkey) + '\r\n';
    content +=
      'URI:' +
      'https://app.youfoundme.io/#/show/' +
      HELPER.DidFromPubkey(person.pubkey) +
      '\r\n';
    content +=
      'SOURCE:' +
      'https://app.youfoundme.io/#/show/' +
      HELPER.DidFromPubkey(person.pubkey) +
      '\r\n';
    content += 'REV:' + new Date().toISOString() + '\r\n';
    content += 'END:VCARD' + '\r\n';

    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = person.username + '.vcf';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const connect = (link) => {
    navigate('/connect/' + did);
  };

  const unlink = (link) => {
    API.deletePermissions(GLOBAL.getMe().pubkey, GLOBAL.getYou().pubkey);
    setShowUnlink(false);
    setIsConnected(false);
    setShowConnect(true);
  };

  const showlink = (link) => {
    if (link.startsWith('https')) {
      link = link.substring(8);
    }
    if (link.startsWith('http')) {
      link = link.substring(7);
    }
    if (link.length > 50) {
      link = link.substring(0, 50) + '...';
    }
    return link;
  };

  const person = GLOBAL.getYou();
  const avatarlink = '/avatar.html?url=' + person.avatar;

  if (!GLOBAL.getAppState().didfound) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <center>
          <Container width="100%"></Container>
          <h1>Did not found</h1>
        </center>
      </main>
    );
  }

  return (
    <main style={{ padding: '1rem 0' }}>
      <Container maxW="container.lg">
        <Link onClick={onCopy}>
          <HStack>
            <Text color="gray.500" fontSize="sm">
              {person.did}
            </Text>
            <CopyIcon color="gray.500" />
          </HStack>
        </Link>
        <HStack>
          {person.metafile.length > 0 && (
            <Link href={person.metaverse} isExternal>
              <Text color="gray.500" fontSize="sm">
                Metafile: {showlink(person.metafile)}
              </Text>
            </Link>
          )}
          {person.metafile.length === 0 && (
            <Text color="gray.500" fontSize="sm">
              Metafile: NFT not minted
            </Text>
          )}
        </HStack>
        <br />
        <Heading fontSize="6xl">{person.username}</Heading>
        <br />
        <HStack>
          {person.img.length > 0 && (
            <Avatar
              boxSize="200px"
              src={person.img}
              objectFit="cover"
              alt={person.username}
            />
          )}

          {showConnect && (
            <VStack>
              <Box boxSize="150px"></Box>
              <Button onClick={connect} disabled={!enableConnect}>
                Connect
              </Button>
            </VStack>
          )}
        </HStack>

        {person.avatar.length > 0 && (
          <HStack style={{ marginTop: '5px' }}>
            <Link color="teal.500" href={avatarlink} isExternal>
              Show Avatar
            </Link>
            <ExternalLinkIcon
              fontSize="xs"
              color="teal.500"
              style={{ marginBottom: '-1px', marginLeft: '2px' }}
            />{' '}
          </HStack>
        )}
        <br />
        <Heading>{person.jobtitle}</Heading>
        <Text fontSize="1xl">{person.teaser}</Text>
        <br />
        <Table variant="simple" width="100%">
          <Tr>
            <Td width="10px"></Td>
            <Td>
              <Text color="blue.500" fontSize="1xl">
                <b> References</b>
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              {person.ref0.length > 0 && (
                <Link href={person.ref0} isExternal>
                  <ExternalLinkIcon color="blue.500" />
                </Link>
              )}
              {person.ref0.length === 0 && (
                <ExternalLinkIcon color="blue.500" />
              )}
            </Td>
            <Td wdith="100%">
              {person.ref0.length > 0 && (
                <Link href={person.ref0} isExternal>
                  <Text fontSize="1xl" color="white.500">
                    {showlink(person.ref0)}
                  </Text>
                </Link>
              )}
              {person.ref0.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  1. Reference not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              {person.ref1.length > 0 && (
                <Link href={person.ref1} isExternal>
                  <ExternalLinkIcon color="blue.500" />
                </Link>
              )}
              {person.ref1.length === 0 && (
                <ExternalLinkIcon color="blue.500" />
              )}
            </Td>
            <Td>
              {person.ref1.length > 0 && (
                <Link href={person.ref0} isExternal>
                  <Text fontSize="1xl" color="white.500">
                    {showlink(person.ref1)}
                  </Text>
                </Link>
              )}
              {person.ref1.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  2. Reference not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              {person.ref2.length > 0 && (
                <Link href={person.ref2} isExternal>
                  <ExternalLinkIcon color="blue.500" />
                </Link>
              )}
              {person.ref2.length === 0 && (
                <ExternalLinkIcon color="blue.500" />
              )}
            </Td>
            <Td>
              {person.ref2.length > 0 && (
                <Link href={person.ref2} isExternal>
                  <Text fontSize="1xl" color="white.500">
                    {showlink(person.ref2)}
                  </Text>
                </Link>
              )}
              {person.ref2.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  3. Reference not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px"></Td>
            <Td>
              <Text color="blue.500" fontSize="1xl">
                <b> Locations</b>
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              {person.location.length > 0 && (
                <Link href={person.location} isExternal>
                  <SunIcon color="blue.500" />
                </Link>
              )}
              {person.location.length === 0 && (
                <ExternalLinkIcon color="blue.500" />
              )}
            </Td>
            <Td>
              {person.location.length > 0 && (
                <Link href={person.location} isExternal>
                  <Text fontSize="1xl" color="white.500">
                    {showlink(person.location)}
                  </Text>
                </Link>
              )}
              {person.location.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  Location not shown
                </Text>
              )}
            </Td>
          </Tr>

          <Tr>
            <Td width="10px">
              {person.metaverse.length > 0 && (
                <Link href={person.metaverse} isExternal>
                  <ViewIcon color="blue.500" />
                </Link>
              )}
              {person.metaverse.length === 0 && <ViewIcon color="blue.500" />}
            </Td>
            <Td>
              {person.metaverse.length > 0 && (
                <Link href={person.metaverse} isExternal>
                  <Text fontSize="1xl" color="white.500">
                    {showlink(person.metaverse)}
                  </Text>
                </Link>
              )}
              {person.metaverse.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  Metaverse not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px"></Td>
            <Td>
              <Text color="blue.500" fontSize="1xl">
                <b> Contact</b>

                {person.gname.length === 0 &&
                  person.sname.length === 0 &&
                  person.email.length === 0 &&
                  person.mobile.length === 0 && (
                    <Text fontSize="xs" color="gray.500">
                      only visible to linked contacts,{' '}
                      <Link onClick={connect} disabled={!isAuthenticated}>
                        please connect
                      </Link>
                    </Text>
                  )}
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td width="10px">
              <InfoOutlineIcon color="green.500" />
            </Td>
            <Td>
              {(person.gname.length > 0 || person.sname.length > 0) && (
                <Text fontSize="1xl" color="teal.500">
                  {person.gname} {person.sname}
                </Text>
              )}
              {person.gname.length === 0 && person.sname.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  Name not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              <EmailIcon color="green.500" />
            </Td>
            <Td>
              {person.email.length > 0 && (
                <Text fontSize="1xl" color="teal.500">
                  {person.email}
                </Text>
              )}
              {person.email.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  Email not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              <PhoneIcon color="green.500" />
            </Td>
            <Td>
              {person.mobile.length > 0 && (
                <Text fontSize="1xl" color="teal.500">
                  {person.mobile}
                </Text>
              )}
              {person.mobile.length === 0 && (
                <Text fontSize="1xl" color="gray.600">
                  Mobile not shown
                </Text>
              )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              {(person.gname.length > 0 ||
                person.sname.length > 0 ||
                person.email.length > 0 ||
                person.mobile.length > 0) && (
                <Link onClick={downloadVcf}>
                  <DownloadIcon color="green.500" />
                </Link>
              )}
              {person.gname.length === 0 &&
                person.sname.length === 0 &&
                person.email.length === 0 &&
                person.mobile.length === 0 && (
                  <DownloadIcon color="green.500" />
                )}
            </Td>
            <Td color="white.500">
              {(person.gname.length > 0 ||
                person.sname.length > 0 ||
                person.email.length > 0 ||
                person.mobile.length > 0) && (
                <Link onClick={downloadVcf}>VCF card</Link>
              )}
              {person.gname.length === 0 &&
                person.sname.length === 0 &&
                person.email.length === 0 &&
                person.mobile.length === 0 && (
                  <Text fontSize="1xl" color="gray.600">
                    VCF card hidden
                  </Text>
                )}
            </Td>
          </Tr>
          <Tr>
            <Td width="10px"></Td>
            <Td>
              <Text color="blue.500" fontSize="1xl">
                <b>Tags</b>
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              <StarIcon color="blue.500" />
            </Td>
            <Td>
              <Text color="white.500" fontSize="1xl">
                {person.tags}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td width="10px">
              <InfoIcon color="blue.500" />
            </Td>
            <Td>
              <HStack>
                {person.flags & STATIC.FLA_FULLTIME && (
                  <Text color="blue.500" fontSize="xs">
                    full time |
                  </Text>
                )}

                {person.flags & STATIC.FLA_PARTTIME && (
                  <Text color="blue.500" fontSize="xs">
                    part time |
                  </Text>
                )}

                {person.flags & STATIC.FLA_CONTRACTS && (
                  <Text color="blue.500" fontSize="xs">
                    contract |
                  </Text>
                )}

                {person.flags & STATIC.FLA_PROJECTS && (
                  <Text color="blue.500" fontSize="xs">
                    projects |
                  </Text>
                )}

                {person.flags & STATIC.FLA_INVESTOR && (
                  <Text color="blue.500" fontSize="xs">
                    investor |
                  </Text>
                )}
                {person.flags & STATIC.FLA_STUDENT && (
                  <Text color="blue.500" fontSize="xs">
                    student |
                  </Text>
                )}
                {person.flags & STATIC.FLA_SCHOOL && (
                  <Text color="blue.500" fontSize="xs">
                    school |
                  </Text>
                )}
              </HStack>
            </Td>
          </Tr>

          <Tr>
            <Td width="10px">
              <Text color="blue.500" fontSize="sm">
                <b> QR Link</b>
              </Text>
            </Td>
            <Td>
              <QRCode
                level="H"
                size="165"
                title="Youfoundme DID"
                fgColor="#FFFFFF"
                bgColor="#000000"
                value={'https://app.youfoundme.io/#/show/' + did}
              />
            </Td>
          </Tr>
          <Tr>
            <Td width="10px"></Td>
            <Td>
              {showUnlink && (
                <Button onClick={unlink} disabled={!enableConnect}>
                  Unlink
                </Button>
              )}
            </Td>
          </Tr>
        </Table>
      </Container>
    </main>
  );
}
