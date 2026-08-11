import AuthForm from '../components/AuthForm'

export default function JoinPage() {
  return (
    <AuthForm
      mode="join"
      title="Create your Lyfstyl"
      lede="Free to join. Share plates, clips, and challenges with one community."
      submitLabel="Join Now — it's free"
      switchText="Already have an account?"
      switchTo="/login"
      switchLabel="Log in"
    />
  )
}
