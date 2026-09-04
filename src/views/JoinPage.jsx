import AuthForm from '../components/AuthForm'

const JOIN_BENEFITS = [
  { icon: '✨', title: 'AI-personalized feed', text: 'Recipes and moves matched to your country and passions.' },
  { icon: '🏆', title: 'Gamified creator path', text: 'Earn badges, points, and challenge features.' },
  { icon: '🌍', title: 'Global communities', text: 'Structured groups for food, dance, and culture — not noisy feeds.' },
]

export default function JoinPage() {
  return (
    <AuthForm
      mode="join"
      title="Create your Lyfstyl"
      lede="Free to join. Tell us what you love — we'll personalize your feed from the first scroll."
      submitLabel="Create free account"
      switchText="Already have an account?"
      switchTo="/login"
      switchLabel="Log in"
      benefits={JOIN_BENEFITS}
    />
  )
}
