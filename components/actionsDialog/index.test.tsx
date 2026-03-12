import React from 'react';
import { render, screen } from '@testing-library/react';
import ActionsDialog from './index';

describe('ActionsDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<ActionsDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the actionContainer', () => {
    const { container } = render(<ActionsDialog />);
    expect(container.querySelector('#actionContainer')).not.toBeNull();
  });

  it('renders the drop button', () => {
    const { container } = render(<ActionsDialog />);
    expect(container.querySelector('#drop')).not.toBeNull();
  });

  it('renders the Drop text', () => {
    render(<ActionsDialog />);
    expect(screen.getByText('Drop')).toBeInTheDocument();
  });
});
