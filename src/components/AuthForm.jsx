import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AuthForm({
  mode = 'login',
  title,
  lede,
  submitLabel,
  switchText,
  switchTo,
  switchLabel,
}) {
  const isJoin = mode === 'join'
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <main className="auth-page">
      <div className="auth-page__media" aria-hidden="true">
        <div className={`auth-page__panel auth-page__panel--${isJoin ? 'join' : 'login'}`} />
        <div className="auth-page__veil" />
        <div className="auth-page__quote">
          <p className="auth-page__brand">Lyfstyl</p>
          <p>Where flavour meets movement.</p>
        </div>
      </div>

      <div className="auth-page__panel-form">
        <div className="auth-card">
          <p className="auth-card__eyebrow">{isJoin ? 'Join Now' : 'Log in'}</p>
          <h1>{title}</h1>
          <p className="auth-card__lede">{lede}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isJoin ? (
              <label className="field">
                <span>Full name</span>
                <input type="text" name="name" placeholder="Alex Rivera" autoComplete="name" required />
              </label>
            ) : null}

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="field__password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isJoin ? 'Create a password' : 'Your password'}
                  autoComplete={isJoin ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {isJoin ? (
              <fieldset className="interest">
                <legend>I&apos;m mostly here for</legend>
                <label>
                  <input type="checkbox" name="interest" value="food" defaultChecked />
                  Food
                </label>
                <label>
                  <input type="checkbox" name="interest" value="dance" defaultChecked />
                  Dance
                </label>
                <label>
                  <input type="checkbox" name="interest" value="both" />
                  Both
                </label>
              </fieldset>
            ) : (
              <div className="auth-form__row">
                <label className="check">
                  <input type="checkbox" name="remember" />
                  Remember me
                </label>
                <button type="button" className="text-link">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--lg btn--block">
              {submitLabel}
            </button>
          </form>

          <p className="auth-card__switch">
            {switchText}{' '}
            <Link to={switchTo}>{switchLabel}</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
