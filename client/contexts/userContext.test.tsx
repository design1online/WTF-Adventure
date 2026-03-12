import React from 'react';
import { render, screen } from '@testing-library/react';
import { useUserContext, UserContextProvider } from './userContext';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [{ name: { first: 'John', last: 'Doe' } }] }),
  })
) as jest.Mock;

const TestConsumer = () => {
  const context = useUserContext() as any;
  return (
    <div>
      <span data-testid="user">{context.user ? 'has-user' : 'no-user'}</span>
      <span data-testid="signout">{typeof context.signout === 'function' ? 'has-signout' : 'no-signout'}</span>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders UserContextProvider without throwing', () => {
    const { container } = render(
      <UserContextProvider>
        <div>child</div>
      </UserContextProvider>
    );
    expect(container).not.toBeNull();
  });

  it('provides user and signout values', () => {
    render(
      <UserContextProvider>
        <TestConsumer />
      </UserContextProvider>
    );
    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('signout')).toHaveTextContent('has-signout');
  });

  it('starts with null user', () => {
    render(
      <UserContextProvider>
        <TestConsumer />
      </UserContextProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });
});
