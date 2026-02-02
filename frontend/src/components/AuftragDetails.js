import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getAuftrag, 
  getMitarbeiter, 
  disponierenAuftrag, 
  erstellenRapport, 
  freigebenAuftrag, 
  verrechnenAuftrag 
} from '../services/api';

function AuftragDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auftrag, setAuftrag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [showDisponieren, setShowDisponieren] = useState(false);
  const [showRapport, setShowRapport] = useState(false);
  const [showVerrechnung, setShowVerrechnung] = useState(false);

  // Mitarbeiter-Liste
  const [mitarbeiter, setMitarbeiter] = useState([]);

  // Disponieren Form
  const [disponierenData, setDisponierenData] = useState({
    zugewiesenerMA: '',
    geplantesDatum: '',
    interneNotizen: ''
  });

  // Rapport Form
  const [rapportData, setRapportData] = useState({
    ausfuehrungsdatum: '',
    arbeitszeitVon: '',
    arbeitszeitBis: '',
    arbeitsstunden: '',
    verwendetesMaterial: '',
    bemerkungen: ''
  });

  // Verrechnung Form
  const [verrechnungData, setVerrechnungData] = useState({
    rechnungsnummer: '',
    betrag: '',
    rechnungsdatum: ''
  });

  // Success/Error Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Helper Functions
  const formatStatus = (status) => {
    if (!status) return 'Unbekannt';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPrioritat = (prio) => {
    if (!prio) return 'Normal';
    return prio.charAt(0).toUpperCase() + prio.slice(1);
  };

  const getStatusBadge = (status) => {
    if (!status) return 'secondary';
    if (status === 'erfasst') return 'warning text-dark';
    if (status === 'disponiert') return 'info';
    if (status === 'ausgeführt') return 'primary';
    if (status === 'freigegeben') return 'success';
    if (status === 'verrechnet') return 'dark';
    return 'secondary';
  };

  const getPrioBadge = (prio) => {
    if (!prio) return 'secondary';
    if (prio === 'notfall') return 'danger';
    if (prio === 'dringend') return 'warning text-dark';
    return 'secondary';
  };

  useEffect(() => {
    loadAuftrag();
    if (user && (user.rolle === 'ADMIN' || user.rolle === 'BL')) {
      loadMitarbeiter();
    }
  }, [id]);

  const loadAuftrag = async () => {
    setLoading(true);
    try {
      const response = await getAuftrag(id);
      console.log('Auftrag geladen:', response.data);
      setAuftrag(response.data.data || response.data);
    } catch (err) {
      setError('Auftrag konnte nicht geladen werden');
      console.error('Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMitarbeiter = async () => {
    try {
      const response = await getMitarbeiter();
      console.log('Mitarbeiter geladen:', response.data);
      setMitarbeiter(response.data.data || response.data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Mitarbeiter:', err);
    }
  };

  const handleDownloadPDF = () => {
    const url = `http://localhost/Projekt/api/auftraege/pdf.php?id=${id}`;
    window.open(url, '_blank');
  };

  // Disponieren
  const handleDisponieren = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      await disponierenAuftrag({
        auftragId: id,
        ...disponierenData
      });
      setSuccessMessage('✅ Auftrag erfolgreich disponiert!');
      setShowDisponieren(false);
      loadAuftrag();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Fehler beim Disponieren');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Rapport erstellen
  const handleRapport = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      await erstellenRapport({
        auftragId: id,
        ...rapportData
      });
      setSuccessMessage('✅ Rapport erfolgreich erstellt!');
      setShowRapport(false);
      loadAuftrag();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Fehler beim Erstellen des Rapports');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Freigeben
  const handleFreigeben = async () => {
    if (!window.confirm('Möchten Sie diesen Auftrag wirklich zur Verrechnung freigeben?')) {
      return;
    }
    
    try {
      await freigebenAuftrag(id);
      setSuccessMessage('✅ Auftrag erfolgreich freigegeben!');
      loadAuftrag();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Fehler beim Freigeben');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Verrechnen
  const handleVerrechnen = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      await verrechnenAuftrag({
        auftragId: id,
        ...verrechnungData
      });
      setSuccessMessage('✅ Auftrag erfolgreich verrechnet!');
      setShowVerrechnung(false);
      loadAuftrag();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Fehler beim Verrechnen');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !auftrag) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Auftrag nicht gefunden'}
        </div>
        <button onClick={() => navigate('/auftraege')} className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>Zurück zur Übersicht
        </button>
      </div>
    );
  }

  // Main Render
  return (
    <div className="container mt-4 mb-5">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/auftraege">Aufträge</Link>
          </li>
          <li className="breadcrumb-item active">{auftrag.auftragsnummer || 'Auftrag'}</li>
        </ol>
      </nav>

      {/* Auftrags-Header */}
      <div className="card mb-4 border-primary">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="mb-2">
                <i className="bi bi-file-text me-2 text-primary"></i>
                {auftrag.auftragsnummer || 'N/A'}
              </h2>
              <p className="text-muted mb-0">
                Erstellt am {auftrag.erstelltAm ? new Date(auftrag.erstelltAm).toLocaleDateString('de-CH', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'} Uhr
                {auftrag.erstelltVonName && ` von ${auftrag.erstelltVonName}`}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h3>
                <span className={`badge bg-${getStatusBadge(auftrag.status)}`}>
                  {formatStatus(auftrag.status)}
                </span>
              </h3>
              <span className={`badge bg-${getPrioBadge(auftrag.prioritaet)}`}>
                {auftrag.prioritaet === 'notfall' && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                Priorität: {formatPrioritat(auftrag.prioritaet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Linke Spalte */}
        <div className="col-lg-8">
          {/* Kundendaten */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="bi bi-person-circle me-2"></i>Kundendaten</h5>
            </div>
            <div className="card-body">
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold text-muted">Name / Firma:</div>
                <div className="col-sm-8"><strong>{auftrag.kundeName || 'N/A'}</strong></div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold text-muted">Adresse:</div>
                <div className="col-sm-8">
                  {auftrag.kundeStrasse || 'N/A'}<br />
                  {auftrag.kundePlz || ''} {auftrag.kundeOrt || ''}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-4 fw-bold text-muted">Telefon:</div>
                <div className="col-sm-8">
                  <a href={`tel:${auftrag.kundeTelefon}`}>
                    <i className="bi bi-telephone-fill me-1"></i>
                    {auftrag.kundeTelefon || 'N/A'}
                  </a>
                </div>
              </div>
              {auftrag.kundeEmail && (
                <div className="row">
                  <div className="col-sm-4 fw-bold text-muted">E-Mail:</div>
                  <div className="col-sm-8">
                    <a href={`mailto:${auftrag.kundeEmail}`}>
                      <i className="bi bi-envelope-fill me-1"></i>
                      {auftrag.kundeEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auftragsdaten */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="bi bi-clipboard-check me-2"></i>Auftragsbeschreibung</h5>
            </div>
            <div className="card-body">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{auftrag.beschreibung || 'Keine Beschreibung'}</p>
              
              {auftrag.gewuenschterTermin && (
                <>
                  <hr />
                  <p className="mb-0">
                    <i className="bi bi-calendar me-2 text-primary"></i>
                    <strong>Gewünschter Termin:</strong> 
                    {' '}{new Date(auftrag.gewuenschterTermin).toLocaleDateString('de-CH')}
                  </p>
                </>
              )}
              
              {auftrag.interneNotizen && user.rolle !== 'MA' && (
                <>
                  <hr />
                  <p className="mb-0 text-muted">
                    <i className="bi bi-sticky me-2"></i>
                    <strong>Interne Notizen:</strong><br />
                    <span style={{ whiteSpace: 'pre-wrap' }}>{auftrag.interneNotizen}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Disposition */}
          {auftrag.zugewiesenerMA && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0"><i className="bi bi-person-badge me-2"></i>Disposition</h5>
              </div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold text-muted">Zugewiesen an:</div>
                  <div className="col-sm-8">
                    <i className="bi bi-person-fill me-1 text-primary"></i>
                    <strong>{auftrag.mitarbeiterName || 'N/A'}</strong>
                  </div>
                </div>
                {auftrag.geplantesDatum && (
                  <div className="row">
                    <div className="col-sm-4 fw-bold text-muted">Geplantes Datum:</div>
                    <div className="col-sm-8">
                      <i className="bi bi-calendar-event me-1 text-primary"></i>
                      {new Date(auftrag.geplantesDatum).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rapport */}
          {auftrag.rapportId && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Rapport</h5>
              </div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold text-muted">Ausführungsdatum:</div>
                  <div className="col-sm-8">
                    {auftrag.ausfuehrungsdatum ? new Date(auftrag.ausfuehrungsdatum).toLocaleDateString('de-CH') : 'N/A'}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold text-muted">Arbeitszeit:</div>
                  <div className="col-sm-8">
                    {auftrag.arbeitszeitVon && auftrag.arbeitszeitBis ? (
                      <>
                        {auftrag.arbeitszeitVon.substring(0, 5)} - {auftrag.arbeitszeitBis.substring(0, 5)} Uhr
                      </>
                    ) : auftrag.arbeitsstunden ? (
                      `${auftrag.arbeitsstunden} Stunden`
                    ) : '-'}
                  </div>
                </div>
                {auftrag.verwendetesMaterial && (
                  <div className="row mb-2">
                    <div className="col-sm-4 fw-bold text-muted">Verwendetes Material:</div>
                    <div className="col-sm-8" style={{ whiteSpace: 'pre-wrap' }}>
                      {auftrag.verwendetesMaterial}
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="col-sm-4 fw-bold text-muted">Bemerkungen:</div>
                  <div className="col-sm-8" style={{ whiteSpace: 'pre-wrap' }}>
                    {auftrag.rapportBemerkungen || 'Keine Bemerkungen'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verrechnung */}
          {auftrag.rechnungsnummer && (
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0"><i className="bi bi-receipt me-2"></i>Verrechnung</h5>
              </div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold text-muted">Rechnungsnummer:</div>
                  <div className="col-sm-8"><strong>{auftrag.rechnungsnummer}</strong></div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold text-muted">Betrag:</div>
                  <div className="col-sm-8">
                    <strong>CHF {auftrag.betrag ? parseFloat(auftrag.betrag).toFixed(2).replace('.', ',') : '0,00'}</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-4 fw-bold text-muted">Rechnungsdatum:</div>
                  <div className="col-sm-8">
                    {auftrag.rechnungsdatum ? new Date(auftrag.rechnungsdatum).toLocaleDateString('de-CH') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rechte Spalte: Aktionen */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white">
              <h5 className="mb-0"><i className="bi bi-lightning-fill me-2"></i>Aktionen</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  onClick={() => navigate('/auftraege')}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>Zurück zur Übersicht
                </button>
                
                {/* PDF DOWNLOAD */}
                <button 
                  onClick={handleDownloadPDF}
                  className="btn btn-primary"
                >
                  <i className="bi bi-file-pdf-fill me-2"></i>Auftragsblatt herunterladen
                </button>
                
                <hr />

                {/* DISPONIEREN - nur BL/ADMIN bei Status ERFASST */}
                {user && (user.rolle === 'BL' || user.rolle === 'ADMIN') && auftrag.status === 'erfasst' && (
                  <button 
                    onClick={() => setShowDisponieren(true)}
                    className="btn btn-info"
                  >
                    <i className="bi bi-person-plus me-2"></i>Auftrag disponieren
                  </button>
                )}

                {/* RAPPORT ERSTELLEN - nur MA (zugewiesen) bei Status DISPONIERT */}
                {user && auftrag.status === 'disponiert' && 
                 user.rolle === 'MA' && auftrag.zugewiesenerMA == user.userId && (
                  <button 
                    onClick={() => setShowRapport(true)}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>Rapport erstellen
                  </button>
                )}

                {/* FREIGEBEN - nur BL/ADMIN bei Status AUSGEFÜHRT */}
                {user && (user.rolle === 'BL' || user.rolle === 'ADMIN') && auftrag.status === 'ausgeführt' && (
                  <button 
                    onClick={handleFreigeben}
                    className="btn btn-success"
                  >
                    <i className="bi bi-check-circle me-2"></i>Zur Verrechnung freigeben
                  </button>
                )}

                {/* VERRECHNEN - nur ADMIN bei Status FREIGEGEBEN */}
                {user && user.rolle === 'ADMIN' && auftrag.status === 'freigegeben' && (
                  <button 
                    onClick={() => setShowVerrechnung(true)}
                    className="btn btn-dark"
                  >
                    <i className="bi bi-receipt me-2"></i>Auftrag verrechnen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Disponieren */}
      {showDisponieren && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowDisponieren(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Auftrag disponieren</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDisponieren(false)}
                ></button>
              </div>
              <form onSubmit={handleDisponieren}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Mitarbeiter zuweisen *</label>
                    <select 
                      className="form-select"
                      value={disponierenData.zugewiesenerMA}
                      onChange={(e) => setDisponierenData({...disponierenData, zugewiesenerMA: e.target.value})}
                      required
                    >
                      <option value="">Bitte wählen...</option>
                      {mitarbeiter.map(ma => (
                        <option key={ma.benutzerId} value={ma.benutzerId}>
                          {ma.name} ({ma.rolle})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Geplantes Datum *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={disponierenData.geplantesDatum}
                      onChange={(e) => setDisponierenData({...disponierenData, geplantesDatum: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Interne Notizen (optional)</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={disponierenData.interneNotizen}
                      onChange={(e) => setDisponierenData({...disponierenData, interneNotizen: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowDisponieren(false)}
                  >
                    Abbrechen
                  </button>
                  <button type="submit" className="btn btn-info">
                    <i className="bi bi-check me-2"></i>Disponieren
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rapport erstellen */}
      {showRapport && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowRapport(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Arbeitsrapport erstellen</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRapport(false)}
                ></button>
              </div>
              <form onSubmit={handleRapport}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ausführungsdatum *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={rapportData.ausfuehrungsdatum}
                      onChange={(e) => setRapportData({...rapportData, ausfuehrungsdatum: e.target.value})}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Arbeitszeit von</label>
                      <input 
                        type="time"
                        className="form-control"
                        value={rapportData.arbeitszeitVon}
                        onChange={(e) => setRapportData({...rapportData, arbeitszeitVon: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Arbeitszeit bis</label>
                      <input 
                        type="time"
                        className="form-control"
                        value={rapportData.arbeitszeitBis}
                        onChange={(e) => setRapportData({...rapportData, arbeitszeitBis: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">ODER: Arbeitsstunden gesamt</label>
                    <input 
                      type="number"
                      step="0.25"
                      className="form-control"
                      value={rapportData.arbeitsstunden}
                      onChange={(e) => setRapportData({...rapportData, arbeitsstunden: e.target.value})}
                      placeholder="z.B. 3.5"
                    />
                    <small className="text-muted">Nur ausfüllen wenn keine von-bis Zeit angegeben</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Verwendetes Material (optional)</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={rapportData.verwendetesMaterial}
                      onChange={(e) => setRapportData({...rapportData, verwendetesMaterial: e.target.value})}
                      placeholder="z.B. 2x Dichtung, 1x Ventil..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Bemerkungen * (mind. 20 Zeichen)</label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={rapportData.bemerkungen}
                      onChange={(e) => setRapportData({...rapportData, bemerkungen: e.target.value})}
                      required
                      minLength="20"
                      placeholder="Beschreibung der durchgeführten Arbeiten..."
                    ></textarea>
                    <small className="text-muted">{rapportData.bemerkungen.length} / 20 Zeichen (min.)</small>
                  </div>
                </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowRapport(false)}
                    >
                    Abbrechen
                    </button>
                    <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Rapport speichern
                    </button>
                  </div>
</form>
</div>
</div>
</div>
)}{/* MODAL: Verrechnung */}
  {showVerrechnung && (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowVerrechnung(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Auftrag verrechnen</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowVerrechnung(false)}
            ></button>
          </div>
          <form onSubmit={handleVerrechnen}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Rechnungsnummer *</label>
                <input 
                  type="text"
                  className="form-control"
                  value={verrechnungData.rechnungsnummer}
                  onChange={(e) => setVerrechnungData({...verrechnungData, rechnungsnummer: e.target.value})}
                  required
                  placeholder="z.B. RE-2026-001"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Betrag (CHF) *</label>
                <input 
                  type="number"
                  step="0.05"
                  min="0.01"
                  className="form-control"
                  value={verrechnungData.betrag}
                  onChange={(e) => setVerrechnungData({...verrechnungData, betrag: e.target.value})}
                  required
                  placeholder="z.B. 150.00"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Rechnungsdatum *</label>
                <input 
                  type="date"
                  className="form-control"
                  value={verrechnungData.rechnungsdatum}
                  onChange={(e) => setVerrechnungData({...verrechnungData, rechnungsdatum: e.target.value})}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowVerrechnung(false)}
              >
                Abbrechen
              </button>
              <button type="submit" className="btn btn-dark">
                <i className="bi bi-check me-2"></i>Verrechnen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
</div>
);
}
export default AuftragDetails;