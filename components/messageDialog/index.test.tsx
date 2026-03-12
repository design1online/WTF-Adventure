import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageDialog from './index';

describe('MessageDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<MessageDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the message article', () => {
    const { container } = render(<MessageDialog />);
    expect(container.querySelector('#message')).not.toBeNull();
  });

  it('renders the title text', () => {
    render(<MessageDialog />);
    expect(screen.getByText('Am I Dreaming?')).toBeInTheDocument();
  });

  it('renders the yes and no buttons', () => {
    const { container } = render(<MessageDialog />);
    expect(container.querySelector('#yes')).not.toBeNull();
    expect(container.querySelector('#no')).not.toBeNull();
  });
});
