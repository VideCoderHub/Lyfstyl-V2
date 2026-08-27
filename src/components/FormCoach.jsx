import { useEffect, useMemo, useState } from 'react'
import MascotCharacter from './MascotCharacter'

const JOIN_FIELD_ORDER = ['name', 'age', 'country', 'language', 'email', 'password']

const JOIN_PROMPTS = {
  start: "Hey! I'm Chef Lyf — let's get you set up. What's your name?",
  name: 'Love it! How old are you?',
  age: 'Nice — where in the world are you cooking or dancing from?',
  country: 'Pick the language you want Lyfstyl in.',
  language: 'Almost there! What is your email?',
  email: 'Last step — create a password (6+ characters).',
  password: "You're almost there! Tap what you are here for below.",
  interests: 'Perfect! Hit create account and we will personalize your feed.',
  done: "You're ready to roll — welcome to Lyfstyl!",
}

const AVATAR_PROMPTS = {
  start: 'Pick your starter avatar — chef, dancer, or both!',
  avatarStyle: 'Tell us a bit more so we can tune your feed.',
  age: 'Where are you based?',
  country: 'Language preference?',
  language: 'What brings you here — food, dance, or both?',
  interests: "You're almost there! One tap to start exploring.",
  done: 'Your feed is ready — let us go!',
}

function mascotForInterests(interests) {
  if (interests?.both || (interests?.food && interests?.dance)) return 'duo'
  if (interests?.dance && !interests?.food) return 'dancer'
  return 'chef'
}

function progressFromFields(values, fieldOrder) {
  const filled = fieldOrder.filter((key) => {
    const v = values[key]
    return v != null && String(v).trim().length > 0
  }).length
  return Math.round((filled / fieldOrder.length) * 100)
}

export function useFormCoach({ mode = 'join', interests = {}, avatarStyle = 'chef' }) {
  const [activeField, setActiveField] = useState('start')
  const [values, setValues] = useState({})

  const prompts = mode === 'avatar' ? AVATAR_PROMPTS : JOIN_PROMPTS

  const progress = useMemo(() => {
    if (mode === 'avatar') {
      let score = avatarStyle ? 25 : 0
      score += progressFromFields(values, ['age', 'country', 'language']) * 0.75
      return Math.min(100, Math.round(score))
    }
    return progressFromFields(values, JOIN_FIELD_ORDER)
  }, [mode, values, avatarStyle])

  const message = prompts[activeField] ?? prompts.start

  const mascot =
    mode === 'avatar'
      ? avatarStyle === 'dancer'
        ? 'dancer'
        : avatarStyle === 'duo'
          ? 'duo'
          : 'chef'
      : mascotForInterests(interests)

  function trackField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setActiveField(name)
  }

  function onFocusField(name) {
    setActiveField(name)
  }

  useEffect(() => {
    if (progress >= 85 && !['interests', 'done'].includes(activeField)) {
      setActiveField('interests')
    }
  }, [progress, activeField])

  return { message, mascot, progress, trackField, onFocusField, activeField }
}

export default function FormCoach({ message, mascot, progress }) {
  return (
    <div className="form-coach">
      <MascotCharacter type={mascot} size="lg" speech={message} />
      <div className="form-coach__progress" aria-label={`Form progress ${progress}%`}>
        <div className="form-coach__progress-track">
          <div className="form-coach__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="form-coach__progress-label">
          {progress >= 85 ? "You're almost there!" : `${progress}% complete`}
        </span>
      </div>
    </div>
  )
}
