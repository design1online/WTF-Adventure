import React from 'react';
import { render } from '@testing-library/react';
import ProfileDialog from './index';

describe('ProfileDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<ProfileDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the profileDialog container', () => {
    const { container } = render(<ProfileDialog />);
    expect(container.querySelector('#profileDialog')).not.toBeNull();
  });

  it('renders the state page', () => {
    const { container } = render(<ProfileDialog />);
    expect(container.querySelector('#statePage')).not.toBeNull();
  });

  it('renders the profile name', () => {
    const { container } = render(<ProfileDialog />);
    expect(container.querySelector('#profileName')).not.toBeNull();
  });

  it('renders the navigator', () => {
    const { container } = render(<ProfileDialog />);
    expect(container.querySelector('#navigator')).not.toBeNull();
  });
});
