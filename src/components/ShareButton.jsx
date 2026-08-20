import { useAuth } from '../context/AuthContext'

export default function ShareButton({ title, text }) {
  const { setMessage } = useAuth()

  async function share() {
    const url = window.location.href
    const payload = { title: title ?? 'Lyfstyl', text: text ?? 'Check this out on Lyfstyl', url }

    try {
      if (navigator.share) {
        await navigator.share(payload)
      } else {
        await navigator.clipboard.writeText(url)
        setMessage('Link copied to clipboard')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessage('Could not share')
      }
    }
  }

  return (
    <button type="button" className="social-action" onClick={share}>
      <span className="social-action__icon" aria-hidden="true">↗</span>
      <span>Share</span>
    </button>
  )
}
