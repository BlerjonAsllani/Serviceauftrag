import React, { useState } from 'react';
import { login } from '../services/api';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    benutzername: '',
    passwort: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.benutzername, formData.passwort);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <i className="bi bi-wrench-adjustable-circle-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  <h1 className="h4 mt-3 mb-0">Serviceauftragsverwaltung</h1>
                  <p className="text-muted small">Glauser AG</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="benutzername" className="form-label">Benutzername</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="benutzername"
                        value={formData.benutzername}
                        onChange={(e) => setFormData({ ...formData, benutzername: e.target.value })}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="passwort" className="form-label">Passwort</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="passwort"
                        value={formData.passwort}
                        onChange={(e) => setFormData({ ...formData, passwort: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Anmelden...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Anmelden
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <small className="text-muted">
                    <strong>Test-Zugänge:</strong><br />
                    admin / Test1234!<br />
                    mueller.m / Test1234!<br />
                    schmidt.p / Test1234!
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;