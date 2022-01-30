/** @format */

import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import {
  Link as LINKCH,
  HStack,
  VStack,
  Button,
  Text,
  Heading,
  useClipboard,
  Table,
  Tr,
  Td,
  Image,
  Box,
  Center,
} from '@chakra-ui/react';
import { useMediaQuery } from 'react-responsive';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import * as Global from './model/global';
import * as Helper from './model/helper';
import * as STATIC from './model/static';
import * as API from './io/api';
//==========================================================================================
export default function App() {
  const isDesktop = useMediaQuery({ query: '(min-width: 1537px)' });
  const [chainId, setChainId] = useState(0);
  const [chainTitle, setChainTitle] = useState('');
  const [addr, setAddr] = useState('');
  const [did, setDid] = useState('');
  const { hasCopied, onCopy } = useClipboard(addr);
  const [web3, setWeb3] = useState({});
  const navigate = useNavigate();
  const search = useLocation().search;
  const newTerm = new URLSearchParams(search).get('term');
  const [isConnected, setIsConnected] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [pageState, setPageState] = useState('FIND');

  const goSearch = async () => {
    Global.setAppstate('pagestate', 'FIND');
    setPageState('FIND');
    if (newTerm != null && newTerm.length > 0) {
      Global.setAppstate('searchfield', newTerm);
    }
    var searchlink = '/search?term=' + Global.getAppState().searchfield;
    navigate(searchlink);
  };

  const viewSelected = () => {
    setPageState('VIEW');
    Global.setAppstate('pagestate', 'VIEW');
    if (Global.getAppState().did) {
      var linkShowLInk = '/show/' + Global.getAppState().did;
      Global.setAppstate('pagestate', 'VIEW');
      navigate(linkShowLInk);
      return;
    }
    Global.setAppstate('pagestate', 'FIND');
    navigate('/search?term=' + Global.getAppState().searchfield);
  };

  const goEdit = async () => {
    setPageState('EDIT');
    Global.setAppstate('pagestate', 'EDIT');
    navigate('/editor');
  };

  const location = useLocation();

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
  Moralis.getSigningData = () => 'Signin to ƴoufoundme';

  // Moralis Events =================================================================
  Moralis.onConnect(async (accounts) => {
    runLogin();
  });

  Moralis.onDisconnect(async (accounts) => {
    Global.setAppstate('connected', false);
    setIsConnected(false);
  });

  Moralis.onAccountsChanged(async (accounts) => {
    if (accounts[0] == null) {
      return;
    }
    Global.loadMeByPubKey(accounts[0]);
    Global.setAppstate('did', Helper.DidFromPubkey(accounts[0]));
  });

  Moralis.onChainChanged(async (chain) => {
    if (window.ethereum) {
      var chainId = parseInt(window.ethereum.chainId, 16);
      // TODO check allowd chains...
      setChainTitle(Helper.MapChainId(chainId));
      Global.setAppstate('chainId', chainId);
    }
  });
  // End Moralis Events =================================================================

  useEffect(() => {
    setPageState(Global.getAppState().pagestate);
    // run only once
    if (isDone) {
      return;
    }
    setIsDone(true);
    if (user && Global.getAppState().token == '') {
      runLogin();
    }
  });

  const runLogin = async () => {
    const currentUser = Moralis.User.current();
    if (!currentUser) {
      return;
    }
    var address = currentUser.get('ethAddress');
    setAddr(address);
    var did = Helper.DidFromPubkey(address);
    Moralis.enableWeb3().then((_web3) => {
      setWeb3(_web3);
      if (window.ethereum) {
        var chainId = parseInt(window.ethereum.chainId, 16);
        if (chainId != STATIC.CHAIN_ID) {
          alert('MetaMask Network is on a different Chain!');
          return;
        }
        setChainId(chainId);
        setChainTitle(Helper.MapChainId(chainId));
        Global.setAppstate('routeky', Global.getAppState().routeky + 1);
        window.sessionStorage.setItem('sessionKey', address);
        const params = {
          username: currentUser.get('username'),
          did: did,
          session: currentUser.get('sessionToken'),
        };

        // TODO check if JWT exists and is valid for the time being - replace if expired
        Moralis.Cloud.run('createToken', params).then((token) => {
          Global.setAppstate('token', token);
          Global.loadMeByPubKey(address).then(() => {
            setIsConnected(true);
            Global.setAppstate('connected', true);
            setIsDone(false);

            if (Global.getAppState().pagestate == 'EDIT') {
              navigate('/editor');
            }
            if (Global.getAppState().pagestate == 'AUTH') {
              navigate('/auth');
            }
            if (Global.getAppState().pagestate == 'REGISTER') {
              navigate('/register');
            }
            if (Global.getAppState().pagestate == 'SIGN') {
              navigate('/sign');
            }
          });
        });
      }
    });
  };

  const LogonMetaMask = async () => {
    Moralis.authenticate({ signingMessage: 'Sign in ƴoufoundme' }).then(
      function (user) {
        runLogin();
      }
    );
  };

  const logonWalletConnect = async () => {
    try {
      await authenticate({
        signingMessage: 'Sign in ƴoufoundme',
        provider: 'walletconnect',
        mobileLinks: [
          'rainbow',
          'metamask',
          'argent',
          'trust',
          'imtoken',
          'pillar',
        ],
        chainId: STATIC.CHAIN_ID,
      }).then(function (user) {
        runLogin();
      });
    } catch (err) {
      debugger;
      console.log(err);
    }
  };

  const logoutAll = async () => {
    Global.setAppstate('token', '');
    window.sessionStorage.setItem('sessionKey', '');
    setIsConnected(false);
    Global.setAppstate('connected', false);
    logout();
  };

  var blokexplorerAccount = 'https://testnet.snowtrace.io/address/' + addr;

  const linkSelected = () => {
    var addr = user.get('ethAddress');
    var did = Helper.DidFromPubkey(addr);
    var viewlink = '/show/' + did;
    navigate(viewlink);
  };

  const bugurl =
    'mailto:bug@youfoundme.i?subject=youfoundme-bug-' + STATIC.VERSION;

  // Mobile
  if (!isDesktop) {
    return (
      <div
        style={{
          padding: '0',
          margin: '0',
          width: '100%',
          top: '0px',
          position: 'absolute',
        }}>
        <nav>
          <center>
            <Table
              size="lg"
              variant="simple"
              style={{
                borderSpacing: '0px',
                p: '0',
                m: '0',
                width: '100%',
              }}>
              <Tr>
                <Td width="100%">
                  <center>
                    <LINKCH href={STATIC.WEBROOT}>
                      <Image
                        width="37"
                        height="37"
                        src="/android-chrome-192x192.png"></Image>
                      <Heading fontSize="5xl">ƴoufoundme</Heading>
                    </LINKCH>
                  </center>
                </Td>
              </Tr>
              <Tr>
                <Td width="100%">
                  <center>
                    {!isConnected && (
                      <VStack>
                        <HStack>
                          {STATIC.ENABLE_WALLETCONNECT && (
                            <Button
                              size="lg"
                              isLoading={isAuthenticating}
                              onClick={() => logonWalletConnect()}>
                              Wallet Connect
                            </Button>
                          )}
                          &nbsp;&nbsp;
                          <Button
                            size="lg"
                            isLoading={isAuthenticating}
                            onClick={() => LogonMetaMask()}>
                            Metamask
                          </Button>
                        </HStack>
                      </VStack>
                    )}

                    {isConnected && (
                      <VStack>
                        <HStack>
                          <Button size="lg" onClick={() => logoutAll()}>
                            disconnet
                          </Button>
                          <LINKCH
                            color="blue.500"
                            href="https://testnet.snowtrace.io/block/0x3b9197c2e27818ab344d1c567917e8c569850b5901926f1e777c0e505547a84e"
                            isExternal>
                            <HStack align="flex-end">
                              <Text fontSize="xs">
                                {chainTitle} {chainId}
                              </Text>
                            </HStack>
                          </LINKCH>
                        </HStack>

                        <HStack>
                          <LINKCH onClick={() => linkSelected()}>
                            <Text color="blue.500" fontSize="xs">
                              me
                            </Text>
                          </LINKCH>
                          <LINKCH href={blokexplorerAccount} isExternal>
                            <HStack>
                              <Text fontSize="xs">{addr}</Text>
                              <ExternalLinkIcon
                                fontSize="xs"
                                style={{
                                  marginBottom: '4px',
                                  marginLeft: '2px',
                                }}
                              />
                            </HStack>
                          </LINKCH>
                        </HStack>
                      </VStack>
                    )}
                  </center>
                </Td>
              </Tr>

              <Tr>
                <Td width="100%">
                  <Center>
                    <HStack>
                      {pageState == 'FIND' && (
                        <Button
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg"
                          color="blue.300"
                          onClick={goSearch}>
                          Find
                        </Button>
                      )}
                      {pageState != 'FIND' && (
                        <Button
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg"
                          onClick={goSearch}>
                          Find
                        </Button>
                      )}

                      {pageState == 'VIEW' && (
                        <Button
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg"
                          color="blue.300"
                          onClick={() => viewSelected()}>
                          View
                        </Button>
                      )}
                      {pageState != 'VIEW' && (
                        <Button
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg"
                          onClick={() => viewSelected()}>
                          View
                        </Button>
                      )}
                      {pageState == 'EDIT' && (
                        <Button
                          onClick={() => goEdit()}
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg"
                          color="blue.300">
                          {' '}
                          Me
                        </Button>
                      )}
                      {pageState != 'EDIT' && (
                        <Button
                          onClick={() => goEdit()}
                          paddingLeft="40px"
                          paddingRight="40px"
                          size="lg">
                          Me
                        </Button>
                      )}
                    </HStack>
                  </Center>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Outlet />
                </Td>
              </Tr>
              <Tr>
                <Td colSpan="3">
                  <center>
                    <Text color="yellow.500">
                      Found a bug? Please let us know at:{' '}
                      <LINKCH color="blue.500" href={bugurl} l>
                        bug@youfoundme.io
                      </LINKCH>
                    </Text>
                  </center>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <center>
                    <Text color="green.500" fontSize="xs">
                      ©{STATIC.VERSION_YEAR} TECH41 GmbH Berlin - Privacy Policy
                      - Terms of Service
                    </Text>
                    <Text color="green.500" fontSize="xs">
                      V: {STATIC.VERSION}
                    </Text>
                  </center>
                </Td>
              </Tr>
            </Table>
          </center>
        </nav>
      </div>
    );
  }

  // Desktop
  return (
    <div
      style={{
        padding: '0',
        margin: '0',
        width: '100%',
        top: '0px',
        position: 'absolute',
      }}>
      <nav>
        <center>
          <Table
            size="lg"
            variant="simple"
            style={{
              borderSpacing: '0px',
              p: '0',
              m: '0',
              width: '100%',
            }}>
            <Tr>
              <Td
                style={{
                  width: '20px',
                }}>
                <HStack>
                  <Image
                    width="37"
                    height="37"
                    src="/android-chrome-192x192.png"></Image>
                  <Box width="10px"></Box>
                  <Heading fontSize="5xl">ƴoufoundme</Heading>
                </HStack>
              </Td>
              <Td width="100%">
                <center>
                  <nav
                    style={{
                      width: '100%',
                      borderBottom: 'solid 0px',
                      paddingBottom: '1rem',
                    }}>
                    {pageState == 'FIND' && (
                      <Button color="blue.300" size="lg" onClick={goSearch}>
                        Find
                      </Button>
                    )}
                    {pageState != 'FIND' && (
                      <Button size="lg" onClick={goSearch}>
                        Find
                      </Button>
                    )}
                    &nbsp;&nbsp; &nbsp;
                    {pageState == 'VIEW' && (
                      <Button
                        color="blue.300"
                        size="lg"
                        onClick={() => viewSelected()}>
                        View
                      </Button>
                    )}
                    {pageState != 'VIEW' && (
                      <Button size="lg" onClick={() => viewSelected()}>
                        View
                      </Button>
                    )}
                    &nbsp;&nbsp; &nbsp;
                    {pageState == 'EDIT' && (
                      <Button
                        color="blue.300"
                        onClick={() => goEdit()}
                        size="lg">
                        Me
                      </Button>
                    )}
                    {pageState != 'EDIT' && (
                      <Button size="lg" onClick={() => goEdit()}>
                        Me
                      </Button>
                    )}
                  </nav>
                </center>
              </Td>
              <Td width="20px" align="right">
                <VStack align="flex-end">
                  {!isConnected && (
                    <HStack align="flex-end">
                      {STATIC.ENABLE_WALLETCONNECT && (
                        <Button
                          size="lg"
                          isLoading={isAuthenticating}
                          onClick={() => logonWalletConnect()}>
                          Wallet Connect
                        </Button>
                      )}
                      <Button
                        size="lg"
                        isLoading={isAuthenticating}
                        onClick={() => LogonMetaMask()}>
                        Metamask
                      </Button>
                    </HStack>
                  )}
                  {isConnected && (
                    <VStack align="flex-end">
                      <HStack align="flex-end">
                        <LINKCH
                          color="blue.500"
                          href="https://testnet.snowtrace.io/block/0x3b9197c2e27818ab344d1c567917e8c569850b5901926f1e777c0e505547a84e"
                          isExternal>
                          <HStack align="flex-end">
                            <Text fontSize="xs">
                              {chainTitle} {chainId}
                            </Text>
                          </HStack>
                        </LINKCH>
                        <Button onClick={() => logoutAll()}>disconnet</Button>
                      </HStack>

                      <HStack align="flex-end">
                        <LINKCH onClick={() => linkSelected()}>
                          <Text color="blue.500" fontSize="xs">
                            me
                          </Text>
                        </LINKCH>
                        <LINKCH href={blokexplorerAccount} isExternal>
                          <HStack align="flex-end">
                            <Text fontSize="xs">{addr}</Text>
                            <ExternalLinkIcon
                              fontSize="xs"
                              style={{ marginBottom: '4px', marginLeft: '2px' }}
                            />
                          </HStack>
                        </LINKCH>
                      </HStack>
                    </VStack>
                  )}
                  ,
                </VStack>
              </Td>
            </Tr>
            <Tr>
              <Td colSpan="3">
                <Outlet />
              </Td>
            </Tr>

            <Tr>
              <Td colSpan="3">
                <center>
                  <Text color="yellow.500">
                    Found a bug? Please let us know at:{' '}
                    <LINKCH color="blue.500" href={bugurl} l>
                      bug@youfoundme.io
                    </LINKCH>
                  </Text>
                </center>
              </Td>
            </Tr>

            <Tr>
              <Td colSpan="3">
                <center>
                  <Text color="green.500" fontSize="xs">
                    ©{STATIC.VERSION_YEAR} TECH41 GmbH Berlin - Privacy Policy -
                    Terms of Service - V: {STATIC.VERSION}
                  </Text>
                </center>
              </Td>
            </Tr>
          </Table>
        </center>
      </nav>
    </div>
  );
}
