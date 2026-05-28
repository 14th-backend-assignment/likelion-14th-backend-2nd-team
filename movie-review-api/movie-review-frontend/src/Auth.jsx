import { useState } from 'react'
import { authApi } from './api'

export default function Auth({ onAuth }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({
    username: '',
    email: '',
    nickname: '',
    password: '',
    password_confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (tab === 'signup') {
        res = await authApi.signup(form)
        const { access, refresh, user } = res.data
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        onAuth(user)
      } else {
        res = await authApi.login({
          username: form.username,
          password: form.password,
        })
        const { access, refresh } = res.data
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        const me = await authApi.me()
        onAuth(me.data)
      }
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const messages = []
        for (const key in data) {
          const val = Array.isArray(data[key]) ? data[key].join(', ') : data[key]
          messages.push(typeof val === 'string' ? val : JSON.stringify(val))
        }
        setError(messages.join(' / ') || '오류가 발생했습니다')
      } else {
        setError('서버에 연결할 수 없습니다. Django 서버가 켜져 있는지 확인하세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="auth-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-mark" style={{ fontSize: 40 }}>Cinephile</div>
          <div className="logo-sub" style={{ marginTop: 6 }}>Movie review journal</div>
        </div>

        <div className="auth-tabs">
          <div
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Sign in
          </div>
          <div
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Sign up
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="username"
            autoComplete="username"
          />
        </div>

        {tab === 'signup' && (
          <>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Nickname</label>
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="표시될 이름"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {tab === 'signup' && (
          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        )}

        <button
          className="primary"
          style={{ width: '100%', padding: '14px', marginTop: '0.5rem' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '잠시만요...' : (tab === 'signup' ? 'Create account' : 'Sign in')}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: 'var(--text-tertiary)' }}>
          Django API · localhost:8000
        </div>
      </div>
    </div>
  )
}
