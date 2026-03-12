import React from 'react';
import { render } from '@testing-library/react';
import AbilitiesBar from './index';

describe('AbilitiesBar', () => {
  it('renders without throwing', () => {
    const { container } = render(<AbilitiesBar />);
    expect(container).not.toBeNull();
  });

  it('renders the abilityShortcut container', () => {
    const { container } = render(<AbilitiesBar />);
    expect(container.querySelector('#abilityShortcut')).not.toBeNull();
  });

  it('renders all 5 skill slots', () => {
    const { container } = render(<AbilitiesBar />);
    expect(container.querySelector('#skillSlot1')).not.toBeNull();
    expect(container.querySelector('#skillSlot5')).not.toBeNull();
  });
});
