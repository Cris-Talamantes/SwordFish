import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to={currentUser ? "/dashboard" : "/"}>
        Misma Luna
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        {currentUser ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/match-requests">Matches</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button className="link-button" type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Log in</NavLink>
            <NavLink className="primary-link" to="/signup">
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
