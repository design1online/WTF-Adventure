import React from 'react';
import { render } from '@testing-library/react';
import ChatBar from './index';

describe('ChatBar', () => {
  it('renders without throwing', () => {
    const { container } = render(<ChatBar />);
    expect(container).not.toBeNull();
  });

  it('renders the chat-bar container', () => {
    const { container } = render(<ChatBar />);
    expect(container.querySelector('#chat-bar')).not.toBeNull();
  });

  it('renders the chat icon', () => {
    const { container } = render(<ChatBar />);
    const chatImg = container.querySelector('#hud-chat');
    expect(chatImg).not.toBeNull();
  });

  it('renders the inventory icon', () => {
    const { container } = render(<ChatBar />);
    const inventoryImg = container.querySelector('#hud-inventory');
    expect(inventoryImg).not.toBeNull();
  });
});
