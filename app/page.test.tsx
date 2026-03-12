import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@/client/contexts/windowContext', () => ({
  useWindowContext: () => ({
    clientHeight: 768,
    clientWidth: 1024,
    clientOrientation: { type: 'landscape-primary' },
  }),
}));

jest.mock('@/client/contexts/clientContext', () => ({
  useClientContext: () => ({
    client: null,
    clientReady: false,
  }),
}));

jest.mock('./game', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'game-page' }, 'GamePage'),
  };
});

jest.mock('@/component/splash', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'splash-page' }, 'SplashPage'),
  };
});

import HomePage from './page';

describe('HomePage', () => {
  it('renders without throwing', () => {
    const { container } = render(<HomePage />);
    expect(container).not.toBeNull();
  });

  it('renders a main element', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('main')).not.toBeNull();
  });

  it('renders the SplashPage', () => {
    const { getByTestId } = render(<HomePage />);
    expect(getByTestId('splash-page')).toBeInTheDocument();
  });

  it('renders the GamePage', () => {
    const { getByTestId } = render(<HomePage />);
    expect(getByTestId('game-page')).toBeInTheDocument();
  });

  it('renders server side only text when clientReady is false', () => {
    const { getByText } = render(<HomePage />);
    expect(getByText('server side only')).toBeInTheDocument();
  });
});
