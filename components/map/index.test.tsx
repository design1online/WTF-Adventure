import React from 'react';
import { render } from '@testing-library/react';
import Map from './index';

describe('Map', () => {
  it('renders without throwing', () => {
    const { container } = render(<Map />);
    expect(container).not.toBeNull();
  });

  it('renders the mapFrame container', () => {
    const { container } = render(<Map />);
    expect(container.querySelector('#mapFrame')).not.toBeNull();
  });

  it('renders map buttons', () => {
    const { container } = render(<Map />);
    expect(container.querySelector('#warp1')).not.toBeNull();
    expect(container.querySelector('#warp2')).not.toBeNull();
  });

  it('renders the close button', () => {
    const { container } = render(<Map />);
    expect(container.querySelector('#closeMapFrame')).not.toBeNull();
  });
});
