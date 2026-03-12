import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the Client and Game classes
jest.mock('@/client/index', () => {
  return jest.fn().mockImplementation(() => ({
    loadClient: jest.fn(),
    setGame: jest.fn(),
  }));
});

jest.mock('../game', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  }));
});

import { useGameContext, GameContextProvider } from './gameContext';
import { ClientContextProvider } from './clientContext';

const TestConsumer = () => {
  const { game, gameReady } = useGameContext();
  return (
    <div>
      <span data-testid="game-ready">{String(gameReady)}</span>
      <span data-testid="game">{game ? 'has-game' : 'no-game'}</span>
    </div>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ClientContextProvider>
    <GameContextProvider>
      {children}
    </GameContextProvider>
  </ClientContextProvider>
);

describe('GameContext', () => {
  it('renders GameContextProvider without throwing', () => {
    const { container } = render(
      <Wrapper>
        <div>child</div>
      </Wrapper>
    );
    expect(container).not.toBeNull();
  });

  it('provides game and gameReady values', () => {
    render(
      <Wrapper>
        <TestConsumer />
      </Wrapper>
    );
    expect(screen.getByTestId('game-ready')).toBeInTheDocument();
    expect(screen.getByTestId('game')).toBeInTheDocument();
  });

  it('sets game when clientReady is true', () => {
    render(
      <Wrapper>
        <TestConsumer />
      </Wrapper>
    );
    // Since ClientContextProvider creates client and sets clientReady=true,
    // GameContextProvider should create a game
    expect(screen.getByTestId('game-ready')).toHaveTextContent('true');
  });
});
