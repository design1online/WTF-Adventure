'use client';

import { UserContextProvider } from '@/client/contexts/userContext';
import { ClientContextProvider } from '@/client/contexts/clientContext';
import { GameContextProvider } from '@/client/contexts/gameContext';
import { WindowContextProvider } from '@/client/contexts/windowContext';

const Providers = ({children}:{children:any}) => {

  return (
    <WindowContextProvider>
      <UserContextProvider>
        <ClientContextProvider>
          <GameContextProvider>
            <main>{children}</main>
          </GameContextProvider>
        </ClientContextProvider>
      </UserContextProvider>
    </WindowContextProvider>
  );
}

export default Providers;