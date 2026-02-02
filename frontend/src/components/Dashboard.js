import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuftraege } from '../services/api';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    gesamt: 0,
    erfasst: 0,
    disponiert: 0,
    ausgefuehrt: 0,
    freigegeben: 0,
    verrechnet: 0,
  });
  const [recentAuftraege, setRecentAuftraege] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await getAuftraege();
      const auftraege = response.data?.data || response.data || [];
      
      // Statistiken berechnen
      setStats({
        gesamt: auftraege.length,
        erfasst: auftraege.filter(a => a.status === 'erfasst').length,
        disponiert: auftraege.filter(a => a.status === 'disponiert').length,
        ausgefuehrt: auftraege.filter(a => a.status === 'ausgeführt').length,
        freigegeben: auftraege.filter(a => a.status === 'freigegeben').length,
        verrechnet: auftraege.filter(a => a.status === 'verrechnet').length,
      });
      
      // Letzte 5 Aufträge
      setRecentAuftraege(auftraege.slice(0, 5));
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'erfasst': 'warning',
      'disponiert': 'info',
      'ausgeführt': 'primary',
      'freigegeben': 'success',
      'verrechnet': 'dark'
    };
    return badges[status] || 'secondary';
  };

  const getPrioBadge = (prio) => {
    if (prio === 'notfall') return 'danger';
    if (prio === 'dringend') return 'warning';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Willkommen */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Dashboard
          </h1>
          <p className="text-muted">
            Willkommen zurück, {user.vorname}! Hier ist Ihre Übersicht.
          </p>
        </div>
        {user.rolle === 'ADMIN' && (
          <div className="col-auto">
            <Link to="/auftrag/neu" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Neuer Auftrag
            </Link>
          </div>
        )}
      </div>

      {/* Statistik-Karten */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Aufträge gesamt</h6>
                  <h2 className="mb-0">{stats.gesamt}</h2>
                </div>
                <div className="text-primary" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-clipboard-data"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Erfasst</h6>
                  <h2 className="mb-0">{stats.erfasst}</h2>
                </div>
                <div className="text-warning" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-file-earmark-plus"></i>
                </div>
              </div>
              <Link to="/auftraege?status=erfasst" className="small text-decoration-none">
                Details anzeigen <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Disponiert</h6>
                  <h2 className="mb-0">{stats.disponiert}</h2>
                </div>
                <div className="text-info" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-person-check"></i>
                </div>
              </div>
              <Link to="/auftraege?status=disponiert" className="small text-decoration-none">
                Details anzeigen <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Ausgeführt</h6>
                  <h2 className="mb-0">{stats.ausgefuehrt}</h2>
                </div>
                <div className="text-primary" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-tools"></i>
                </div>
              </div>
              <Link to="/auftraege?status=ausgeführt" className="small text-decoration-none">
                Details anzeigen <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Freigegeben</h6>
                  <h2 className="mb-0">{stats.freigegeben}</h2>
                </div>
                <div className="text-success" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
              <Link to="/auftraege?status=freigegeben" className="small text-decoration-none">
                Details anzeigen <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Verrechnet</h6>
                  <h2 className="mb-0">{stats.verrechnet}</h2>
                </div>
                <div className="text-dark" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-receipt"></i>
                </div>
              </div>
              <Link to="/auftraege?status=verrechnet" className="small text-decoration-none">
                Details anzeigen <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Letzte Aufträge */}
      <div className="card">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Neueste Aufträge
            </h5>
            <Link to="/auftraege" className="btn btn-sm btn-outline-primary">
              Alle anzeigen
            </Link>
          </div>
        </div>
        <div className="card-body p-0">
          {recentAuftraege.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nr.</th>
                    <th>Kunde</th>
                    <th>Beschreibung</th>
                    <th>Priorität</th>
                    <th>Status</th>
                    <th>Erstellt</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuftraege.map(auftrag => (
                    <tr key={auftrag.auftragId}>
                      <td>
                        <strong>{auftrag.auftragsnummer}</strong>
                      </td>
                      <td>{auftrag.kundeName}</td>
                      <td>
                        <small>
                          {auftrag.beschreibung?.length > 50 
                            ? auftrag.beschreibung.substring(0, 50) + '...' 
                            : auftrag.beschreibung}
                        </small>
                      </td>
                      <td>
                        <span className={`badge bg-${getPrioBadge(auftrag.prioritaet)}`}>
                          {auftrag.prioritaet}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(auftrag.status)}`}>
                          {auftrag.status}
                        </span>
                      </td>
                      <td>
                        <small>
                          {new Date(auftrag.erstelltAm).toLocaleDateString('de-CH')}
                        </small>
                      </td>
                      <td>
                        <Link 
                          to={`/auftrag/${auftrag.auftragId}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Noch keine Aufträge vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;