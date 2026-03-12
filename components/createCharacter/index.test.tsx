import React from 'react';
import { render } from '@testing-library/react';
import CreateCharacter from './index';

describe('CreateCharacter', () => {
  it('renders without throwing', () => {
    const { container } = render(<CreateCharacter />);
    expect(container).not.toBeNull();
  });

  it('renders the createCharacter article', () => {
    const { container } = render(<CreateCharacter />);
    expect(container.querySelector('#createCharacter')).not.toBeNull();
  });

  it('renders a heading', () => {
    const { container } = render(<CreateCharacter />);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('renders the username input', () => {
    const { container } = render(<CreateCharacter />);
    expect(container.querySelector('#registerNameInput')).not.toBeNull();
  });

  it('renders the password input', () => {
    const { container } = render(<CreateCharacter />);
    expect(container.querySelector('#registerPasswordInput')).not.toBeNull();
  });

  it('renders the play button', () => {
    const { container } = render(<CreateCharacter />);
    expect(container.querySelector('#play')).not.toBeNull();
  });
});
