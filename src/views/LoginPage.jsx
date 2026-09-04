import AuthForm from '../components/AuthForm'

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      title="Welcome back"
      lede="Log in to save recipes, drop moves, and jump into challenges."
      submitLabel="Log in"
      switchText="New to Lyfstyl?"
      switchTo="/join"
      switchLabel="Join Now"
    />
  )
}
