import { useEffect, useState } from 'react'
import { movieApi, reviewApi } from './api'
import StarRating from './StarRating'

const GENRE_LABELS = {
  action: '액션',
  drama: '드라마',
  comedy: '코미디',
  thriller: '스릴러',
  romance: '로맨스',
  sf: 'SF',
  horror: '공포',
  animation: '애니메이션',
}

export default function Dashboard({ user, onLogout }) {
  const [movies, setMovies] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ title: '', content: '', rating: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [moviesRes, reviewsRes] = await Promise.all([
        movieApi.list(),
        reviewApi.list(),
      ])
      const movieData = moviesRes.data.results || moviesRes.data
      const reviewData = reviewsRes.data.results || reviewsRes.data
      setMovies(movieData)
      setReviews(reviewData)
    } catch (err) {
      setMessage({ type: 'error', text: '데이터를 불러오지 못했습니다. 서버 확인이 필요합니다.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    onLogout()
  }

  const handleSubmitReview = async () => {
    if (!selectedMovieId) {
      setMessage({ type: 'error', text: '리뷰할 영화를 선택해주세요.' })
      return
    }
    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      setMessage({ type: 'error', text: '제목과 내용을 모두 입력해주세요.' })
      return
    }
    if (reviewForm.rating === 0) {
      setMessage({ type: 'error', text: '평점을 선택해주세요.' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      await reviewApi.create({
        movie: selectedMovieId,
        title: reviewForm.title,
        content: reviewForm.content,
        rating: reviewForm.rating,
      })
      setReviewForm({ title: '', content: '', rating: 0 })
      setSelectedMovieId(null)
      setMessage({ type: 'success', text: '리뷰가 등록되었습니다.' })
      await loadData()
    } catch (err) {
      const data = err.response?.data
      let text = '리뷰 등록 실패'
      if (data) {
        const messages = []
        for (const key in data) {
          const val = Array.isArray(data[key]) ? data[key].join(', ') : data[key]
          messages.push(typeof val === 'string' ? val : JSON.stringify(val))
        }
        text = messages.join(' / ')
      }
      setMessage({ type: 'error', text })
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMovie = movies.find((m) => m.id === selectedMovieId)

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-mark">Cinephile</span>
          <span className="logo-sub">est. 2026</span>
        </div>
        <div className="user-area">
          <span>welcome,&nbsp;<span className="user-name">{user.nickname}</span></span>
          <button className="ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      {message && (
        <div className={message.type === 'error' ? 'error-msg' : 'success-msg'}>
          {message.text}
        </div>
      )}

      <section className="section">
        <span className="section-eyebrow">Now showing</span>
        <h2 className="section-title">영화 컬렉션</h2>
        {loading ? (
          <div className="loading">Loading the collection...</div>
        ) : movies.length === 0 ? (
          <div className="empty-state">아직 등록된 영화가 없습니다.<br/>관리자 페이지에서 영화를 추가해주세요.</div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className={`movie-card ${selectedMovieId === movie.id ? 'selected' : ''}`}
                onClick={() => setSelectedMovieId(movie.id)}
              >
                <div className="movie-poster">
                  <span className="poster-mark">{movie.title?.charAt(0) || '?'}</span>
                </div>
                <div className="movie-info">
                  <div className="movie-genre">
                    {GENRE_LABELS[movie.genre] || movie.genre}
                  </div>
                  <div className="movie-title">{movie.title}</div>
                  <div className="movie-meta">
                    {movie.director} · {movie.release_year}
                  </div>
                  <div className="movie-rating">
                    <span className="rating-value">
                      {movie.average_rating ? Number(movie.average_rating).toFixed(1) : '—'}
                    </span>
                    <StarRating value={Math.round(movie.average_rating || 0)} readonly />
                    <span className="rating-count">
                      {movie.review_count || 0} reviews
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="divider-ornament"><span>✦</span></div>

      <section className="section">
        <span className="section-eyebrow">Your turn</span>
        <h2 className="section-title">리뷰 작성</h2>
        <div className="review-form">
          <div className="form-group">
            <label>Selected movie</label>
            {selectedMovie ? (
              <div style={{
                padding: '14px 16px',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent)',
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: 'var(--accent-strong)',
              }}>
                {selectedMovie.title} <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>({selectedMovie.release_year})</span>
              </div>
            ) : (
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-elevated)',
                border: '1px dashed var(--border-strong)',
                color: 'var(--text-tertiary)',
                fontSize: 13,
              }}>
                위에서 영화를 선택해주세요
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Rating</label>
            <StarRating
              value={reviewForm.rating}
              onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              placeholder="리뷰 제목"
            />
          </div>

          <div className="form-group">
            <label>Your thoughts</label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
              placeholder="감상평을 자유롭게 작성해주세요"
            />
          </div>

          <button
            className="primary"
            style={{ width: '100%', padding: '14px' }}
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? '등록 중...' : 'Publish review'}
          </button>
        </div>
      </section>

      <div className="divider-ornament"><span>✦</span></div>

      <section className="section">
        <span className="section-eyebrow">Recent entries</span>
        <h2 className="section-title">최근 리뷰</h2>
        {reviews.length === 0 ? (
          <div className="empty-state">아직 작성된 리뷰가 없습니다.<br/>첫 리뷰를 남겨보세요.</div>
        ) : (
          <div className="review-list">
            {reviews.slice(0, 10).map((review) => (
              <article key={review.id} className="review-item">
                <div className="review-header">
                  <div>
                    <h3 className="review-title">{review.title}</h3>
                    <div className="review-meta">
                      <span className="author">{review.user_nickname}</span>
                      &nbsp;·&nbsp;{review.movie_title}
                    </div>
                  </div>
                  <StarRating value={review.rating} readonly />
                </div>
                <p className="review-content">{review.content}</p>
                <div className="review-footer">
                  <span>♥ {review.like_count || 0}</span>
                  <span>댓글 {review.comment_count || 0}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
