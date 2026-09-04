import Link from 'next/link'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ChallengeSubmissionRow({ submission, onVote, votingId }) {
  const { isAuthenticated, setMessage } = useAuth()

  async function handleVote() {
    if (!isAuthenticated) {
      setMessage('Log in to vote')
      return
    }
    try {
      await onVote(submission.id)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <article className="challenge-submission">
      <div className="challenge-submission__rank">#{submission.rank}</div>
      <Link href={submission.detailUrl} className="challenge-submission__thumb">
        <div style={{ backgroundImage: `url(${submission.image})` }} />
      </Link>
      <div className="challenge-submission__body">
        <Link href={submission.detailUrl} className="challenge-submission__title">
          {submission.title}
        </Link>
        <p className="challenge-submission__meta">
          {submission.author?.name} · {submission.meta}
        </p>
      </div>
      <div className="challenge-submission__votes">
        <strong>{submission.voteCount}</strong>
        <span>votes</span>
        {!submission.isOwn ? (
          <button
            type="button"
            className={`btn btn--ghost ${submission.voted ? 'is-active' : ''}`}
            disabled={votingId === submission.id}
            onClick={handleVote}
          >
            {submission.voted ? 'Voted' : 'Vote'}
          </button>
        ) : (
          <span className="tag">Your entry</span>
        )}
      </div>
    </article>
  )
}

export async function voteSubmission(submissionId, setMessage) {
  try {
    return await api.voteChallengeSubmission(submissionId)
  } catch (err) {
    setMessage?.(err.message)
    throw err
  }
}
