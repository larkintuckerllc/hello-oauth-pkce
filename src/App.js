import React, { useCallback, useEffect, useState } from 'react';
import {
  exchangeCodeforTokens,
  getAuthenticated,
  loadAuthorizationURL,
  logout,
} from './api/auth';

const params = (new URL(document.location)).searchParams;
const code = params.get('code'); 
const initialAuthenticated = getAuthenticated();

export default function App() {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [authenticating, setAuthenticating] = useState(code !== null);
  useEffect(() => {
    const execute = async () => {
      window.history.replaceState({}, document.title, '/');
      try {
        await exchangeCodeforTokens(code);
        setAuthenticated(true);
      } catch (err) {
        // DO NOTHING
      }
      setAuthenticating(false);
    };
    if (!initialAuthenticated && code !== null) {
      execute();
    }
  }, []);
  const handleLoginClick = useCallback(() => {
    loadAuthorizationURL();
  }, []);
  const handleLogoutClick = useCallback(() => {
    logout();
  }, []);

  if (authenticating) {
    return <div>authenticating...</div>;
  }
  if (!authenticated) {
    return <button onClick={handleLoginClick}>Login</button>;
  }
  return (
    <>
      <div>
        <button onClick={handleLogoutClick}>Logout</button>
      </div>
    </>
  );
}
