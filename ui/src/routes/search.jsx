/** @format */

import React, { useState, useEffect, forwardRef } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from 'react-router-dom';

import {
  Center,
  Heading,
  Image,
  Input,
  Container,
  Text,
  Button,
  HStack,
  Link,
  Table,
  Tr,
  Td,
  Img,
  Header,
  VStack,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Box,
  Spacer,
  Flex,
} from '@chakra-ui/react';

import { getAppState, loadPersonByPubKey, setAppstate } from '../model/global';
import { searchPerson, getPerson } from '../io/api';
import * as Global from '../model/global';
import * as Helper from '../model/helper';
import * as STATIC from '../model/static';

const Search = () => {
  const [searchResult, setSearchResult] = useState([]);
  const [searchfield, setSearchfield] = useState('latest');
  const search = useLocation().search;
  const newTerm = new URLSearchParams(search).get('term');
  const [scannedCount, setScannedCount] = useState(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const term = searchParams.get('term'); //query string
    Global.setAppstate('pagestate', 'FIND');
    if (Global.getAppState().firstSearch) {
      if (term == '') {
        Global.setAppstate('firstSearch', false);
        Global.setAppstate('searchfield', '');
        navigate('/search?term=latest');
        return;
      }
    }

    if (term != Global.getAppState().searchfield) {
      Global.setAppstate('searchfield', term);
      Global.setAppstate('position', 0);
      setScannedCount(0);
      setSearchfield(term);
      startSearch();
    }
  });

  const goSearch = (e) => {
    Global.setAppstate('pagestate', 'FIND');
    navigate('/search?term=' + searchfield);
  };

  const handleChange = (e) => {
    setSearchfield(e.target.value);
  };

  //=============================================

  const next = async () => {
    var pos = Global.getAppState().position;
    pos = pos + 10;
    if (pos > Global.getAppState().scannedCount) {
      pos = pos - 10;
    }
    Global.setAppstate('position', pos);
    showPeople();
  };

  const prev = async () => {
    var pos = Global.getAppState().position;
    pos = pos - 10;
    if (pos < 0) {
      pos = 0;
    }
    Global.setAppstate('position', pos);
    showPeople();
  };

  const startSearch = async () => {
    const term = searchParams.get('term');

    // return single person from DID
    if (term.startsWith('did:yfm:')) {
      navigate('/show/' + term);
      return;
    }

    // search returned many
    var data = await searchPerson(searchfield, 'none');
    Global.setAppstate('searchResult', JSON.stringify(data.people));
    Global.setAppstate('scannedCount', data.people.length);
    showPeople();
  };

  const showPeople = () => {
    var all = JSON.parse(Global.getAppState().searchResult);
    var showArray = [];
    var max = all.length - Global.getAppState().position;
    if (max > 10) {
      max = 10;
      setShowNext(true);
    } else {
      setShowNext(false);
    }
    for (
      var i = Global.getAppState().position;
      i < Global.getAppState().position + max;
      i = i + 1
    ) {
      showArray.push(all[i]);
    }
    setSearchResult(showArray);
  };

  const linkSelected = (did) => {
    var linkShowLInk = '/show/' + did;
    Global.setAppstate('did', did);
    navigate(linkShowLInk);
  };

  if (Global.getAppState().scannedCount == 0) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <Container>
          <VStack>
            <Input
              placeholder="Keywords, Username, DID or Tags"
              onChange={handleChange}
              value={searchfield}
            />
            <Button onClick={goSearch}>Search</Button>
          </VStack>
          <br />
          <Text color="teal.500" fontSize="xs">
            No records found
          </Text>
        </Container>
      </main>
    );
  }

  if (searchResult.length == 0) {
    // repopulate local state if we return
    showPeople();
  }
  return (
    <main style={{ padding: '1rem 0' }}>
      <Container maxW="container.xl">
        <Center>
          <VStack>
            <Heading fontSize="4xl">Search</Heading>

            <Input
              width="500px"
              size="lg"
              placeholder="Keywords, Username, DID or Tags, blank shows new members"
              onChange={handleChange}
              value={searchfield}
            />
            <Box h="10px" />
            <Button leftmargin="50px" size="lg" onClick={goSearch}>
              Search
            </Button>
          </VStack>
        </Center>
        <Box h="10px" />
        <Text color="teal.500" fontSize="xs">
          pos: {Global.getAppState().position + 1}. - entries found:{'  '}
          {Global.getAppState().scannedCount}
        </Text>
        <Table variant="simple" width="100%" border="0" padding="0" margin="0">
          <Tr>
            <Td colSpan="2">
              <Flex>
                {Global.getAppState().position > 0 && (
                  <Box w="50px">
                    <Link color="blue.300" onClick={() => prev()}>
                      <Text>prev</Text>
                    </Link>
                  </Box>
                )}
                <Spacer />
                {showNext && (
                  <Box w="50px">
                    <Link color="blue.300" onClick={() => next()}>
                      {' '}
                      <Text fontSize="1xl">next</Text>
                    </Link>
                  </Box>
                )}
              </Flex>
            </Td>
          </Tr>
          {Object.keys(searchResult).map((k, i) => {
            let d = searchResult[k];
            let fl = parseInt(d.flags);
            return (
              <Tr key={i}>
                <Td wdith="150px">
                  <Link onClick={() => linkSelected(d.did)}>
                    <Avatar
                      name={d.username}
                      boxSize="120px"
                      objectFit="cover"
                      src={d.img}
                      alt={d.username}
                    />
                  </Link>
                </Td>
                <Td>
                  <Table border="0" padding="0" margin="0">
                    <Tr>
                      <Td>
                        <Link onClick={() => linkSelected(d.did)}>
                          <Heading fontSize="6xl">{d.username}</Heading>
                        </Link>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Link onClick={() => linkSelected(d.did)}>
                          <Text color="gray.300" fontSize="3xl">
                            {d.jobtitle}
                          </Text>
                        </Link>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Link onClick={() => linkSelected(d.did)}>
                          <Text color="gray.400">{d.teaser}</Text>
                        </Link>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td colSpan="2">
                        <HStack>
                          {fl & STATIC.FLA_FULLTIME && (
                            <Text color="blue.500" fontSize="xs">
                              full time |
                            </Text>
                          )}

                          {fl & STATIC.FLA_PARTTIME && (
                            <Text color="blue.500" fontSize="xs">
                              part time |
                            </Text>
                          )}

                          {fl & STATIC.FLA_CONTRACTS && (
                            <Text color="blue.500" fontSize="xs">
                              contract |
                            </Text>
                          )}

                          {fl & STATIC.FLA_PROJECTS && (
                            <Text color="blue.500" fontSize="xs">
                              projects |
                            </Text>
                          )}

                          {fl & STATIC.FLA_INVESTOR && (
                            <Text color="blue.500" fontSize="xs">
                              investor |
                            </Text>
                          )}
                          {fl & STATIC.FLA_STUDENT && (
                            <Text color="blue.500" fontSize="xs">
                              student |
                            </Text>
                          )}
                          {fl & STATIC.FLA_SCHOOL && (
                            <Text color="blue.500" fontSize="xs">
                              school |
                            </Text>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  </Table>
                </Td>
              </Tr>
            );
          })}
          <Tr>
            <Td colSpan="2">
              <Flex>
                {Global.getAppState().position > 0 && (
                  <Box w="50px">
                    <Link color="blue.300" onClick={() => prev()}>
                      prev
                    </Link>
                  </Box>
                )}
                <Spacer />
                {showNext && (
                  <Box w="50px">
                    <Link color="blue.300" onClick={() => next()}>
                      {' '}
                      next
                    </Link>
                  </Box>
                )}
              </Flex>
            </Td>
          </Tr>
        </Table>
      </Container>
    </main>
  );
};

export default Search;
