import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getRolleText = (rolle) => {
    if (rolle === 'ADMIN') return 'Administrator';
    if (rolle === 'BL') return 'Bereichsleiter';
    if (rolle === 'MA') return 'Mitarbeiter';
    return rolle;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-wrench-adjustable-circle me-2"></i>
          Serviceaufträge
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/auftraege')}`} to="/auftraege">
                <i className="bi bi-list-ul me-1"></i>
                Aufträge
              </Link>
            </li>
            {user.rolle === 'ADMIN' && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/auftrag/neu')}`} to="/auftrag/neu">
                  <i className="bi bi-plus-circle me-1"></i>
                  Neuer Auftrag
                </Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle me-1"></i>
              <strong>
                {user.vorname && user.nachname 
                  ? `${user.vorname} ${user.nachname}`
                  : user.benutzername || 'Benutzer'}
              </strong>
              <small className="ms-2 opacity-75">({getRolleText(user.rolle || '')})</small>
            </span>
            <button 
              onClick={onLogout} 
              className="btn btn-outline-light btn-sm"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;