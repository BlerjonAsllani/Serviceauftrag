import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erstellenAuftrag } from '../services/api';

function AuftragErfassen({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    kundeName: '',
    kundeStrasse: '',
    kundePlz: '',
    kundeOrt: '',
    kundeTelefon: '',
    kundeEmail: '',
    beschreibung: '',
    prioritaet: 'normal',
    gewuenschterTermin: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await erstellenAuftrag(formData);
      console.log('Auftrag erstellt:', response.data);
      
      // Zur Liste mit Success Message
      navigate('/auftraege', { 
        state: { 
          successMessage: `✅ Auftrag ${response.data.auftragsnummer || ''} erfolgreich erstellt!` 
        } 
      });
      
    } catch (err) {
      console.error('Fehler:', err);
      setError(err.response?.data?.error || err.response?.data?.details || 'Fehler beim Erstellen des Auftrags');
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  if (user.rolle !== 'ADMIN') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Keine Berechtigung. Nur Administratoren können Aufträge erfassen.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">
              <i className="bi bi-plus-circle me-2 text-primary"></i>
              Neuen Auftrag erfassen
            </h1>
            <button 
              onClick={() => navigate('/auftraege')}
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>Abbrechen
            </button>
          </div>

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

          <form onSubmit={handleSubmit}>
            {/* Kundendaten */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Kundendaten
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Name / Firma *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="kundeName"
                      value={formData.kundeName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Strasse *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="kundeStrasse"
                      value={formData.kundeStrasse}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">PLZ *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="kundePlz"
                      value={formData.kundePlz}
                      onChange={handleChange}
                      pattern="[0-9]{4}"
                      maxLength="4"
                      required
                    />
                  </div>
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Ort *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="kundeOrt"
                      value={formData.kundeOrt}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Telefon *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="kundeTelefon"
                      value={formData.kundeTelefon}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">E-Mail (optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      name="kundeEmail"
                      value={formData.kundeEmail}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Auftragsdaten */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Auftragsdaten
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Beschreibung *</label>
                  <textarea
                    className="form-control"
                    name="beschreibung"
                    rows="5"
                    value={formData.beschreibung}
                    onChange={handleChange}
                    required
                    placeholder="Detaillierte Beschreibung des Problems..."
                  ></textarea>
                  <small className="text-muted">Mindestens 20 Zeichen</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priorität *</label>
                    <select
                      className="form-select"
                      name="prioritaet"
                      value={formData.prioritaet}
                      onChange={handleChange}
                      required
                    >
                      <option value="normal">Normal</option>
                      <option value="dringend">Dringend</option>
                      <option value="notfall">Notfall</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gewünschter Termin (optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      name="gewuenschterTermin"
                      value={formData.gewuenschterTermin}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Auftrag erstellen
                  </>
                )}
              </button>
              <button 
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/auftraege')}
                disabled={loading}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuftragErfassen;