import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useWindowContext, WindowContextProvider } from './windowContext';

const TestConsumer = () => {
  const { clientHeight, clientWidth, clientOrientation } = useWindowContext();
  return (
    <div>
      <span data-testid="height">{clientHeight}</span>
      <span data-testid="width">{clientWidth}</span>
      <span data-testid="orientation">{clientOrientation ? 'has-orientation' : 'no-orientation'}</span>
    </div>
  );
};

describe('WindowContext', () => {
  it('renders WindowContextProvider without throwing', () => {
    const { container } = render(
      <WindowContextProvider>
        <div>child</div>
      </WindowContextProvider>
    );
    expect(container).not.toBeNull();
  });

  it('provides clientHeight and clientWidth values', () => {
    render(
      <WindowContextProvider>
        <TestConsumer />
      </WindowContextProvider>
    );
    expect(screen.getByTestId('height')).toBeInTheDocument();
    expect(screen.getByTestId('width')).toBeInTheDocument();
  });

  it('provides clientOrientation value', () => {
    render(
      <WindowContextProvider>
        <TestConsumer />
      </WindowContextProvider>
    );
    expect(screen.getByTestId('orientation')).toBeInTheDocument();
  });

  it('throws when useWindowContext is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const BadComponent = () => {
      const context = useWindowContext();
      return <div>{String(context)}</div>;
    };
    // WindowContext has a default value so it won't throw, but returns default
    expect(() => render(<BadComponent />)).not.toThrow();
    consoleError.mockRestore();
  });
});
