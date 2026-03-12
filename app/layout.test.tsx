import React from 'react';
import { render } from '@testing-library/react';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' }),
}));

jest.mock('@/client/config.json', () => ({
  title: 'Test Title',
  description: 'Test Description',
  keywords: 'test,keywords',
  developer: 'Test Developer',
  url: 'http://localhost',
  favicon: '/favicon.png',
  twitter: '@test',
}), { virtual: true });

jest.mock('@/client/contexts/providers', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('div', { 'data-testid': 'providers' }, props.children),
  };
});

import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders without throwing', () => {
    const { container } = render(
      React.createElement(RootLayout, null,
        React.createElement('div', { 'data-testid': 'child' }, 'child content')
      )
    );
    expect(container).not.toBeNull();
  });

  it('renders children', () => {
    const { getByTestId } = render(
      React.createElement(RootLayout, null,
        React.createElement('div', { 'data-testid': 'child' }, 'child content')
      )
    );
    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('wraps children in Providers', () => {
    const { getByTestId } = render(
      React.createElement(RootLayout, null,
        React.createElement('span', null, 'content')
      )
    );
    expect(getByTestId('providers')).toBeInTheDocument();
  });
});
