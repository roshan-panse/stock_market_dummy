import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MarketStatus from "../MarketStatus/MarketStatus.jsx";

export default function Navbar() {
  const { user, signOut, openAuth } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // profile dropdown
  const ref = useRef(null);

  // Close the dropdown when clicking elsewhere or pressing Esc
  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Paperfolio</Link>

        {user && (
          <nav className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/portfolio">Portfolio</NavLink>
            <NavLink to="/stocks">Stocks</NavLink>
          </nav>
        )}

        <div className="nav-right">
          <MarketStatus />
          {user ? (
            <div className="profile" ref={ref}>
              <button
                className="avatar"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                title="Profile"
              >
                {user.username[0].toUpperCase()}
              </button>
              {menuOpen && (
                <div className="dropdown" role="menu">
                  <div className="dropdown-user">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button role="menuitem" className="dropdown-item" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => openAuth("login")}>Log in</button>
              <button className="btn btn-primary" onClick={() => openAuth("signup")}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}