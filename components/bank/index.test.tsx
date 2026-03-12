import React from 'react';
import { render } from '@testing-library/react';
import Bank from './index';

describe('Bank', () => {
  it('renders without throwing', () => {
    const { container } = render(<Bank />);
    expect(container).not.toBeNull();
  });

  it('renders the bank container', () => {
    const { container } = render(<Bank />);
    expect(container.querySelector('#bank')).not.toBeNull();
  });

  it('renders the close bank button', () => {
    const { container } = render(<Bank />);
    expect(container.querySelector('#closeBank')).not.toBeNull();
  });

  it('renders the bank slots', () => {
    const { container } = render(<Bank />);
    expect(container.querySelector('#bankSlots')).not.toBeNull();
  });
});
