import React from 'react';
import { render } from '@testing-library/react';
import SplashPage from './index';

describe('SplashPage', () => {
  it('renders without throwing', () => {
    const { container } = render(<SplashPage />);
    expect(container).not.toBeNull();
  });

  it('renders the modal container', () => {
    const { container } = render(<SplashPage />);
    expect(container.querySelector('#modal')).not.toBeNull();
  });

  it('renders the wrapper section', () => {
    const { container } = render(<SplashPage />);
    expect(container.querySelector('#wrapper')).not.toBeNull();
  });

  it('renders the content section', () => {
    const { container } = render(<SplashPage />);
    expect(container.querySelector('#content')).not.toBeNull();
  });
});
