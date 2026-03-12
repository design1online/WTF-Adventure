import React from 'react';
import { render } from '@testing-library/react';
import Notifications from './index';

describe('Notifications', () => {
  it('renders without throwing', () => {
    const { container } = render(<Notifications />);
    expect(container).not.toBeNull();
  });

  it('renders the notifications container', () => {
    const { container } = render(<Notifications />);
    expect(container.querySelector('#notifications')).not.toBeNull();
  });

  it('renders the notify div', () => {
    const { container } = render(<Notifications />);
    expect(container.querySelector('#notify')).not.toBeNull();
  });

  it('renders the confirm div', () => {
    const { container } = render(<Notifications />);
    expect(container.querySelector('#confirm')).not.toBeNull();
  });
});
