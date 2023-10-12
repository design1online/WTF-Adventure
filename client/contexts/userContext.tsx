import React, { useState, createContext, useContext, useCallback, useEffect, useMemo } from 'react';

// create context
const UserContext = createContext({});

// context consumer hook
const useUserContext = () => {
    // get the context
    const context = useContext(UserContext);
  
    // if `undefined`, throw an error
    if (context === undefined) {
      throw new Error("useUserContext was used outside of its Provider");
    }
  
    return context;
};

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    // the value that will be given to the context
    const [user, setUser] = useState(null);
  
    // sign out the user, memoized
    const signout = useCallback(() => {
      setUser(null);
    }, []);
  
    // fetch a user from a fake backend API
    useEffect(() => {
      const fetchUser = () => {
        // this would usually be your own backend, or localStorage
        // for example
        fetch("https://randomuser.me/api/")
          .then((response) => response.json())
          .then((result) => setUser(result.results[0]))
          .catch((error) => console.log("An error occured"));
      };
  
      fetchUser();
    }, []);
  
    // memoize the full context value
    const contextValue = useMemo(() => ({
      user,
      signout
    }), [user, signout])
  
    return (
      // the Provider gives access to the context to its children
      <UserContext.Provider value={contextValue}>
        {children}
      </UserContext.Provider>
    );
};

export { useUserContext, UserContextProvider };