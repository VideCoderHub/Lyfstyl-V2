import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import FileUpload from '../components/FileUpload'
import PageHero from '../components/PageHero'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CreatePage() {
  const [params] = useSearchParams()
  const challengeId = params.get('challenge')
  const communityParam = params.get('community')
  const kindParam = params.get('type')
  const router = useRouter()
  const { user, setMessage } = useAuth()
  const [communities, setCommunities] = useState([])
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(kindParam === 'move' ? 'move' : 'recipe')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [communitySlug, setCommunitySlug] = useState(communityParam ?? '')
  const [communityInfo, setCommunityInfo] = useState(null)

  useEffect(() => {
    api.getCommunities().then((data) => setCommunities(data.communities ?? []))
  }, [])

  useEffect(() => {
    if (!challengeId) return
    api
      .getChallenge(challengeId)
      .then((data) => {
        setChallenge(data.challenge)
        if (data.challenge?.submissionKind === 'move') setType('move')
        else if (data.challenge?.submissionKind === 'recipe') setType('recipe')
        if (data.challenge?.communitySlug) setCommunitySlug(data.challenge.communitySlug)
      })
      .catch(() => setChallenge(null))
  }, [challengeId])

  useEffect(() => {
    if (!communityParam) return
    api
      .getCommunity(communityParam)
      .then((data) => {
        setCommunityInfo(data.community)
        if (data.community?.vertical === 'dance') setType('move')
        else if (data.community?.vertical === 'food') setType('recipe')
        setCommunitySlug(data.community.slug)
      })
      .catch(() => setCommunityInfo(null))
  }, [communityParam])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    try {
      if (type === 'recipe') {
        const data = await api.createRecipe({
          title: payload.title,
          description: payload.description,
          time: payload.time,
          level: payload.level,
          communitySlug: payload.communitySlug,
          country: payload.country || user?.country,
          ingredients: payload.ingredients?.split('\n').filter(Boolean) ?? [],
          steps: payload.steps?.split('\n').filter(Boolean) ?? [],
          image: imageUrl || undefined,
          challengeId: challengeId ? Number(challengeId) : undefined,
        })
        setMessage(data.challengeMessage ?? 'Recipe published!')
        if (challengeId) router.push(`/challenges/${challengeId}`)
        else if (communityParam) router.push(`/community/${communityParam}`)
        else router.push(`/recipes/${data.recipe.id}`)
      } else {
        const data = await api.createMove({
          title: payload.title,
          description: payload.description,
          style: payload.style,
          length: payload.length,
          communitySlug: payload.communitySlug,
          country: payload.country || user?.country,
          image: imageUrl || undefined,
          videoUrl: uploadedVideoUrl || payload.videoUrl || '',
          challengeId: challengeId ? Number(challengeId) : undefined,
        })
        setMessage(data.challengeMessage ?? 'Move published!')
        if (challengeId) router.push(`/challenges/${challengeId}`)
        else if (communityParam) router.push(`/community/${communityParam}`)
        else router.push(`/moves/${data.move.id}`)
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunities = communities.filter((c) =>
    type === 'recipe' ? c.vertical === 'food' : c.vertical === 'dance',
  )

  const defaultCommunity = communitySlug || filteredCommunities[0]?.slug

  return (
    <main className="subpage">
      <PageHero
        eyebrow={challenge ? 'Challenge entry' : communityInfo ? 'Community post' : 'Create'}
        title={
          challenge
            ? `Submit to ${challenge.title}`
            : communityInfo
              ? `Post to ${communityInfo.name}`
              : type === 'recipe'
                ? 'Share a recipe'
                : 'Drop a move'
        }
        lede={
          challenge
            ? `Publish to ${challenge.communityName ?? 'the challenge community'} — your post can be submitted automatically if you've entered.`
            : communityInfo
              ? `Share with the ${communityInfo.name} community — recipes, moves, and stories stay scoped to your people.`
              : 'Upload a cover image or video, or paste a video URL for dance clips.'
        }
        actions={
          challenge ? (
            <Link href={`/challenges/${challenge.id}`} className="btn btn--outline">
              Back to challenge
            </Link>
          ) : communityInfo ? (
            <Link href={`/community/${communityInfo.slug}`} className="btn btn--outline">
              Back to community
            </Link>
          ) : null
        }
      />

      <section className="content-wrap content-wrap--narrow">
        {challenge ? (
          <div className="challenge-create-banner">
            <span className="tag">{challenge.type}</span>
            <p>
              {challenge.entered
                ? `+${challenge.submissionReward ?? 25} bonus points when this posts as your challenge entry.`
                : 'Enter the challenge from its detail page before publishing to earn submission credit.'}
            </p>
          </div>
        ) : null}

        {communityInfo ? (
          <div className="challenge-create-banner community-create-banner">
            <span className={`tag ${communityInfo.vertical === 'food' ? 'tag--food' : 'tag--dance'}`}>
              {communityInfo.name}
            </span>
            <p>Posts from this form are scoped to the {communityInfo.name} community.</p>
          </div>
        ) : null}

        {!challenge && !communityInfo ? (
          <div className="create-tabs">
            <button type="button" className={`chip ${type === 'recipe' ? 'chip--active' : ''}`} onClick={() => setType('recipe')}>
              Recipe
            </button>
            <button type="button" className={`chip ${type === 'move' ? 'chip--active' : ''}`} onClick={() => setType('move')}>
              Dance clip
            </button>
          </div>
        ) : null}

        <form className="create-form auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input name="title" required placeholder={type === 'recipe' ? 'Fire-roasted salsa bowl' : 'Kitchen island groove'} />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea name="description" rows={3} placeholder="Tell the story behind this post…" />
          </label>

          <FileUpload
            label={type === 'recipe' ? 'Recipe photo' : 'Cover image'}
            accept="image/*"
            onUploaded={setImageUrl}
          />

          <label className="field">
            <span>Community</span>
            <select
              name="communitySlug"
              required
              value={defaultCommunity}
              onChange={(e) => setCommunitySlug(e.target.value)}
            >
              {filteredCommunities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>

          {type === 'recipe' ? (
            <>
              <div className="field-row">
                <label className="field">
                  <span>Time</span>
                  <input name="time" defaultValue="25 min" />
                </label>
                <label className="field">
                  <span>Level</span>
                  <select name="level" defaultValue="Easy">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Ingredients (one per line)</span>
                <textarea name="ingredients" rows={4} placeholder={'Tomatoes\nLime\nCilantro'} />
              </label>
              <label className="field">
                <span>Steps (one per line)</span>
                <textarea name="steps" rows={4} placeholder={'Prep ingredients\nCook and plate\nShare your story'} />
              </label>
            </>
          ) : (
            <>
              <div className="field-row">
                <label className="field">
                  <span>Style</span>
                  <select name="style" defaultValue="Freestyle">
                    <option>Freestyle</option>
                    <option>Hip-hop</option>
                    <option>House</option>
                    <option>Battle</option>
                    <option>Contemporary</option>
                  </select>
                </label>
                <label className="field">
                  <span>Length</span>
                  <input name="length" defaultValue="30s" />
                </label>
              </div>
              <FileUpload
                label="Upload dance video (optional)"
                accept="video/mp4,video/webm"
                previewType="video"
                onUploaded={setUploadedVideoUrl}
              />
              <label className="field">
                <span>Or paste video URL</span>
                <input
                  name="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
            </>
          )}

          <label className="field">
            <span>Country</span>
            <input name="country" defaultValue={user?.country ?? ''} />
          </label>

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
            {loading ? 'Publishing…' : challenge ? 'Publish challenge entry' : 'Publish to Lyfstyl'}
          </button>
        </form>
      </section>
    </main>
  )
}
