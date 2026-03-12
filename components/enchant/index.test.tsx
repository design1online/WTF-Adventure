import React from 'react';
import { render } from '@testing-library/react';
import Enchant from './index';

describe('Enchant', () => {
  it('renders without throwing', () => {
    const { container } = render(<Enchant />);
    expect(container).not.toBeNull();
  });

  it('renders the enchant container', () => {
    const { container } = render(<Enchant />);
    expect(container.querySelector('#enchant')).not.toBeNull();
  });

  it('renders the close enchant button', () => {
    const { container } = render(<Enchant />);
    expect(container.querySelector('#closeEnchant')).not.toBeNull();
  });

  it('renders the confirm enchant button', () => {
    const { container } = render(<Enchant />);
    expect(container.querySelector('#confirmEnchant')).not.toBeNull();
  });
});
