import useAuthForm from '../hooks/useAuthForm';
import BrandLogo from '../components/ui/BrandLogo';

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
    setShowRegisterPassword,
    validatePassword
  } = useAuthForm(onAuthSuccess);

  const passwordValidation = validatePassword(registerForm.password);
  const isPasswordValid = passwordValidation.isValid;

  return (
    <div className="shell">
      <div className="auth-topbar">
        <BrandLogo subtitle="Telehealth Platform" />
        <p className="auth-topbar__tagline">Secure virtual care, anytime.</p>
      </div>

      <header className="hero">
        <div className="hero__content">
          <div className="badge">Trusted telehealth</div>
          <h1>Healthcare that meets you where you are.</h1>
          <p>
            Book consultations with verified clinicians, manage your health records,
            and join virtual visits — all in one secure place.
          </p>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="stat__value">24/7</span>
              <span className="stat__label">Secure access</span>
            </div>
            <div className="hero__stat">
              <span className="stat__value">15 min</span>
              <span className="stat__label">Avg. booking time</span>
            </div>
            <div className="hero__stat">
              <span className="stat__value">Encrypted</span>
              <span className="stat__label">Data protection</span>
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
                  autoComplete="email"
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
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="hint">Your session is protected with secure authentication.</p>
              <p className="hint hint--subtle">
                Not for emergencies — call your local emergency number if you need urgent care.
              </p>
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              {registerForm.password && (
                <div className="password-requirements">
                  <p className="password-requirements__title">Password requirements:</p>
                  <ul className="password-requirements__list">
                    <li className={passwordValidation.requirements.minLength ? 'password-requirements__item password-requirements__item--valid' : 'password-requirements__item'}>
                      <span className="password-requirements__icon">{passwordValidation.requirements.minLength ? '✓' : '✗'}</span>
                      8+ characters
                    </li>
                    <li className={passwordValidation.requirements.hasUppercase ? 'password-requirements__item password-requirements__item--valid' : 'password-requirements__item'}>
                      <span className="password-requirements__icon">{passwordValidation.requirements.hasUppercase ? '✓' : '✗'}</span>
                      One uppercase letter
                    </li>
                    <li className={passwordValidation.requirements.hasNumber ? 'password-requirements__item password-requirements__item--valid' : 'password-requirements__item'}>
                      <span className="password-requirements__icon">{passwordValidation.requirements.hasNumber ? '✓' : '✗'}</span>
                      One number
                    </li>
                    <li className={passwordValidation.requirements.hasSpecial ? 'password-requirements__item password-requirements__item--valid' : 'password-requirements__item'}>
                      <span className="password-requirements__icon">{passwordValidation.requirements.hasSpecial ? '✓' : '✗'}</span>
                      One special character
                    </li>
                  </ul>
                </div>
              )}
              <label className="field">
                Confirm password
                <div className="field__row">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={!isPasswordValid}
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    disabled={!isPasswordValid}
                  >
                    {showRegisterPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
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
              <p className="hint">Next, complete your profile to get started.</p>
              <p className="hint hint--subtle">
                By creating an account, you agree to our secure handling of your health information.
              </p>
            </form>
          )}
        </div>
      </header>

      <section className="trust">
        <div>
          <h2>Built for patients and clinicians</h2>
          <p>
            Clear appointment statuses, real-time availability, and connected medical
            records keep everyone aligned throughout your care journey.
          </p>
        </div>
        <div className="trust__grid">
          <article>
            <div className="trust__icon" aria-hidden="true">🔒</div>
            <h3>Secure by design</h3>
            <p>Role-based access keeps patient and doctor data properly separated.</p>
          </article>
          <article>
            <div className="trust__icon" aria-hidden="true">📅</div>
            <h3>Fast booking</h3>
            <p>Find doctors by specialty, symptoms, and real-time availability.</p>
          </article>
          <article>
            <div className="trust__icon" aria-hidden="true">📋</div>
            <h3>Care continuity</h3>
            <p>Records, notes, and prescriptions stay linked to each visit.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
