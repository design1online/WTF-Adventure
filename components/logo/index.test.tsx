import React from 'react';
import { render } from '@testing-library/react';
import Logo from './index';

describe('Logo', () => {
  it('renders without throwing', () => {
    const { container } = render(<Logo />);
    expect(container).not.toBeNull();
  });

  it('renders a header element', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('renders the logo image with correct alt text', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('alt', 'WTF Adventure');
  });

  it('renders the logo image with correct id', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('id', 'logo');
  });
});
