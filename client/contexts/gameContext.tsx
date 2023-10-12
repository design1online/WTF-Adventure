import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useClientContext, ClientContextProps } from './clientContext';
import Game from '../game';

export type GameType = Game | null;
export type GameContextProps = {
  game: GameType;
  gameReady: Boolean;
}

const GameContext = createContext<GameContextProps>({ game: null, gameReady: false });

const useGameContext = () => {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error("useGameContext was used outside of its Provider");
  }

  return context;
};

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {

  const { client, clientReady }:ClientContextProps = useClientContext();

  // the value that will be given to the context
  const [game, setGame] = useState<GameType>(null);
  const [gameReady, setGameReady] = useState<Boolean>(false);

  // fetch a user from a fake backend API
  useEffect(() => {
      if (clientReady && client) {
        const newGame = new Game(client);
        client.setGame(newGame);
        setGame(newGame);
        setGameReady(true);
      }
      
  }, [clientReady]);

  return (
    // the Provider gives access to the context to its children
    <GameContext.Provider value={{ game, gameReady }}>
      {children}
    </GameContext.Provider>
  );
};

export { useGameContext, GameContextProvider };