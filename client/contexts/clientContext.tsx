import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import Client from '@/client/index';

export type ClientType = Client | null;
export type ClientContextProps = {
  client: ClientType;
  clientReady: Boolean;
}

const ClientContext = createContext<ClientContextProps>({ client: null, clientReady: false });

const useClientContext = () => {
  const context = useContext(ClientContext);

  if (context === undefined) {
    throw new Error("useClientContext was used outside of its Provider");
  }

  return context;
};

const ClientContextProvider = ({ children }: { children: React.ReactNode }) => {

  const createClient = useCallback(() => {
    return new Client();
  }, []);

  // the value that will be given to the context
  const [client, setClient] = useState<ClientType>(null);
  const [clientReady, setClientReady] = useState<Boolean>(false);

  // fetch a user from a fake backend API
  useEffect(() => {
      const newClient = createClient();
      setClient(newClient);
      setClientReady(true);
      newClient.loadClient();
  }, []);

  return (
    // the Provider gives access to the context to its children
    <ClientContext.Provider value={{ client, clientReady }}>
      {children}
    </ClientContext.Provider>
  );
};



export { useClientContext, ClientContextProvider };