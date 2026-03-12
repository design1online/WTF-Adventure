import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from './index';

describe('Loader', () => {
  it('renders without throwing when show is true', () => {
    const { container } = render(<Loader show={true} />);
    expect(container).not.toBeNull();
  });

  it('renders the loader div when show is true', () => {
    const { container } = render(<Loader show={true} />);
    expect(container.querySelector('.loader')).not.toBeNull();
  });

  it('renders the loading message when show is true', () => {
    render(<Loader show={true} />);
    expect(screen.getByText("WTF?! is happening...")).toBeInTheDocument();
  });

  it('renders the loading image when show is true', () => {
    const { container } = render(<Loader show={true} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('alt', 'Loading');
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<Loader show={false} />);
    expect(container.querySelector('.loader')).toBeNull();
  });
});
