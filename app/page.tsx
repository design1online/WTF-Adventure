'use client';

import React from 'react';
import GamePage from './game';
import SplashPage from '@/component/splash';
import { useWindowContext } from '@/client/contexts/windowContext';
import { useClientContext } from '@/client/contexts/clientContext';

const HomePage = () => {

  const { clientReady } = useClientContext();
  const { clientHeight, clientWidth, clientOrientation } = useWindowContext();

  return (
    <main>
      { clientReady
        ? <div>{clientHeight} {clientWidth} {clientOrientation?.type}</div>
        : 'server side only'
      }
      <SplashPage />
      <GamePage />
    </main>
  )
}

export default HomePage;