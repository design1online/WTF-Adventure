import React from 'react';
import { render } from '@testing-library/react';
import Trade from './index';

describe('Trade', () => {
  it('renders without throwing', () => {
    const { container } = render(<Trade />);
    expect(container).not.toBeNull();
  });

  it('renders the trade container', () => {
    const { container } = render(<Trade />);
    expect(container.querySelector('#trade')).not.toBeNull();
  });

  it('renders the close trade button', () => {
    const { container } = render(<Trade />);
    expect(container.querySelector('#closeTrade')).not.toBeNull();
  });
});
