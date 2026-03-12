import React from 'react';
import { render } from '@testing-library/react';
import Inventory from './index';

describe('Inventory', () => {
  it('renders without throwing', () => {
    const { container } = render(<Inventory />);
    expect(container).not.toBeNull();
  });

  it('renders the inventory container', () => {
    const { container } = render(<Inventory />);
    expect(container.querySelector('#inventory')).not.toBeNull();
  });

  it('renders a ul element for items', () => {
    const { container } = render(<Inventory />);
    expect(container.querySelector('ul')).not.toBeNull();
  });
});
