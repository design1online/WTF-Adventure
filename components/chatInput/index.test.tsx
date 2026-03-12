import React from 'react';
import { render } from '@testing-library/react';
import ChatInput from './index';

describe('ChatInput', () => {
  it('renders without throwing', () => {
    const { container } = render(<ChatInput />);
    expect(container).not.toBeNull();
  });

  it('renders the chat container', () => {
    const { container } = render(<ChatInput />);
    expect(container.querySelector('#chat')).not.toBeNull();
  });

  it('renders the chat input', () => {
    const { container } = render(<ChatInput />);
    expect(container.querySelector('#hud-chat-input')).not.toBeNull();
  });

  it('renders the chat log', () => {
    const { container } = render(<ChatInput />);
    expect(container.querySelector('#chatLog')).not.toBeNull();
  });
});
