import React from 'react';
import { render } from '@testing-library/react';
import LoadCharacter from './index';

describe('LoadCharacter', () => {
  it('renders without throwing', () => {
    const { container } = render(<LoadCharacter />);
    expect(container).not.toBeNull();
  });

  it('renders the loadCharacter article', () => {
    const { container } = render(<LoadCharacter />);
    expect(container.querySelector('#loadCharacter')).not.toBeNull();
  });

  it('renders the username input', () => {
    const { container } = render(<LoadCharacter />);
    expect(container.querySelector('#loginNameInput')).not.toBeNull();
  });

  it('renders the password input', () => {
    const { container } = render(<LoadCharacter />);
    expect(container.querySelector('#loginPasswordInput')).not.toBeNull();
  });

  it('renders the login button', () => {
    const { container } = render(<LoadCharacter />);
    expect(container.querySelector('#loginButton')).not.toBeNull();
  });
});
