import React from 'react';
import { render } from '@testing-library/react';
import ButtonBar from './index';

describe('ButtonBar', () => {
  it('renders without throwing', () => {
    const { container } = render(<ButtonBar />);
    expect(container).not.toBeNull();
  });

  it('renders the buttons container', () => {
    const { container } = render(<ButtonBar />);
    expect(container.querySelector('#buttons')).not.toBeNull();
  });

  it('renders the profile button', () => {
    const { container } = render(<ButtonBar />);
    expect(container.querySelector('#profileButton')).not.toBeNull();
  });

  it('renders the settings button', () => {
    const { container } = render(<ButtonBar />);
    expect(container.querySelector('#settingsButton')).not.toBeNull();
  });
});
