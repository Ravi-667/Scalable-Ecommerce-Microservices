import React from 'react'
import { auth } from '../services/api'

export default function Login() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const r = await auth.login({ email, password })
      localStorage.setItem('token', r.token)
      alert('Logged in')
      window.location.href = '/'
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <div>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button>Login</button>
    </form>
  )
}
