'use client';

import jQuery from 'jquery';
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

type WindowContextProps = {
  clientHeight: number;
  clientWidth: number;
  clientOrientation: ScreenOrientation|null;
};

const defaultProps = {
  clientHeight: 0,
  clientWidth: 0,
  clientOrientation: null
};

const WindowContext = createContext<WindowContextProps>(defaultProps);

const WindowContextProvider = ({ children }: { children: React.ReactNode }) => {

  const getVh = useCallback(() => {
    return Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
  }, []);

  const getVw = useCallback(() => {
    return Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
  }, []);

  const getOrientation = useCallback(() => {
    return typeof window !== "undefined" ? window.screen.orientation : null;
  }, []);

  const [clientHeight, setVh] = useState<number>(0);
  const [clientWidth, setVw] = useState<number>(0);
  const [clientOrientation, setOrientation] = useState<ScreenOrientation|null>(getOrientation())

  useEffect(() => {
    if (clientHeight === 0 && clientWidth === 0) {
      setVh(getVh());
      setVw(getVw());
      window.$ = window.jQuery = jQuery;
    }

    const handleResize = () => {
      setVh(getVh());
      setVw(getVw());
      setOrientation(getOrientation());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('transitionend', handleResize);
    window.addEventListener('webkitTransitionEnd', handleResize);
    window.addEventListener('oTransitionEnd', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('transitionend', handleResize);
      window.removeEventListener('webkitTransitionEnd', handleResize);
      window.removeEventListener('oTransitionEnd', handleResize);
    };

  }, []);

  return (
    <WindowContext.Provider value={{ clientHeight, clientWidth, clientOrientation }}>
      {children}
    </WindowContext.Provider>
  );
};

// context consumer hook
const useWindowContext = () => {
  // get the context
  const context = useContext(WindowContext);

  // if `undefined`, throw an error
  if (context === undefined) {
    throw new Error("useWindowContext was used outside of its Provider");
  }

  return context;
};

export { useWindowContext, WindowContextProvider };