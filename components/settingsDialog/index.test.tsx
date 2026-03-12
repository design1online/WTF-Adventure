import React from 'react';
import { render } from '@testing-library/react';
import SettingsDialog from './index';

describe('SettingsDialog', () => {
  it('renders without throwing', () => {
    const { container } = render(<SettingsDialog />);
    expect(container).not.toBeNull();
  });

  it('renders the settingsPage container', () => {
    const { container } = render(<SettingsDialog />);
    expect(container.querySelector('#settingsPage')).not.toBeNull();
  });

  it('renders the volume slider', () => {
    const { container } = render(<SettingsDialog />);
    expect(container.querySelector('#volume')).not.toBeNull();
  });

  it('renders the sliders container', () => {
    const { container } = render(<SettingsDialog />);
    expect(container.querySelector('#sliders')).not.toBeNull();
  });
});
