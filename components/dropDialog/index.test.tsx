import React from 'react';
import { render, screen } from '@testing-library/react';
import DropDialog from './index';

describe('DropDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<DropDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the dropDialog container', () => {
    const { container } = render(<DropDialog />);
    expect(container.querySelector('#dropDialog')).not.toBeNull();
  });

  it('renders the drop count input', () => {
    const { container } = render(<DropDialog />);
    expect(container.querySelector('#dropCount')).not.toBeNull();
  });

  it('renders the accept button', () => {
    const { container } = render(<DropDialog />);
    expect(container.querySelector('#dropAccept')).not.toBeNull();
  });

  it('renders the cancel button', () => {
    const { container } = render(<DropDialog />);
    expect(container.querySelector('#dropCancel')).not.toBeNull();
  });
});
