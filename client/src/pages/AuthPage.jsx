import useAuthForm from '../hooks/useAuthForm';
import '../App.css';

const AuthPage = ({ onAuthSuccess }) => {
  const {
    roles,
    mode,
    loginForm,
    registerForm,
    status,
    loading,
    showLoginPassword,
    showRegisterPassword,
    handleModeChange,
    handleLoginChange,
    handleRegisterChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    setShowLoginPassword,
    setShowRegisterPassword
  } = useAuthForm(onAuthSuccess);

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero__content">
          <div className="badge">Telehealth MVP</div>
          <h1>Care that feels human, even on a screen.</h1>
          <p>
            Book trusted doctors, manage your schedule, and keep your medical history in one
            calm space.
          </p>
          <div className="hero__stats">
            <div>
              <span className="stat__value">24/7</span>
              <span className="stat__label">Secure access</span>
            </div>
            <div>
              <span className="stat__value">15 min</span>
              <span className="stat__label">Avg. booking time</span>
            </div>
            <div>
              <span className="stat__value">HIPAA-ready</span>
              <span className="stat__label">Compliance posture</span>
            </div>
          </div>
        </div>
        <div className="hero__panel">
          <div className="tabs">
            <button
              type="button"
              className={mode === 'login' ? 'tab tab--active' : 'tab'}
              onClick={() => handleModeChange('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'tab tab--active' : 'tab'}
              onClick={() => handleModeChange('register')}
            >
              Create account
            </button>
          </div>

          {status.type !== 'idle' && (
            <div className={`alert alert--${status.type}`} role="status">
              {status.message}
            </div>
          )}

          {mode === 'login' ? (
            <form className="form" onSubmit={handleLoginSubmit}>
              <label className="field">
                Email
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label className="field">
                Password
                <div className="field__row">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="hint">We use JWT-based authentication for secure sessions.</p>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegisterSubmit}>
              <label className="field">
                Full name
                <input
                  type="text"
                  name="displayName"
                  value={registerForm.displayName}
                  onChange={handleRegisterChange}
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="field">
                Email
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label className="field">
                Password
                <div className="field__row">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <label className="field">
                I am a
                <select name="role" value={registerForm.role} onChange={handleRegisterChange}>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <p className="hint">Next, we will ask for your profile details.</p>
            </form>
          )}
        </div>
      </header>

      <section className="trust">
        <div>
          <h2>Built for patients and clinicians</h2>
          <p>
            Transparent appointment status, clinician availability, and shared medical records
            keep everyone aligned.
          </p>
        </div>
        <div className="trust__grid">
          <article>
            <h3>Secure by design</h3>
            <p>Role-based access keeps patient and doctor data separated.</p>
          </article>
          <article>
            <h3>Fast booking</h3>
            <p>Find doctors by specialty, symptoms, and real-time availability.</p>
          </article>
          <article>
            <h3>Continuity</h3>
            <p>Records, notes, and prescriptions remain connected to each visit.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
