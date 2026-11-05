import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AUTH_STATE_CHANGED_EVENT } from '../services/authEvents';
import { getAccessToken } from '../services/accessTokenStorage';
import authService from '../services/authService';
import './NavBar.css';

export const NavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const navigate = useNavigate();

  useEffect(() => {
    const updateAuthState = () => setIsAuthenticated(Boolean(getAccessToken()));

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, updateAuthState);
    return () =>
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, updateAuthState);
  }, []);

  const handleSignOut = () => {
    authService.logout();
    navigate('/lots', { replace: true });
  };

  return (
    <header className="app-header">
      <NavLink
        className="app-brand"
        to="/lots"
        aria-label="Outbid — lots catalog"
      >
        Outbid
      </NavLink>
      <nav className="app-navigation" aria-label="Main navigation">
        <NavLink
          to="/lots"
          end
          className={({ isActive }) =>
            isActive ? 'app-navigation-link is-active' : 'app-navigation-link'
          }
        >
          Lots
        </NavLink>
        <NavLink
          to="/my-lots"
          className={({ isActive }) =>
            isActive ? 'app-navigation-link is-active' : 'app-navigation-link'
          }
        >
          My lots
        </NavLink>
        <NavLink
          to="/lots/new"
          className={({ isActive }) =>
            isActive ? 'app-navigation-link is-active' : 'app-navigation-link'
          }
        >
          Create a lot
        </NavLink>
        {isAuthenticated ? (
          <>
            <button
              className="app-navigation-button"
              type="button"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/auth/login"
              className={({ isActive }) =>
                isActive
                  ? 'app-navigation-link is-active'
                  : 'app-navigation-link'
              }
            >
              Sign in
            </NavLink>
            <NavLink
              to="/auth/register"
              className={({ isActive }) =>
                isActive
                  ? 'app-navigation-link is-active'
                  : 'app-navigation-link'
              }
            >
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};
