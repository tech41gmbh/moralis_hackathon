/** @format */

import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  Flex,
  VStack,
} from '@chakra-ui/react';
import { createSerializableStateInvariantMiddleware } from '@reduxjs/toolkit';

import * as Global from '../model/global';
import * as IPFS from '../io/ipfs_api';
import * as WEB3 from '../io/web3_api';
import * as API from '../io/api';
import * as STATIC from '../model/static';
import * as HELPER from '../model/helper';

export default function Editor() {
  // Authentication =============================

  const [userLoaded, setUserLoaded] = useState(false);
  const [did, setDid] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [contract, setContract] = useState('');
  const [username, setUsername] = useState('');
  const [jobtitle, setJobtitle] = useState('');
  const [teaser, setTeaser] = useState('');
  const [img, setImg] = useState('');
  const [avatar, setAvatar] = useState('');
  const [tags, setTags] = useState('');
  const [ref0, setRef0] = useState('');
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');
  const [location, setLocation] = useState('');
  const [metaverse, setMetaverse] = useState('');
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gname, setGname] = useState('');
  const [sname, setSname] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [metafile, setMetafile] = useState('');
  const [flags, setFlags] = useState(0);
  const [created, setCreated] = useState('');
  const [magic, setMagic] = useState('');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [codeExpected, setCodeExpected] = useState('');
  const [codeEmail, setCodeEmail] = useState('');
  const [codeEmailExpected, setCodeEmailExpected] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [changeImage, setChangeImage] = useState(false);
  const [changeAvatar, setChangeAvatar] = useState(false);
  const [tokenid, setTokenid] = useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [mobilevalerror, setMobilevalerror] = React.useState('');
  const [mobilevalidate, setMobilevalidate] = React.useState('Please validate');
  const [emailvalidate, setEmailvalidate] = React.useState('Please validate');
  const [mobileok, setMobileok] = React.useState('');
  const [emailok, setEmailok] = React.useState('');
  const [emailvalerror, setEmailvalerror] = React.useState('');
  const [showValidateboxEmail, setShowValidateboxEmail] = useState(false);
  const [showValidatebox, setShowValidatebox] = useState(false);
  const [dollar, setDollar] = useState(false);
  // Search
  const [searchParams, setSearchParams] = useSearchParams();

  // http://localhost:3000/editor?did=did:yfm:0x345879b60bf5ccddd06bc91e49a6ebc4e93cfdaa&url=https://d1a370nemizbjq.cloudfront.net/9a03fcc1-e9e3-435e-9b91-daca8f135597.glb

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

  useEffect(() => {
    // set the current Avax/Dollar based price for display
    getPrice();

    setUser();
  });

  const setUser = async () => {
    try {
      Moralis.User.currentAsync().then(function (user) {
        if (user == null) {
          return;
        }
        if (did != Global.getMe().did) {
          setPerson(Global.getMe());
          Global.setAppstate('pagestate', 'EDIT');
          return;
        }
        if (Global.getMe().username == '') {
          var address = user.get('ethAddress');
          Global.loadMeByPubKey(address).then(() => {
            if (Global.getMe().username == '') {
              navigate('/register');
              return;
            }
            Global.setAppstate('pagestate', 'EDIT');
            return;
          });
        }
      });
      setTokenid(HELPER.TokenIdFromPubkey(Global.getMe().pubkey));
    } catch (e) {
      console.log(e);
    }
  };

  const getPrice = async () => {
    const priceAvax = await API.getAvaxPrice();
    const priceUs = priceAvax * STATIC.DID_PRICE_AVAX_MULTI;
    setDollar(
      new Intl.NumberFormat('en-EN', { maximumSignificantDigits: 3 }).format(
        priceUs
      )
    );
  };

  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef();

  const onDelete = () => {
    setIsOpen(false);
    alert('not implemented');
  };

  const navigate = useNavigate();

  const validateEmail = async () => {
    if (codeEmail != codeEmailExpected) {
      setEmailvalerror('code not valid');
      setEmailok('');
      return;
    }

    setEmailok('');
    setEmailvalerror('');
    setShowValidateboxEmail(false);

    var old = parseInt(flags);
    var newFlage = old | STATIC.FLA_EMAILCONFIRMED;
    var person = getPerson();
    person.flags = newFlage.toString();

    // Write to Db
    Global.updateMePerson(person); // TODO Why can't we use handle, wehat resets flag?
    setFlags(newFlage);
  };

  const validateMobile = async () => {
    if (code != codeExpected) {
      setMobilevalerror('code not valid');
      setMobileok('');
      return;
    }

    setMobileok('');

    setMobilevalerror('');
    setShowValidatebox(false);

    var old = parseInt(flags);
    var newFlage = old | STATIC.FLA_SMSCONFIRMED;
    var person = getPerson();
    person.flags = newFlage.toString();

    // Write to Db
    Global.updateMePerson(person); // TODO Why can't we use handle, wehat resets flag?
    setFlags(newFlage);
  };

  const sendSMS = async () => {
    setShowValidatebox(true);
    API.sendSMS(mobile).then((codeexpected) => {
      setCodeExpected(codeexpected);
      setMobileok('Please check your mobile');
      setMobilevalidate('');
    });
  };

  const sendEmail = async () => {
    setShowValidateboxEmail(true);

    API.sendEmail(email).then((codeexpected) => {
      setCodeEmailExpected(codeexpected);
      setEmailok('Please check your email');
      setEmailvalidate('');
    });
  };

  const setCheckbox = (checked, perm) => {
    if (checked) {
      setFlags(flags | perm);
    } else {
      setFlags(flags ^ perm);
    }
  };

  const flip = () => {
    setChangeImage(!changeImage);
  };

  const flip2 = () => {
    setChangeAvatar(!changeAvatar);
  };

  const createAvatar = () => {
    handleSave();
    navigate('/avatar');
  };

  const getPerson = () => {
    var person = {};
    person.did = did;
    person.pubkey = pubkey.toLowerCase();
    person.contract = contract.toLowerCase();
    person.username = username;
    person.jobtitle = jobtitle;
    person.teaser = teaser;
    person.img = img;
    person.avatar = avatar;
    person.tags = tags;
    person.ref0 = ref0;
    person.ref1 = ref1;
    person.ref2 = ref2;
    person.metaverse = metaverse;
    person.location = location;
    person.status = status;
    person.email = email;
    person.mobile = mobile;
    person.gname = gname;
    person.sname = sname;
    person.metafile = metafile;
    person.flags = flags.toString();
    person.created = created;
    person.magic = magic;
    person.pin = pin;
    return person;
  };

  const setPerson = (person) => {
    setDid(person.did);
    setPubkey(person.pubkey);
    setContract(person.contract);
    setUsername(person.username);
    setJobtitle(person.jobtitle);
    setTeaser(person.teaser);
    setImg(person.img);
    setAvatar(person.avatar);
    setTags(person.tags);
    setRef0(person.ref0);
    setRef1(person.ref1);
    setRef2(person.ref2);
    setMetaverse(person.metaverse);
    setLocation(person.location);
    setStatus(person.status);
    setEmail(person.email);
    setMobile(person.mobile);
    setGname(person.gname);
    setSname(person.sname);
    setMetafile(person.metafile);
    setFlags(parseInt(person.flags));
    setCreated(person.created);
    setMagic(person.magic);
    setPin(person.pin);
  };

  const saveNFT = async () => {
    var tokenId = HELPER.TokenIdFromPubkey(pubkey);

    // Create new Metada
    const meta = HELPER.CreateMetafile(
      did,
      tokenId,
      img,
      avatar,
      username,
      jobtitle,
      teaser
    );
    var file = new Moralis.File('meta.json', { base64: btoa(meta) });
    await file.saveIPFS();
    var hash = file.hash();

    //var linkMeta = STATIC.PINATA_IPFS + hash;
    var linkMeta = file.ipfs();
    setMetafile(linkMeta);

    // the meta file has not changed, no need to update
    if (tokenURI == linkMeta) {
      //return; // TODO back in !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
    setTokenURI(linkMeta);

    // Does the NFT exist
    var tokenId = HELPER.TokenIdFromPubkey(pubkey);

    setStatusMessage('metafile saved ' + tokenId);
    setErrorMessage('');

    WEB3.ownerOf(Moralis, tokenId)
      .then((owner) => {
        if (owner.toLowerCase() == pubkey.toLowerCase()) {
          //  update NFT ==============================================
          setStatusMessage('Writing NFT...');
          setErrorMessage('');
          WEB3.setTokenURI(Moralis, pubkey, tokenId, linkMeta)
            .then((rep) => {
              handleSave();

              // Report
              setStatusMessage('NFT updated');
              setErrorMessage('');
            })
            .catch((e) => {
              console.log(e);
              setStatusMessage('');
              setErrorMessage('NFT update failed');
              // TODO inform user of failure
            });
        } else {
          setStatusMessage('');
          setErrorMessage('NFT belongs to a different user');
          return;
        }
      })
      .catch((e) => {
        if (HELPER.kmpSearch('' + e, 'nonexistent') > 0) {
          // NFT does nont exist
          var voucher = {
            tokenId: tokenId,
            minPrice: Moralis.Units.ETH('0.05'),
            uri: linkMeta,
            username: username,
            key: 'KEY_PRIV_DEV0',
            contract: STATIC.CONTRACT_ADDRESS,
          };
          API.SignVoucher(voucher)
            .then((signedVoucher) => {
              // create new NFT =======================================
              WEB3.redeem(
                Moralis,
                user.get('ethAddress'),
                signedVoucher,
                Moralis.Units.ETH('0.05')
              )
                .then((rep) => {
                  // TODO inform user of success
                  // Update Db
                  setCreated(Date.now().toString());
                  setFlags(flags | STATIC.FLA_MINTED);
                  handleSave();
                  setStatusMessage('NFT minted');
                  setErrorMessage('');
                })
                .catch((e) => {
                  console.log(e);
                  // TODO inform user of failure
                  setStatusMessage('');
                  setErrorMessage('NFT minting failed');
                });
            })
            .catch((e) => {
              console.log(e);
              setStatusMessage('');
              setErrorMessage('NFT minting failed, voucher not signed');
            });
        }
      });
  };

  const handleSave = async (e) => {
    // check if email or SMS changed

    var personNew = getPerson();
    var personOld = Global.getMe();
    if (personNew.mobile != personOld.mobile) {
      personNew.flags = (
        parseInt(personNew.old) ^ STATIC.FLA_SMSCONFIRMED
      ).toString();
      setFlags(flags ^ STATIC.FLA_SMSCONFIRMED);
    }
    if (personNew.email != personOld.email) {
      personNew.flags = (
        parseInt(personNew.old) ^ STATIC.FLA_EMAILCONFIRMED
      ).toString();
      setFlags(flags ^ STATIC.FLA_EMAILCONFIRMED);
    }
    Global.updateMePerson(personNew);
  };

  const onImageDrop = (event) => {
    var data = event.target.files[0];
    var file = new Moralis.File(data.name, data);
    file
      .saveIPFS()
      .then(() => {
        var linkMeta = file.ipfs();
        setImg(linkMeta);
        setChangeImage(false);
        setStatusMessage('Image Uploaded');
        setErrorMessage('');
      })
      .catch((e) => {
        setStatusMessage('');
        setErrorMessage('Image upload failed');
      });
  };

  const onAvatarDrop = (event) => {
    var data = event.target.files[0];
    var file = new Moralis.File(data.name, data);
    file
      .saveIPFS()
      .then(() => {
        var linkMeta = file.ipfs();
        setImg(linkMeta);
        setChangeAvatar(false);
        setStatusMessage('Image Uploaded');
        setErrorMessage('');
      })
      .catch((e) => {
        setStatusMessage('');
        setErrorMessage('Image upload failed');
      });
  };

  // not sogned in =======================================================================================
  if (!Global.getAppState().connected) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <center>
          <Container>
            <Heading>Me Editor</Heading>
            <br />
            <Text>
              Please connect your Wallet to sign in.
              <br />
              <br />
              Please use&nbsp;
              <VStack>
                <a href="https://metamaski.io" target="_blank">
                  MetaMask&nbsp;
                  <ExternalLinkIcon
                    fontSize="xs"
                    color="teal.500"
                    style={{ marginBottom: '-1px', marginLeft: '2px' }}
                  />
                </a>
                <br />
                {STATIC.ENABLE_WALLETCONNECT && (
                  <Flex>
                    or&nbsp;
                    <a href="https://walletconnect.com/" target="_blank">
                      Wallet Connect&nbsp;
                      <ExternalLinkIcon
                        fontSize="xs"
                        color="teal.500"
                        style={{ marginBottom: '-1px', marginLeft: '2px' }}
                      />
                    </a>
                  </Flex>
                )}
              </VStack>
            </Text>
          </Container>
        </center>
      </main>
    );
  }

  // Check user exists

  // signed in =======================================================================================
  return (
    <main style={{ padding: '1rem 0' }}>
      <Container>
        <Heading>Edit Profile</Heading>
        <br />
        <HStack>
          <Text fontSize="xs">DID: </Text>
          <Text fontSize="xs">{did.toLocaleLowerCase()}</Text>
        </HStack>
        <HStack>
          <Text fontSize="xs">Public key: </Text>
          <Text fontSize="xs">{pubkey} </Text>
        </HStack>
        <HStack>
          <Text fontSize="xs">Contract: </Text>
          <Text fontSize="xs">{contract} - Avalanche FUJI</Text>
        </HStack>
        <CHAKRALINK href={metafile} isExternal>
          <HStack>
            <Text fontSize="xs">Metafile:</Text>
            <Text fontSize="xs">{metafile}</Text>
            <ExternalLinkIcon fontSize="xs" color="blue.500" />
          </HStack>
        </CHAKRALINK>
        <HStack>
          <HStack>
            <Text fontSize="xs">Token:</Text>
            <Text fontSize="xs">{tokenid}</Text>
          </HStack>
        </HStack>
        <br />
        {STATIC.DISABLE_MINTING && (
          <HStack>
            <Button size="lg" disabled>
              Create NFT
            </Button>
            <Text color="teal">
              Minting will be available 1st of March 2022. Your username is
              reserved.
            </Text>
          </HStack>
        )}
        {!STATIC.DISABLE_MINTING && (
          <HStack>
            {!(flags & STATIC.FLA_MINTED) && (
              <Button size="lg" onClick={saveNFT}>
                Create NFT
              </Button>
            )}
            {flags & STATIC.FLA_MINTED && (
              <Button size="lg" onClick={saveNFT}>
                Update NFT
              </Button>
            )}
            <Text color="teal.500" fontSize="xs">
              Costs: NFT minting: {STATIC.DID_PRICE_AVAX_DISPLAY} AVAX (~$
              {dollar}
              ) <br />
              One time only fee, updating metadata is free.
              <br />+ Gas calculated by your wallet.
            </Text>
          </HStack>
        )}
        <br />
        <HStack>
          <Button size="lg" onClick={handleSave}>
            Save
          </Button>
          <Text color="teal.500" fontSize="xs">
            Saving to youfoundme Db is free, but does not update On-Chain data.
            Mint your NFT to guarantee your username.
          </Text>
        </HStack>
        <HStack>
          <Text color="green.500" fontSize="xs">
            {statusMessage}
          </Text>
        </HStack>
        <HStack>
          <Text color="red.500" fontSize="xs">
            {errorMessage}
          </Text>
        </HStack>
        <br />
        <Heading>{username}</Heading>
        {img.length > 0 && (
          <Image boxSize="140" src={img} objectFit="cover" alt={username} />
        )}
        <HStack>
          {' '}
          <CHAKRALINK color="blue.500" onClick={flip}>
            Upload Image
          </CHAKRALINK>
          <Text color="gray.500" fontSize="sm">
            (recommended 400 x 400)
          </Text>
        </HStack>
        {changeImage && (
          <Input type="file" name="file" onChange={onImageDrop} />
        )}
        <HStack>
          <CHAKRALINK href={img} isExternal>
            <HStack>
              <Text color="blue.500" fontSize="xs">
                {img}
              </Text>
              <ExternalLinkIcon color="blue.500" />
            </HStack>
          </CHAKRALINK>
        </HStack>
        <br />
        <CHAKRALINK color="blue.500" onClick={flip2}>
          Upload 3D Avatar Model (.glb)
        </CHAKRALINK>
        &nbsp;or <br />
        <CHAKRALINK color="blue.500" onClick={() => createAvatar()}>
          Create new Avatar with: Ready Player Me
        </CHAKRALINK>
        {changeAvatar && (
          <Input type="file" name="file" onChange={onAvatarDrop} />
        )}
        {avatar.length > 0 && (
          <HStack>
            <CHAKRALINK href={avatar} isExternal>
              <HStack>
                <Text fontSize="xs">{avatar}</Text>
                <ExternalLinkIcon color="blue.500" />
              </HStack>
            </CHAKRALINK>
          </HStack>
        )}
        <br /> <br />
        <Heading>Professional Section</Heading>
        <Table style={{ paddingLeft: '0px', paddingRight: '0px' }}>
          <Tr>
            <Td width="20px">
              <Text>Job Title: </Text>
            </Td>
            <Td width="100%">
              <Input
                placeholder="Job Title"
                fontSize="1xl"
                value={jobtitle}
                onChange={(e) => setJobtitle(e.target.value)}
              />
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Teaser: </Text>
            </Td>
            <Td>
              <Textarea
                placeholder="Teaser"
                fontSize="1xl"
                value={teaser}
                onChange={(e) => setTeaser(e.target.value)}
              />
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Tags: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Tags"
                fontSize="1xl"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Ref0: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Example: Your Company"
                fontSize="1xl"
                value={ref0}
                onChange={(e) => setRef0(e.target.value)}
              />
              <CHAKRALINK color="blue.500" href={ref0} fontSize="xs" isExternal>
                try
              </CHAKRALINK>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Ref1: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Example: Linkedin"
                fontSize="1xl"
                value={ref1}
                onChange={(e) => setRef1(e.target.value)}
              />
              <CHAKRALINK color="blue.500" href={ref1} fontSize="xs" isExternal>
                try
              </CHAKRALINK>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Ref2: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Example: Github"
                fontSize="1xl"
                value={ref2}
                onChange={(e) => setRef2(e.target.value)}
              />
              <CHAKRALINK color="blue.500" href={ref2} fontSize="xs" isExternal>
                try
              </CHAKRALINK>
            </Td>
          </Tr>

          {/* Location Section */}
          <Tr>
            <Td colSpan="2">
              <Heading>Location Status</Heading>
            </Td>
          </Tr>

          <Tr>
            <Td width="10px">
              <Text>Location: </Text>
            </Td>
            <Td width="100%">
              <Input
                placeholder="Location"
                fontSize="1xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <CHAKRALINK
                color="blue.500"
                href={location}
                fontSize="xs"
                isExternal>
                try
              </CHAKRALINK>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Metaverse: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Metaverse"
                fontSize="1xl"
                value={metaverse}
                onChange={(e) => setMetaverse(e.target.value)}
              />
              <CHAKRALINK
                color="blue.500"
                href={metaverse}
                fontSize="xs"
                isExternal>
                try
              </CHAKRALINK>
            </Td>
          </Tr>
          <Tr>
            <Td colSpan="2">
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_LOCATION) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_LOCATION)
                  }
                />
                <Text>Hide my location</Text>
              </HStack>
            </Td>
          </Tr>

          {/* Contact Section */}
          <Tr>
            <Td colSpan="2">
              <Heading>Contact</Heading>
              <Text fontSize="xs" color="teal.500">
                Contact details are not shown in search results. We will contact
                you by email, if a user likes to connect with you. You decide if
                you like to share your contact details.
              </Text>
            </Td>
          </Tr>

          <Tr>
            <Td width="10px">
              <Text>Email: </Text>
            </Td>
            <Td width="100%">
              <Input
                placeholder="Email"
                fontSize="1xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!(flags & STATIC.FLA_EMAILCONFIRMED) && (
                <CHAKRALINK
                  color="red.500"
                  onClick={sendEmail}
                  fontSize="xs"
                  isExternal>
                  {emailvalidate}
                </CHAKRALINK>
              )}
              <Text fontSize="xs" color="green.500">
                {emailok}
              </Text>
              {showValidateboxEmail && (
                <HStack>
                  <Input
                    placeholder="6 digit code"
                    fontSize="1xl"
                    value={codeEmail}
                    onChange={(e) => setCodeEmail(e.target.value)}
                  />
                  <Button onClick={validateEmail}>validate</Button>
                </HStack>
              )}
              <Text fontSize="xs" color="red.500">
                {emailvalerror}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Mobile: </Text>
            </Td>
            <Td>
              <Input
                placeholder="+  Mobile"
                fontSize="1xl"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              {!(flags & STATIC.FLA_SMSCONFIRMED) && (
                <HStack>
                  <CHAKRALINK
                    color="red.500"
                    onClick={sendSMS}
                    fontSize="xs"
                    isExternal>
                    {mobilevalidate}
                  </CHAKRALINK>
                  <Text fontSize="xs" color="green.500">
                    {mobileok}
                  </Text>
                </HStack>
              )}
              {showValidatebox && (
                <HStack>
                  <Input
                    placeholder="6 digit code"
                    fontSize="1xl"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button onClick={validateMobile}>validate</Button>
                </HStack>
              )}
              <Text fontSize="xs" color="red.500">
                {mobilevalerror}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Name: </Text>
            </Td>
            <Td>
              <Input
                placeholder="First Name"
                fontSize="1xl"
                value={gname}
                onChange={(e) => setGname(e.target.value)}
              />
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text>Surname: </Text>
            </Td>
            <Td>
              <Input
                placeholder="Last Name"
                fontSize="1xl"
                value={sname}
                onChange={(e) => setSname(e.target.value)}
              />
            </Td>
          </Tr>

          <Tr>
            <Td colSpan="2">
              {/* Privacy Flags ===================================================================================*/}
              <Heading>Privacy</Heading>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_FULLTIME) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_FULLTIME)
                  }
                />
                <Text>I am looking for full time employment</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_PARTTIME) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_PARTTIME)
                  }
                />
                <Text>I am looking for part time jobs</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_CONTRACTS) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_CONTRACTS)
                  }
                />
                <Text>I am available for contract work</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_PROJECTS) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_PROJECTS)
                  }
                />
                <Text>I am open to projects and collaborations</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_INVESTOR) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_INVESTOR)
                  }
                />
                <Text>I am an investor or recruiter</Text>
              </HStack>
              <br />
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_SCHOOL) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_SCHOOL)
                  }
                />
                <Text>I am going to school</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_STUDENT) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_STUDENT)
                  }
                />
                <Text>I am a student</Text>
              </HStack>
              <br />

              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_REFERENCES) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_REFERENCES)
                  }
                />
                <Text>Do not show my references</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_CONTACT) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_CONTACT)
                  }
                />
                <Text>Do not request my contact details</Text>
              </HStack>
              <HStack>
                <Checkbox
                  isChecked={(flags & STATIC.FLA_ANONYMOUS) > 0}
                  onChange={(e) =>
                    setCheckbox(e.target.checked, STATIC.FLA_ANONYMOUS)
                  }
                />
                <Text>
                  Do not show my profile at all, i prefer to be anonymous
                </Text>
              </HStack>
              <br />
              <HStack>
                <Button size="lg" onClick={handleSave}>
                  Save
                </Button>
                <Text fontSize="xs"></Text>
              </HStack>
              <br />
              <HStack>
                <Button
                  size="lg"
                  colorScheme="red"
                  onClick={() => setIsOpen(true)}>
                  Delete Account
                </Button>

                <AlertDialog
                  isOpen={isOpen}
                  leastDestructiveRef={cancelRef}
                  onClose={onClose}>
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete my NFT
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        Are you sure? You can't undo this action afterwards.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button size="lg" ref={cancelRef} onClick={onClose}>
                          Cancel
                        </Button>
                        <Button
                          size="lg"
                          colorScheme="red"
                          onClick={onDelete}
                          ml={3}>
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
                <Text color="gray.600" fontSize="xs">
                  This cannot be undone, <br /> NFT will become inaccessible.
                  <br />
                  Use a different wallet account
                  <br /> if you like to re-register.
                </Text>
              </HStack>
            </Td>
          </Tr>
        </Table>
      </Container>
    </main>
  );
}
