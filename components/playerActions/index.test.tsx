import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayerActions from './index';

describe('PlayerActions', () => {
  it('renders without throwing', () => {
    const { container } = render(<PlayerActions />);
    expect(container).not.toBeNull();
  });

  it('renders the pActions container', () => {
    const { container } = render(<PlayerActions />);
    expect(container.querySelector('#pActions')).not.toBeNull();
  });

  it('renders the follow button', () => {
    const { container } = render(<PlayerActions />);
    expect(container.querySelector('#follow')).not.toBeNull();
  });

  it('renders the trade action button', () => {
    const { container } = render(<PlayerActions />);
    expect(container.querySelector('#tradeAction')).not.toBeNull();
  });
});
