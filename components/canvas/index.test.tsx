import React from 'react';
import { render } from '@testing-library/react';
import Canvas from './index';

describe('Canvas', () => {
  it('renders without throwing', () => {
    const { container } = render(<Canvas id="test-canvas" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with the provided id', () => {
    const { container } = render(<Canvas id="my-canvas" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('id', 'my-canvas');
  });

  it('renders a canvas element', () => {
    const { container } = render(<Canvas id="test" />);
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom width prop', () => {
    const { container } = render(<Canvas id="test" width="200px" height="300px" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });
});
