import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './index';

describe('Footer', () => {
  it('renders without throwing', () => {
    const { container } = render(<Footer />);
    expect(container).not.toBeNull();
  });

  it('renders a footer element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).not.toBeNull();
  });

  it('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText('Games by Design1Online.com, LLC')).toBeInTheDocument();
  });
});
