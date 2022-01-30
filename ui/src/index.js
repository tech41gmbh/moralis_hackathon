/** @format */

import React from 'react';
import App from './App';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MoralisProvider } from 'react-moralis';
import { render, ReactDOM } from 'react-dom';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Show from './routes/show';
import Editor from './routes/editor';
import Search from './routes/search';
import Home from './routes/home';
import Register from './routes/register';
import Avatar from './routes/avatar';
import Connect from './routes/connect';
import Message from './routes/message';
import Auth from './routes/auth';
import Sign from './routes/sign';
import * as GLOBAL from './model/global';
import * as STATIC from './model/static';
import '@fontsource/noto-sans/700.css';

const theme = extendTheme({
  fonts: {
    heading: 'Noto Sans',
    body: 'Noto Sans',
  },
  config: {
    initialColorMode: 'dark',
  },
});

const rootElement = document.getElementById('root');

// ==================================================================================
render(
  <ChakraProvider theme={theme}>
    <HashRouter basename={''}>
      <MoralisProvider
        appId={STATIC.MORALIS_APPID}
        serverUrl={STATIC.MORALIS_SERVER}>
        <Routes>
          <Route path="/" element={<App />} key={GLOBAL.getAppState().routeky}>
            <Route
              path="home"
              element={<Home />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              index
              element={<Home />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="show/:did"
              element={<Show />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="editor"
              element={<Editor />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="search"
              element={<Search />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="register"
              element={<Register />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="avatar"
              element={<Avatar />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="connect/:did"
              element={<Connect />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="message/:msg"
              element={<Message />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="auth"
              element={<Auth />}
              key={GLOBAL.getAppState().routeky}
            />
            <Route
              path="sign"
              element={<Sign />}
              key={GLOBAL.getAppState().routeky}
            />
          </Route>
        </Routes>
      </MoralisProvider>
    </HashRouter>
  </ChakraProvider>,
  rootElement
);
