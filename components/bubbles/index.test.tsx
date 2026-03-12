import React from 'react';
import { render } from '@testing-library/react';
import Bubbles from './index';

describe('Bubbles', () => {
  it('renders without throwing', () => {
    const { container } = render(<Bubbles />);
    expect(container).not.toBeNull();
  });

  it('renders the bubbles container', () => {
    const { container } = render(<Bubbles />);
    expect(container.querySelector('#bubbles')).not.toBeNull();
  });
});
