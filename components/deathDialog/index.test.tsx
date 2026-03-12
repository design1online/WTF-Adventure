import React from 'react';
import { render, screen } from '@testing-library/react';
import DeathDialog from './index';

describe('DeathDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<DeathDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the death article', () => {
    const { container } = render(<DeathDialog />);
    expect(container.querySelector('#death')).not.toBeNull();
  });

  it('renders the death message', () => {
    render(<DeathDialog />);
    expect(screen.getByText('You have died...')).toBeInTheDocument();
  });

  it('renders the respawn button', () => {
    const { container } = render(<DeathDialog />);
    expect(container.querySelector('#respawn')).not.toBeNull();
  });
});
