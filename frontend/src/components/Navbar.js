import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Task Manager
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Tasks
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/add" className="nav-link">
              Add Task
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;