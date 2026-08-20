import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ConnectButton from '../components/ConnectButton'
import FollowButton from '../components/FollowButton'
import MediaCard from '../components/MediaCard'
import PageHero from '../components/PageHero'
import { CardGridSkeleton } from '../components/Skeleton'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function CreatorProfilePage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('none')
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getMember(id)
      .then((data) => {
        setProfile(data)
        setConnectionStatus(data.connectionStatus ?? 'none')
        setIsFollowing(Boolean(data.isFollowing))
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="subpage">
        <div className="content-wrap"><CardGridSkeleton count={4} /></div>
      </main>
    )
  }

  if (!profile?.member) {
    return (
      <main className="subpage">
        <div className="content-wrap">
          <p className="form-message form-message--error">Creator not found.</p>
          <Link to="/community" className="btn btn--outline">Back to community</Link>
        </div>
      </main>
    )
  }

  const { member, recipes, moves } = profile
  const isOwnProfile = isAuthenticated && user?.id === member.id

  return (
    <main className="subpage">
      <PageHero
        eyebrow="Creator profile"
        title={member.name}
        lede={member.bio || `Creating on Lyfstyl from ${member.country}.`}
        actions={
          <div className="profile-hero__actions">
            <span className="tag">
              {member.points} pts · {member.followerCount ?? 0} followers · {member.connectionCount ?? 0} connections · {member.country}
            </span>
            {isOwnProfile ? (
              <Link to="/profile" className="btn btn--primary">Edit profile</Link>
            ) : (
              <>
                <FollowButton
                  userId={member.id}
                  initialFollowing={isFollowing}
                  onChange={(following) => setIsFollowing(following)}
                />
                <ConnectButton userId={member.id} initialStatus={connectionStatus} onStatusChange={setConnectionStatus} />
              </>
            )}
          </div>
        }
      />

      <section className="content-wrap">
        <div className="profile-stats-row">
          <div className="dash-stat"><strong>{member.recipeCount ?? recipes.length}</strong><span>Recipes</span></div>
          <div className="dash-stat"><strong>{member.moveCount ?? moves.length}</strong><span>Moves</span></div>
          <div className="dash-stat"><strong>{member.followerCount ?? 0}</strong><span>Followers</span></div>
          <div className="dash-stat"><strong>{member.followingCount ?? 0}</strong><span>Following</span></div>
          <div className="dash-stat"><strong>{member.connectionCount ?? 0}</strong><span>Connections</span></div>
        </div>

        {recipes?.length ? (
          <>
            <div className="section-head"><h2>Recipes</h2></div>
            <div className="card-grid card-grid--stagger">
              {recipes.map((recipe) => (
                <MediaCard
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  image={recipe.image}
                  tag="Recipe"
                  tagClass="tag--food"
                  title={recipe.title}
                  meta={recipe.time}
                />
              ))}
            </div>
          </>
        ) : null}

        {moves?.length ? (
          <>
            <div className="section-head"><h2>Moves</h2></div>
            <div className="card-grid card-grid--portrait card-grid--stagger">
              {moves.map((move) => (
                <MediaCard
                  key={move.id}
                  to={`/moves/${move.id}`}
                  image={move.image}
                  tag="Move"
                  tagClass="tag--dance"
                  title={move.title}
                  meta={move.style}
                  portrait
                  play
                />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}
