import React from 'react';
import { render } from '@testing-library/react';
import WorldBar from './index';

describe('WorldBar', () => {
  it('renders without throwing', () => {
    const { container } = render(<WorldBar />);
    expect(container).not.toBeNull();
  });

  it('renders the world-bar container', () => {
    const { container } = render(<WorldBar />);
    expect(container.querySelector('#world-bar')).not.toBeNull();
  });

  it('renders the world icon', () => {
    const { container } = render(<WorldBar />);
    const worldImg = container.querySelector('#hud-world');
    expect(worldImg).not.toBeNull();
  });

  it('renders the achievements icon', () => {
    const { container } = render(<WorldBar />);
    const achievementsImg = container.querySelector('#hud-achievements');
    expect(achievementsImg).not.toBeNull();
  });
});
