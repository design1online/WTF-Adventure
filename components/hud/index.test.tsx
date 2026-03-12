import React from 'react';
import { render } from '@testing-library/react';
import Hud from './index';

describe('Hud', () => {
  it('renders without throwing', () => {
    const { container } = render(<Hud />);
    expect(container).not.toBeNull();
  });

  it('renders the hud container', () => {
    const { container } = render(<Hud />);
    expect(container.querySelector('#hud')).not.toBeNull();
  });

  it('renders the hud bar', () => {
    const { container } = render(<Hud />);
    expect(container.querySelector('#hud-bar')).not.toBeNull();
  });

  it('renders attackInfo', () => {
    const { container } = render(<Hud />);
    expect(container.querySelector('#attackInfo')).not.toBeNull();
  });
});
