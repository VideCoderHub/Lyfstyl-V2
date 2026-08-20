import { useState } from 'react'
import Modal from './Modal'
import { SOCIAL_PROVIDERS } from './SocialIcons'

export default function SocialAuthModal({ open, provider, onClose, onSubmit, loading }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const label = SOCIAL_PROVIDERS.find((p) => p.id === provider)?.label ?? provider

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ email, name })
  }

  return (
    <Modal open={open} title={`Continue with ${label}`} onClose={onClose}>
      <p className="modal__lede">Connect your {label} account to join Lyfstyl communities.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Display name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Connecting…' : `Continue with ${label}`}
        </button>
      </form>
    </Modal>
  )
}
