import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the Client class before importing the context
jest.mock('@/client/index', () => {
  return jest.fn().mockImplementation(() => ({
    loadClient: jest.fn(),
    setGame: jest.fn(),
  }));
});

import { useClientContext, ClientContextProvider } from './clientContext';

const TestConsumer = () => {
  const { client, clientReady } = useClientContext();
  return (
    <div>
      <span data-testid="client-ready">{String(clientReady)}</span>
      <span data-testid="client">{client ? 'has-client' : 'no-client'}</span>
    </div>
  );
};

describe('ClientContext', () => {
  it('renders ClientContextProvider without throwing', () => {
    const { container } = render(
      <ClientContextProvider>
        <div>child</div>
      </ClientContextProvider>
    );
    expect(container).not.toBeNull();
  });

  it('provides clientReady and client values', () => {
    render(
      <ClientContextProvider>
        <TestConsumer />
      </ClientContextProvider>
    );
    expect(screen.getByTestId('client-ready')).toBeInTheDocument();
    expect(screen.getByTestId('client')).toBeInTheDocument();
  });

  it('sets clientReady to true after mount', async () => {
    render(
      <ClientContextProvider>
        <TestConsumer />
      </ClientContextProvider>
    );
    // After useEffect runs, clientReady should be true
    expect(screen.getByTestId('client-ready')).toHaveTextContent('true');
  });
});
