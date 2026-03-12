import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/client/index', () => {
  return jest.fn().mockImplementation(() => ({
    loadClient: jest.fn(),
    setGame: jest.fn(),
  }));
});

jest.mock('../../game', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  }));
});

// Mock fetch for UserContextProvider
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [{ name: { first: 'John' } }] }),
  })
) as jest.Mock;

import Providers from './index';

describe('Providers', () => {
  it('renders without throwing', () => {
    const { container } = render(
      <Providers>
        <div data-testid="child">child content</div>
      </Providers>
    );
    expect(container).not.toBeNull();
  });

  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">child content</div>
      </Providers>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('wraps children in a main element', () => {
    const { container } = render(
      <Providers>
        <span>content</span>
      </Providers>
    );
    expect(container.querySelector('main')).not.toBeNull();
  });
});
