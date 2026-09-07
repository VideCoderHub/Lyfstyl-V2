export default function LearningSection({ classes = [] }) {
  if (!classes.length) return null

  return (
    <section className="learning-section" id="classes">
      <div className="section-head comm-section-head">
        <div>
          <p className="section-eyebrow">Learning centre</p>
          <h2>Classes & tutorials</h2>
        </div>
      </div>
      <div className="learning-grid">
        {classes.map((lesson) => (
          <article key={lesson.id} className="learning-card">
            <div className="learning-card__image" style={{ backgroundImage: `url(${lesson.image})` }} />
            <div className="learning-card__body">
              <span className="tag">{lesson.format === 'live' ? 'Live class' : 'Video lesson'}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <p className="learning-card__meta">
                {lesson.duration} · {lesson.level}
                {lesson.instructorName ? ` · ${lesson.instructorName}` : ''}
              </p>
              <button type="button" className="btn btn--primary btn--sm">
                {lesson.price ? `Enroll — $${lesson.price}` : 'Start free'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
