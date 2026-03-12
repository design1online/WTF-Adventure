import React from 'react';
import { render } from '@testing-library/react';

// Create simple mock factory helper
const createMock = (testId) => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': testId });
};

jest.mock('@/component/canvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('canvas', { id: props.id }),
  };
});

jest.mock('@/component/chatInput', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'chat-input' }),
}));

jest.mock('@/component/chatBar', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'chat-bar' }),
}));

jest.mock('@/component/worldBar', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'world-bar' }),
}));

jest.mock('@/component/bubbles', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'bubbles' }),
}));

jest.mock('@/component/hud', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'hud' }),
}));

jest.mock('@/component/buttonBar', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'button-bar' }),
}));

jest.mock('@/component/dropDialog', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'drop-dialog' }),
}));

jest.mock('@/component/map', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'map' }),
}));

jest.mock('@/component/profileDialog', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'profile-dialog' }),
}));

jest.mock('@/component/settingsDialog', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'settings-dialog' }),
}));

jest.mock('@/component/inventory', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'inventory' }),
}));

jest.mock('@/component/bank', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'bank' }),
}));

jest.mock('@/component/trade', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'trade' }),
}));

jest.mock('@/component/enchant', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'enchant' }),
}));

jest.mock('@/component/abilitiesBar', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'abilities-bar' }),
}));

jest.mock('@/component/notifications', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'notifications' }),
}));

jest.mock('@/component/playerActions', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'player-actions' }),
}));

jest.mock('@/component/actionsDialog', () => ({
  __esModule: true,
  default: () => require('react').createElement('div', { 'data-testid': 'actions-dialog' }),
}));

import GamePage from './index';

describe('GamePage', () => {
  it('renders without throwing', () => {
    const { container } = render(<GamePage />);
    expect(container).not.toBeNull();
  });

  it('renders the container div', () => {
    const { container } = render(<GamePage />);
    expect(container.querySelector('#container')).not.toBeNull();
  });

  it('renders the border div', () => {
    const { container } = render(<GamePage />);
    expect(container.querySelector('#border')).not.toBeNull();
  });

  it('renders the canvasLayers div', () => {
    const { container } = render(<GamePage />);
    expect(container.querySelector('#canvasLayers')).not.toBeNull();
  });

  it('renders all canvas elements', () => {
    const { container } = render(<GamePage />);
    const canvases = container.querySelectorAll('canvas');
    expect(canvases.length).toBe(5);
  });
});
