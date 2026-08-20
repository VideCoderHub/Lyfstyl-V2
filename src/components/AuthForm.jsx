import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialAuthModal from './SocialAuthModal'
import { SOCIAL_PROVIDERS } from './SocialIcons'

const COUNTRIES = ['Kenya', 'Japan', 'Nigeria', 'Italy', 'Mexico', 'South Korea', 'USA', 'UK', 'South Africa']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
  { value: 'ja', label: 'Japanese' },
  { value: 'it', label: 'Italian' },
  { value: 'es', label: 'Spanish' },
]

const AVATAR_STYLES = [
  { id: 'chef', emoji: '👨‍🍳', label: 'Chef', desc: 'Recipes & kitchen culture' },
  { id: 'dancer', emoji: '💃', label: 'Dancer', desc: 'Moves, battles & cyphers' },
  { id: 'duo', emoji: '🍽️', label: 'Food × Dance', desc: 'Both worlds, one profile' },
  { id: 'creator', emoji: '✨', label: 'Creator', desc: 'Publish, compete & grow' },
]

export default function AuthForm({
  mode = 'login',
  title,
  lede,
  submitLabel,
  switchText,
  switchTo,
  switchLabel,
  benefits = [],
}) {
  const isJoin = mode === 'join'
  const navigate = useNavigate()
  const { login, register, socialLogin, completeOnboarding, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [interests, setInterests] = useState({ food: true, dance: true, both: false })
  const [socialProvider, setSocialProvider] = useState(null)
  const [avatarStyle, setAvatarStyle] = useState('chef')

  function toggleInterest(key) {
    if (key === 'both') {
      setInterests({ food: true, dance: true, both: true })
      return
    }
    setInterests((prev) => {
      const next = { ...prev, [key]: !prev[key], both: false }
      if (!next.food && !next.dance) next[key] = true
      return next
    })
  }

  function selectedInterests() {
    if (interests.both) return ['food', 'dance', 'both']
    const values = []
    if (interests.food) values.push('food')
    if (interests.dance) values.push('dance')
    return values.length ? values : ['food', 'dance']
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    try {
      if (isJoin) {
        const data = await register({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          age: Number(payload.age),
          country: payload.country,
          language: payload.language,
          interests: selectedInterests(),
        })
        setSuccess(data.message ?? 'Account created.')
        navigate(data.user.onboardingComplete ? '/dashboard' : '/join?step=avatar')
      } else {
        await login({ email: payload.email, password: payload.password })
        setSuccess('Welcome back!')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialSubmit({ email, name }) {
    if (!socialProvider) return
    setError('')
    setLoading(true)
    try {
      const data = await socialLogin(socialProvider, { email, name })
      setSocialProvider(null)
      setSuccess(data.message)
      navigate(data.user.onboardingComplete ? '/dashboard' : '/join?step=avatar')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    try {
      await completeOnboarding({
        age: Number(form.get('age') || user?.age),
        country: form.get('country') || user?.country,
        language: form.get('language') || user?.language,
        interests: selectedInterests(),
        avatarStyle: form.get('avatarStyle'),
      })
      setSuccess('Avatar saved. Feed personalized.')
      navigate('/discover')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const showAvatarStep = isJoin && new URLSearchParams(window.location.search).get('step') === 'avatar'

  function AuthSteps({ current }) {
    const steps = [
      { id: 1, label: 'Account' },
      { id: 2, label: 'Personalize' },
    ]
    return (
      <div className="auth-steps" aria-label="Signup progress">
        {steps.map((step, index) => (
          <div key={step.id} className="auth-steps__item">
            <div className={`auth-steps__dot ${current >= step.id ? 'is-active' : ''} ${current > step.id ? 'is-done' : ''}`}>
              {current > step.id ? '✓' : step.id}
            </div>
            <span className={`auth-steps__label ${current >= step.id ? 'is-active' : ''}`}>{step.label}</span>
            {index < steps.length - 1 ? <div className={`auth-steps__line ${current > step.id ? 'is-done' : ''}`} /> : null}
          </div>
        ))}
      </div>
    )
  }

  if (showAvatarStep) {
    return (
      <main className="auth-page auth-page--join auth-page--avatar">
        <div className="auth-page__media" aria-hidden="true">
          <div className="auth-page__panel auth-page__panel--join" />
          <div className="auth-page__veil" />
          <div className="auth-page__quote auth-page__quote--join">
            <p className="auth-page__brand">Almost there</p>
            <p>Pick a starter avatar and we&apos;ll tailor Discover to your interests.</p>
            <ul className="auth-page__benefits">
              <li><span>🎯</span> Feed tuned to food, dance, or both</li>
              <li><span>🏅</span> Unlock your first creator badge</li>
            </ul>
          </div>
        </div>

        <div className="auth-page__panel-form">
          <div className="auth-card auth-card--join">
            <AuthSteps current={2} />

            <p className="auth-card__eyebrow">Step 2 · Personalize</p>
            <h1>Build your Lyfstyl identity</h1>
            <p className="auth-card__lede">
              Choose a starter avatar. AI-generated avatars arrive in a future release.
            </p>

            <form className="auth-form" onSubmit={handleAvatarSubmit}>
              <input type="hidden" name="avatarStyle" value={avatarStyle} />

              <div className="auth-form__section">
                <span className="auth-form__section-label">Pick your look</span>
                <div className="avatar-grid">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      className={`avatar-card ${avatarStyle === style.id ? 'is-selected' : ''}`}
                      onClick={() => setAvatarStyle(style.id)}
                      aria-pressed={avatarStyle === style.id}
                    >
                      <span className="avatar-card__emoji" aria-hidden="true">{style.emoji}</span>
                      <strong>{style.label}</strong>
                      <small>{style.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-form__section">
                <span className="auth-form__section-label">Your preferences</span>
                <div className="field-row">
                  <label className="field">
                    <span>Age</span>
                    <input type="number" name="age" min="13" max="100" defaultValue={user?.age ?? 25} required />
                  </label>
                  <label className="field">
                    <span>Country</span>
                    <select name="country" defaultValue={user?.country ?? 'Kenya'} required>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Language</span>
                  <select name="language" defaultValue={user?.language ?? 'en'} required>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </label>

                <div className="interest-chips">
                  <span className="interest-chips__label">I&apos;m mostly here for</span>
                  <div className="interest-chips__row">
                    <button
                      type="button"
                      className={`interest-chip ${interests.food && !interests.both ? 'is-active' : interests.both ? 'is-active' : ''}`}
                      onClick={() => toggleInterest('food')}
                    >
                      🍜 Food
                    </button>
                    <button
                      type="button"
                      className={`interest-chip ${interests.dance && !interests.both ? 'is-active' : interests.both ? 'is-active' : ''}`}
                      onClick={() => toggleInterest('dance')}
                    >
                      💃 Dance
                    </button>
                    <button
                      type="button"
                      className={`interest-chip ${interests.both ? 'is-active' : ''}`}
                      onClick={() => toggleInterest('both')}
                    >
                      ✨ Both
                    </button>
                  </div>
                </div>
              </div>

              {error ? <p className="form-message form-message--error">{error}</p> : null}
              {success ? <p className="form-message form-message--success">{success}</p> : null}

              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
                {loading ? 'Personalizing…' : 'Start exploring →'}
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`auth-page ${isJoin ? 'auth-page--join' : ''}`}>
      <div className="auth-page__media" aria-hidden="true">
        <div className={`auth-page__panel auth-page__panel--${isJoin ? 'join' : 'login'}`} />
        <div className="auth-page__veil" />
        <div className={`auth-page__quote ${isJoin ? 'auth-page__quote--join' : ''}`}>
          <p className="auth-page__brand">Lyfstyl</p>
          <p>{isJoin ? 'Join creators sharing flavour and footwork worldwide.' : 'Where flavour meets movement.'}</p>
          {isJoin && benefits.length ? (
            <ul className="auth-page__benefits">
              {benefits.map((item) => (
                <li key={item.title}>
                  <span aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="auth-page__panel-form">
        <div className={`auth-card ${isJoin ? 'auth-card--join' : ''}`}>
          {isJoin ? <AuthSteps current={1} /> : null}

          <p className="auth-card__eyebrow">{isJoin ? 'Join Now · Free' : 'Log in'}</p>
          <h1>{title}</h1>
          <p className="auth-card__lede">{lede}</p>

          <div className="social-auth">
            <p className="social-auth__label">Continue with</p>
            <div className="social-auth__buttons">
              {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`btn btn--social btn--social-${id}`}
                  onClick={() => setSocialProvider(id)}
                  disabled={loading}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-divider">
            <span>{isJoin ? 'or sign up with email' : 'or continue with email'}</span>
          </div>

          <SocialAuthModal
            open={Boolean(socialProvider)}
            provider={socialProvider}
            onClose={() => setSocialProvider(null)}
            onSubmit={handleSocialSubmit}
            loading={loading}
          />

          <form className="auth-form" onSubmit={handleSubmit}>
            {isJoin ? (
              <>
                <div className="auth-form__section">
                  <span className="auth-form__section-label">About you</span>
                  <label className="field">
                    <span>Full name</span>
                    <input type="text" name="name" placeholder="Alex Rivera" autoComplete="name" required />
                  </label>

                  <div className="field-row">
                    <label className="field">
                      <span>Age</span>
                      <input type="number" name="age" min="13" max="100" placeholder="25" required />
                    </label>
                    <label className="field">
                      <span>Country</span>
                      <select name="country" defaultValue="Kenya" required>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="field">
                    <span>Language</span>
                    <select name="language" defaultValue="en" required>
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            ) : null}

            <div className="auth-form__section">
              {isJoin ? <span className="auth-form__section-label">Account</span> : null}

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
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            </div>

            {isJoin ? (
              <div className="interest-chips">
                <span className="interest-chips__label">I&apos;m mostly here for</span>
                <div className="interest-chips__row">
                  <button
                    type="button"
                    className={`interest-chip ${interests.food && !interests.both ? 'is-active' : interests.both ? 'is-active' : ''}`}
                    onClick={() => toggleInterest('food')}
                  >
                    🍜 Food
                  </button>
                  <button
                    type="button"
                    className={`interest-chip ${interests.dance && !interests.both ? 'is-active' : interests.both ? 'is-active' : ''}`}
                    onClick={() => toggleInterest('dance')}
                  >
                    💃 Dance
                  </button>
                  <button
                    type="button"
                    className={`interest-chip ${interests.both ? 'is-active' : ''}`}
                    onClick={() => toggleInterest('both')}
                  >
                    ✨ Both
                  </button>
                </div>
              </div>
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

            {error ? <p className="form-message form-message--error">{error}</p> : null}
            {success ? <p className="form-message form-message--success">{success}</p> : null}

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
              {loading ? 'Please wait…' : submitLabel}
            </button>

            {isJoin ? (
              <p className="auth-card__trust">
                <span>🔒</span> Free forever · No spam · Cancel anytime
              </p>
            ) : null}
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
