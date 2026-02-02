import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getAuftraege } from '../services/api';

function AuftragListe({ user }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [auftraege, setAuftraege] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({});
  
  const filterStatus = searchParams.get('status') || 'alle';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    loadAuftraege();
    
    // Success Message von Navigation
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [filterStatus, searchTerm, location]);

  const loadAuftraege = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getAuftraege();
      console.log('API Response:', response.data);
      
      let data = response.data?.data || response.data || [];
      
      // Statistiken
      const newStats = {
        alle: data.length,
        erfasst: data.filter(a => a.status === 'erfasst').length,
        disponiert: data.filter(a => a.status === 'disponiert').length,
        ausgeführt: data.filter(a => a.status === 'ausgeführt').length,
        freigegeben: data.filter(a => a.status === 'freigegeben').length,
        verrechnet: data.filter(a => a.status === 'verrechnet').length,
      };
      setStats(newStats);
      
      // Filter nach Status
      if (filterStatus !== 'alle') {
        data = data.filter(a => a.status === filterStatus);
      }
      
      // Suche
      if (searchTerm) {
        data = data.filter(a => 
          a.auftragsnummer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.kundeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setAuftraege(data);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError('Fehler beim Laden der Aufträge');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    const params = { status };
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    const params = { status: filterStatus };
    if (search) params.search = search;
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams({ status: filterStatus });
  };

  const getPrioBadge = (prio) => {
    if (prio === 'notfall') return 'danger';
    if (prio === 'dringend') return 'warning text-dark';
    return 'secondary';
  };

  const getStatusBadge = (status) => {
    if (status === 'erfasst') return 'warning text-dark';
    if (status === 'disponiert') return 'info';
    if (status === 'ausgeführt') return 'primary';
    if (status === 'freigegeben') return 'success';
    if (status === 'verrechnet') return 'dark';
    return 'secondary';
  };

  return (
    <div className="container-fluid mt-4">
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3">
            <i className="bi bi-list-ul me-2 text-primary"></i>
            Aufträge verwalten
          </h1>
          <p className="text-muted">
            {user.rolle === 'MA' 
              ? 'Ihre zugewiesenen Aufträge' 
              : 'Alle Serviceaufträge im Überblick'}
          </p>
        </div>
        {user.rolle === 'ADMIN' && (
          <div className="col-auto">
            <Link to="/auftrag/neu" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>Neuer Auftrag
            </Link>
          </div>
        )}
      </div>

      {/* Filter Card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-12">
              <label className="form-label fw-bold">
                <i className="bi bi-funnel me-1"></i>Nach Status filtern:
              </label>
              <div className="d-flex flex-wrap gap-2">
                <button 
                  onClick={() => handleStatusFilter('alle')}
                  className={`badge ${filterStatus === 'alle' ? 'bg-primary' : 'bg-secondary'} p-2 border-0`}
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Alle <span className="badge bg-light text-dark ms-1">{stats.alle || 0}</span>
                </button>
                <button 
                  onClick={() => handleStatusFilter('erfasst')}
                  className="badge bg-warning text-dark p-2 border-0"
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Erfasst <span className="badge bg-light text-dark ms-1">{stats.erfasst || 0}</span>
                </button>
                <button 
                  onClick={() => handleStatusFilter('disponiert')}
                  className="badge bg-info p-2 border-0"
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Disponiert <span className="badge bg-light text-dark ms-1">{stats.disponiert || 0}</span>
                </button>
                <button 
                  onClick={() => handleStatusFilter('ausgeführt')}
                  className="badge bg-primary p-2 border-0"
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Ausgeführt <span className="badge bg-light text-dark ms-1">{stats.ausgeführt || 0}</span>
                </button>
                <button 
                  onClick={() => handleStatusFilter('freigegeben')}
                  className="badge bg-success p-2 border-0"
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Freigegeben <span className="badge bg-light text-dark ms-1">{stats.freigegeben || 0}</span>
                </button>
                <button 
                  onClick={() => handleStatusFilter('verrechnet')}
                  className="badge bg-dark p-2 border-0"
                  style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Verrechnet <span className="badge bg-light text-dark ms-1">{stats.verrechnet || 0}</span>
                </button>
              </div>
            </div>

            {/* Suche */}
            <div className="col-md-6">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    name="search"
                    placeholder="Suche nach Auftragsnummer, Kunde..." 
                    defaultValue={searchTerm}
                  />
                  <button className="btn btn-outline-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={clearSearch}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Anzahl */}
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-muted">
                <i className="bi bi-list-ol me-1"></i>
                <strong>{auftraege.length}</strong> {auftraege.length === 1 ? 'Auftrag' : 'Aufträge'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : auftraege.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nr.</th>
                    <th>Kunde</th>
                    <th>Adresse</th>
                    <th>Beschreibung</th>
                    <th>Priorität</th>
                    <th>Status</th>
                    {user.rolle !== 'MA' && <th>Zugewiesen</th>}
                    <th>Datum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {auftraege.map(auftrag => (
                    <tr key={auftrag.auftragId}>
                      <td>
                        <strong>{auftrag.auftragsnummer}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(auftrag.erstelltAm).toLocaleDateString('de-CH')}
                        </small>
                      </td>
                      <td>
                        <strong>{auftrag.kundeName}</strong>
                        <br />
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1"></i>
                          {auftrag.kundeTelefon}
                        </small>
                      </td>
                      <td>
                        <small>
                          {auftrag.kundeStrasse}<br />
                          {auftrag.kundePlz} {auftrag.kundeOrt}
                        </small>
                      </td>
                      <td>
                        <small>
                          {auftrag.beschreibung?.length > 50 
                            ? auftrag.beschreibung.substring(0, 50) + '...' 
                            : auftrag.beschreibung}
                        </small>
                      </td>
                      <td>
                        <span className={`badge bg-${getPrioBadge(auftrag.prioritaet)}`}>
                          {auftrag.prioritaet === 'notfall' && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                          {auftrag.prioritaet}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(auftrag.status)}`}>
                          {auftrag.status}
                        </span>
                      </td>
                      {user.rolle !== 'MA' && (
                        <td>
                          <small>
                            {auftrag.mitarbeiterName ? (
                              <>
                                <i className="bi bi-person-fill me-1"></i>
                                {auftrag.mitarbeiterName}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </small>
                        </td>
                      )}
                      <td>
                        <small>
                          {auftrag.geplantesDatum ? (
                            <>
                              <i className="bi bi-calendar-event me-1"></i>
                              {new Date(auftrag.geplantesDatum).toLocaleDateString('de-CH')}
                            </>
                          ) : auftrag.gewuenschterTermin ? (
                            <>
                              <i className="bi bi-calendar me-1 text-muted"></i>
                              {new Date(auftrag.gewuenschterTermin).toLocaleDateString('de-CH')}
                            </>
                          ) : '-'}
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
            <div className="p-5 text-center text-muted">
              <i className="bi bi-inbox" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-3">Keine Aufträge gefunden</h4>
              {searchTerm ? (
                <>
                  <p>Ihre Suche nach "{searchTerm}" ergab keine Treffer.</p>
                  <button onClick={clearSearch} className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left me-2"></i>Zurück
                  </button>
                </>
              ) : filterStatus !== 'alle' ? (
                <>
                  <p>Keine Aufträge mit Status "{filterStatus}".</p>
                  <button onClick={() => handleStatusFilter('alle')} className="btn btn-outline-primary">
                    Alle anzeigen
                  </button>
                </>
              ) : (
                <>
                  <p>Es sind noch keine Aufträge vorhanden.</p>
                  {user.rolle === 'ADMIN' && (
                    <Link to="/auftrag/neu" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-2"></i>Ersten Auftrag erstellen
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuftragListe;